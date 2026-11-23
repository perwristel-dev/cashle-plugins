import { isUtf8 } from 'node:buffer';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { zipFiles } from './write-zip.mjs';

function packageBytes(bytes, verbatim) {
  if (verbatim || bytes.includes(0) || !isUtf8(bytes)) return bytes;
  return Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'));
}

const language = 'groovy-cashle-plugin';
const assetPath = /^[A-Za-z0-9][A-Za-z0-9._-]*(?:\/[A-Za-z0-9][A-Za-z0-9._-]*)*$/;
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');

export async function readPluginRelease(directory, { optional = false } = {}) {
  const path = join(directory, 'catalog.json');
  const raw = await readFile(path, 'utf8').catch((error) => {
    if (optional && error.code === 'ENOENT') return null;
    throw error;
  });
  if (raw === null) return null;
  const metadata = JSON.parse(raw);
  const { name, description, releases, country, category, defaultLanguage, publicLanguageDownload } = metadata;
  const nonempty = (value) => typeof value === 'string' && !!value.trim();
  if (!nonempty(name) || !nonempty(description?.sv) || !nonempty(description?.en)
    || !Array.isArray(releases) || releases.some((hash) => !/^[a-f0-9]{64}$/.test(hash))
    || (country !== undefined && (typeof country !== 'string' || !/^[A-Z]{2}$/.test(country)))
    || (category !== undefined && (typeof category !== 'string' || !/^[a-z][a-z-]{0,31}$/.test(category)))
    || (defaultLanguage !== undefined && (defaultLanguage !== true || category !== 'language'))
    || (publicLanguageDownload !== undefined && (publicLanguageDownload !== true || category !== 'language'))) {
    throw new Error(`Invalid plugin release metadata: ${path}`);
  }
  return metadata;
}

export async function createSourcePlugin(directory, packageVersion) {
  const config = JSON.parse(await readFile(join(directory, 'plugin.json'), 'utf8'));
  if ((config.engineProjects ?? []).length || config.uiBuild !== undefined)
    throw new Error('This catalog only accepts plugins that need no compilation.');
  const sources = config.sources ?? [];
  const assets = new Map();
  async function asset(path) {
    if (typeof path !== 'string' || !assetPath.test(path) || path === 'bundle.json') {
      throw new Error(`Invalid plugin asset path: ${path}`);
    }
    if (!assets.has(path)) {
      const raw = await readFile(join(directory, path));
      // Package UTF-8 text identically in LF and CRLF Git checkouts.
      const bytes = packageBytes(raw, config.verbatimAssets?.includes(path));
      const entry = { path, size: bytes.length, sha256: digest(bytes) };
      assets.set(path, { entry, bytes });
    }
    return assets.get(path).entry;
  }

  const manifest = { version: 1, id: config.id, uiApiVersion: 2, requires: config.requires ?? [] };
  if (packageVersion) manifest.packageVersion = packageVersion;
  if (config.engineLanguages !== undefined) manifest.engineLanguages = config.engineLanguages;
  if (config.languageOnly !== undefined) manifest.languageOnly = config.languageOnly;
  if (config.uiCapabilities !== undefined) manifest.uiCapabilities = config.uiCapabilities;
  if (config.workspacePages !== undefined) manifest.workspacePages = config.workspacePages;
  if (config.ui) {
    manifest.ui = await asset(config.ui);
    manifest.uiTranslations = config.uiTranslations ?? [];
    const paths = new Set([...(config.uiAssets ?? []), ...manifest.uiTranslations.map(({ path }) => path)]);
    if (paths.has(manifest.ui.path)) throw new Error(`Duplicate plugin UI entry: ${manifest.ui.path}`);
    manifest.uiAssets = [];
    for (const path of paths) manifest.uiAssets.push(await asset(path));
  }
  const boundary = await readFile(join(directory, 'plugin-boundary.properties'), 'utf8').catch((error) => {
    if (error.code === 'ENOENT') return '';
    throw error;
  });
  const replacements = config.replaces ?? (/^plugin\.id=/m.test(boundary)
    ? [...new Set([config.id, ...sources.flatMap((source) => source.providers ?? [])])] : []);
  if (replacements.length) manifest.replaces = replacements;
  const resourceNames = new Set();
  manifest.sources = [];
  manifest.sourceProviders = [];
  const sourceFiles = new Map(sources.map((source) => [source.path, source]));
  for (const source of sources) {
    for (const dependency of source.dependencies ?? []) {
      if (!sourceFiles.has(dependency)) sourceFiles.set(dependency, { path: dependency });
    }
  }
  for (const source of sourceFiles.values()) {
    const entry = { ...await asset(source.path), provider: language };
    if (source.dependencies?.length) entry.dependencies = source.dependencies;
    if (source.imports) entry.imports = source.imports;
    if (source.resources?.length) {
      entry.resources = source.resources;
      for (const path of source.resources) resourceNames.add(path);
    }
    manifest.sources.push(entry);
    for (const id of source.providers ?? []) {
      manifest.sourceProviders.push({ version: 1, id, source: source.path });
    }
  }
  manifest.sourceResources = [];
  for (const path of resourceNames) manifest.sourceResources.push(await asset(path));
  if (config.sourceExports) manifest.sourceExports = config.sourceExports;
  if (manifest.sources.length
      && [...assets.values()].every(({ bytes }) => !bytes.includes(0) && isUtf8(bytes))) {
    manifest.visibility = 'public';
  }
  const files = new Map([['bundle.json', Buffer.from(JSON.stringify(manifest, null, 2) + '\n')]]);
  for (const path of [...assets.keys()].sort()) files.set(path, assets.get(path).bytes);
  const bytes = zipFiles(files);
  const sha256 = digest(bytes);
  return { bytes, id: manifest.id, archive: config.archive, sha256, releaseSha256: sha256, visibility: manifest.visibility };
}

export async function checkedSourcePlugin(directory, metadata) {
  const version = metadata?.releases.length;
  const plugin = await createSourcePlugin(directory, version);
  if (metadata && (!version || plugin.releaseSha256 !== metadata.releases.at(-1))) {
    const name = basename(directory);
    throw new Error(`Release required for ${name}; run node build-catalog.mjs --release ${name}`);
  }
  return plugin;
}

export async function packageSourcePlugin(directory, destination) {
  const plugin = await checkedSourcePlugin(directory, await readPluginRelease(directory, { optional: true }));
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, plugin.bytes);
}

export async function buildSourcePlugin(entry) {
  const directory = dirname(fileURLToPath(entry));
  const plugin = await checkedSourcePlugin(directory, await readPluginRelease(directory, { optional: true }));
  const destination = resolve(process.argv[2] ?? join(directory, plugin.archive ?? `${basename(directory)}.zip`));
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, plugin.bytes);
  console.log(destination);
}
