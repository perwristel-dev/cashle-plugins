import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

test('Finnish transfer tax includes housing-company debt and posts the buyer share on signing', () => {
  const model = fileURLToPath(new URL('../doc/direct-model.cashle', import.meta.url));
  const output = execFileSync(process.env.CASHLE_CLI || 'cashle', [model], { encoding: 'utf8' });
  const reports = output.trim().split(/\r?\n/).map(line => JSON.parse(line));
  const balance = reports.find(report => report.rows?.some(row => row.report === 'balancesheet'));
  const annual = reports.find(report => report.annual)?.annual;

  // Monthly income is EUR 10,000. The only expense is the tax on the buyer's
  // 50% share of the EUR 200,000 debt-free price, charged at 1.5%.
  assert.deepEqual(
    balance?.rows.filter(row => row.date.startsWith('2026-06-')).map(({ date, value }) => [date, value]),
    [['2026-06-01', 60000], ['2026-06-15', 58500]],
  );
  assert.deepEqual(annual?.map(({ year, expenses }) => [year, expenses]), [[2026, 1500]]);
});
