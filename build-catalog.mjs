import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { createSourcePlugin, readPluginRelease } from './plugins/build-source-plugin.mjs';

const root = fileURLToPath(new URL('./plugins/', import.meta.url));
const output = fileURLToPath(new URL('./dist/plugins/', import.meta.url));
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const { values } = parseArgs({ options: {
  'run-number': { type: 'string' }, previous: { type: 'string' }, release: { type: 'string' },
} });
const runNumber = values['run-number'] && Number(values['run-number']);
if (values['run-number'] && (!Number.isSafeInteger(runNumber) || runNumber < 1 || runNumber > 1_000_000_000))
  throw new Error('Invalid CI run number');

const previous = new Map();
if (values.previous) {
  const response = await fetch(values.previous, { signal: AbortSignal.timeout(30_000), redirect: 'error' });
  if (response.status !== 404) {
    if (!response.ok) throw new Error(`Could not read earlier catalog (${response.status})`);
    const old = await response.json();
    if (old.version !== 1 || !Array.isArray(old.plugins)) throw new Error('Invalid earlier catalog');
    for (const entry of old.plugins) {
      if (!Number.isSafeInteger(entry.version) || entry.version < 1 || !/^[a-f0-9]{64}$/.test(entry.sha256))
        throw new Error('Invalid earlier package version');
      previous.set(entry.id, entry);
    }
  }
}

if (values.release && !slugPattern.test(values.release)) throw new Error('Invalid plugin directory');
const directories = (await readdir(root, { withFileTypes: true }))
  .filter(entry => entry.isDirectory() && slugPattern.test(entry.name)).map(entry => entry.name).sort();
if (values.release && !directories.includes(values.release)) throw new Error('Unknown plugin');
const seen = new Set();
const plugins = [];
await mkdir(output, { recursive: true });
for (const slug of values.release ? [values.release] : directories) {
  const directory = join(root, slug);
  const metadata = await readPluginRelease(directory);
  const { country, category, description, name, names, releases } = metadata;
  const config = JSON.parse(await readFile(join(directory, 'plugin.json'), 'utf8'));
  if (!/^cashle\.[A-Za-z0-9_.-]+$/.test(config.id) || seen.has(config.id)) throw new Error(`Invalid or duplicate plugin ID: ${slug}`);
  seen.add(config.id);
  const prior = previous.get(config.id);
  let version = Math.max(prior?.version ?? 0, releases.length);
  let plugin = version && await createSourcePlugin(directory, version);
  const unchanged = plugin && (prior?.version === version ? prior.sha256 : releases.at(-1)) === plugin.sha256;
  if (!unchanged) {
    if (values.release) {
      version++;
      plugin = await createSourcePlugin(directory, version);
      releases.push(plugin.sha256);
      await writeFile(join(directory, 'catalog.json'), `${JSON.stringify(metadata, null, 2)}\n`);
    } else if (runNumber) {
      version = Math.max(version + 1, 1_000 + runNumber);
      plugin = await createSourcePlugin(directory, version);
    } else throw new Error(`Release required: node build-catalog.mjs --release ${slug}`);
  }
  if (values.release) {
    console.log(`${slug} v${version}`);
    continue;
  }
  const manifest = JSON.parse(await readFile(join(directory, 'plugin.json'), 'utf8'));
  const path = `${slug}-v${version}.zip`;
  const history = [...new Set([...(prior?.archiveHistory ?? []), prior?.sha256, ...releases])]
    .filter(hash => hash && hash !== plugin.sha256);
  plugins.push({
    id: plugin.id, name, description, version, path, sha256: plugin.sha256,
    ...(names ? { names } : {}),
    ...(country ? { country } : {}), ...(category ? { category } : {}),
    ...(manifest.replaces?.some(id => id !== plugin.id) ? { replaces: manifest.replaces } : {}),
    ...(plugin.visibility ? { visibility: plugin.visibility } : {}),
    ...(plugin.visibility === 'public' && history.length ? { archiveHistory: history } : {}),
  });
  await writeFile(join(output, path), plugin.bytes);
}
if (!values.release) {
  await writeFile(join(output, 'index.json'), `${JSON.stringify({ version: 1, plugins }, null, 2)}\n`);
  console.log(`Packaged ${plugins.length} plugins in dist/plugins`);
}
