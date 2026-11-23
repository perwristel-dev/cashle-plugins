import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createSourcePlugin } from '../plugins/build-source-plugin.mjs';
import { runnerDirectory, runnerVersion } from './dsl-test-cache.mjs';

const cache = resolve('.cashle-tests');
const artifact = `cashle-dsl-test-runner-${runnerVersion}.zip`;
const base = process.env.CASHLE_MAVEN_URL ?? 'https://cashle-lab.com/maven/';
const url = new URL(`dev/cashle/cashle-dsl-test-runner/${runnerVersion}/${artifact}`, base);
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
await mkdir(cache, { recursive: true });

async function fetchFile(address) {
  const response = await fetch(address, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Could not download ${address}: HTTP ${response.status}`);
  return response;
}

const localZip = process.env.CASHLE_DSL_RUNNER_ZIP;
const localBytes = localZip ? await readFile(localZip) : undefined;
const runnerSha256 = localBytes ? sha256(localBytes) : (await (await fetchFile(url.href + '.sha256')).text()).trim();
const runtime = runnerDirectory(cache, runnerSha256);
const cachedRunner = () => access(join(runtime, 'run.mjs')).then(() => true, error => {
  if (error.code !== 'ENOENT') throw error;
  return false;
});
if (!await cachedRunner()) {
  const bytes = localBytes ?? Buffer.from(await (await fetchFile(url)).arrayBuffer());
  if (sha256(bytes) !== runnerSha256) throw new Error('Invalid SHA-256 for the Cashle runner');
  const temporary = await mkdtemp(join(cache, 'runner-'));
  try {
    await writeFile(join(temporary, artifact), bytes);
    const jar = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'jar') : 'jar';
    const result = spawnSync(jar, ['xf', artifact], { cwd: temporary, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error('Could not unpack the Cashle runner');
    await rm(join(temporary, artifact));
    await access(join(temporary, 'run.mjs'));
    try {
      await rename(temporary, runtime);
    } catch (error) {
      // Concurrent preparation can publish the same verified bytes first.
      if (!await cachedRunner()) throw error;
    }
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
  const lock = join(cache, entry.name + '.lock.json');
  const stagedLock = `${lock}.${randomUUID()}`;
  try {
    const archive = join(temporary, 'plugin.zip');
    await writeFile(archive, local.bytes);
    await preparePlugins({
      directories,
      catalogs: directories.length ? [] : [...new Set([...defaults, ...(config.catalogs ?? [])])],
      archives: [archive],
      plugins: config.plugins ?? [],
    }, stagedLock);
    const resolved = JSON.parse(await readFile(stagedLock, 'utf8'));
    await writeFile(stagedLock, JSON.stringify({ ...resolved, runnerSha256 }, null, 2) + '\n');
    await rename(stagedLock, lock);
  } finally {
    await rm(stagedLock, { force: true });
    await rm(temporary, { recursive: true, force: true });
  }
}
