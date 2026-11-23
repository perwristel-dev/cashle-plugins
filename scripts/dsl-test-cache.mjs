import { randomUUID } from 'node:crypto';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const runnerVersion = '0.1.0';

export function runnerDirectory(cache, sha256) {
  if (sha256 === undefined) return join(cache, `runner-${runnerVersion}`);
  if (typeof sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(sha256))
    throw new Error('Invalid SHA-256 for the Cashle runner');
  return join(cache, `runner-${runnerVersion}-${sha256}`);
}

export async function runPreparedScenario(scenario, { lock, ...options }) {
  const contents = await readFile(lock, 'utf8');
  const { runnerSha256 } = JSON.parse(contents);
  const runtime = runnerDirectory(dirname(lock), runnerSha256);
  // The runner and plugin set must be selected from the same lock revision.
  // The sibling path keeps the runner's plugin cache lookup unchanged.
  const snapshot = `${lock}.${randomUUID()}`;
  try {
    await writeFile(snapshot, contents, { flag: 'wx' });
    const { runScenario } = await import(pathToFileURL(join(runtime, 'run.mjs')));
    return await runScenario(scenario, { ...options, lock: snapshot });
  } finally {
    await rm(snapshot, { force: true });
  }
}
