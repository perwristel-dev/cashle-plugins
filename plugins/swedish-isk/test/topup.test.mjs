import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createSourcePlugin } from '../../build-source-plugin.mjs';

test('a local ISK receives a 500 SEK deposit', async () => {
  const work = await mkdtemp(join(tmpdir(), 'cashle-isk-test-'));
  try {
    const runner = new URL('../../../.cashle-tests/runner-0.1.0/run.mjs', import.meta.url);
    const { runScenario } = await import(runner);
    const plugin = await createSourcePlugin(fileURLToPath(new URL('../', import.meta.url)), 1);
    const archive = join(work, 'swedish-isk.zip');
    await writeFile(archive, plugin.bytes);
    const result = await runScenario(fileURLToPath(new URL('./topup.cashle', import.meta.url)), {
      lock: fileURLToPath(new URL('../../../.cashle-tests/swedish-isk.lock.json', import.meta.url)),
      archives: [archive],
    });
    assert.equal(result.accounts.find(({ name }) => name === 'ISK').balance, 1500);
    assert.ok(result.postings.some(({ debit, amount }) => debit === 'ISK' && amount === 500));
  } finally {
    await rm(work, { recursive: true, force: true });
  }
});
