import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createSourcePlugin } from '../plugins/build-source-plugin.mjs';

const cache = resolve('.cashle-tests');
const version = '0.1.0';
const artifact = `cashle-dsl-test-runner-${version}.zip`;
const base = process.env.CASHLE_MAVEN_URL ?? 'https://cashle-lab.com/maven/';
const url = new URL(`dev/cashle/cashle-dsl-test-runner/${version}/${artifact}`, base);
const runtime = join(cache, `runner-${version}`);
await mkdir(cache, { recursive: true });

async function fetchFile(address) {
  const response = await fetch(address, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Could not download ${address}: HTTP ${response.status}`);
  return response;
}

try {
  await readFile(join(runtime, 'run.mjs'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  const temporary = await mkdtemp(join(cache, 'runner-'));
  try {
    const localZip = process.env.CASHLE_DSL_RUNNER_ZIP;
    const bytes = localZip ? await readFile(localZip) : Buffer.from(await (await fetchFile(url)).arrayBuffer());
    if (!localZip) {
      const sha256 = (await (await fetchFile(url.href + '.sha256')).text()).trim();
      if (createHash('sha256').update(bytes).digest('hex') !== sha256)
        throw new Error('Invalid SHA-256 for the Cashle runner');
    }
    await writeFile(join(temporary, artifact), bytes);
    const jar = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'jar') : 'jar';
    const result = spawnSync(jar, ['xf', artifact], { cwd: temporary, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error('Could not unpack the Cashle runner');
    await rm(join(temporary, artifact));
    await rename(temporary, runtime);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

const { preparePlugins } = await import(pathToFileURL(join(runtime, 'run.mjs')).href);
const directories = (process.env.CASHLE_TEST_CATALOG_DIRS ?? '').split(process.platform === 'win32' ? ';' : ':').filter(Boolean);
const defaults = [
  'https://cashle-lab.com/plugin-catalog/',
  'https://perwristel-dev.github.io/cashle-plugins/plugins/',
];
for (const entry of await readdir('plugins', { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const directory = resolve('plugins', entry.name);
  const raw = await readFile(join(directory, 'test/dependencies.json'), 'utf8').catch(error => {
    if (error.code !== 'ENOENT') throw error;
  });
  if (raw === undefined) continue;
  const config = JSON.parse(raw);
  const local = await createSourcePlugin(directory, 1);
  const temporary = await mkdtemp(join(cache, 'plugin-'));
  try {
    const archive = join(temporary, 'plugin.zip');
    await writeFile(archive, local.bytes);
    await preparePlugins({
      directories,
      catalogs: directories.length ? [] : [...new Set([...defaults, ...(config.catalogs ?? [])])],
      archives: [archive],
      plugins: config.plugins ?? [],
    }, join(cache, entry.name + '.lock.json'));
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
