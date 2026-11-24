import assert from 'node:assert/strict';
import { test } from 'node:test';
import { consumerBudgetDefinition, consumerBudgetEngineInput, consumerBudgetReferenceInput } from '../ui.js';

const plan = {
  from: '2026-01-01',
  milestones: [
    { id: 'life:self', builtin: 'life', personId: 'self', rule: { type: 'date', date: '2050-01-01' } },
    { id: 'life:partner', builtin: 'life', personId: 'partner', rule: { type: 'date', date: '2040-01-01' } },
  ],
};
const model = { plan, profile: { mode: 'couple', people: [] } };

test('consumer budget removes the household editor and drops saved event overrides', () => {
  const definition = consumerBudgetDefinition({
    translate: key => key,
    savingsFundingFields: () => [],
  });
  assert.ok(!definition.sections.some(section => section.id === 'household-events'));
  const oldData = {
    name: 'Budget', selfDeathDate: '2026-01-01', partnerDeathDate: '2026-01-01',
    partnerSeparationDate: '2026-01-01', childEvents: [{ childId: 'child', deathDate: '2026-01-01' }],
  };
  assert.deepEqual(definition.normalizeData(oldData), { name: 'Budget', splitCategories: false });
  assert.deepEqual(consumerBudgetEngineInput(oldData, { model }), {
    input: { name: 'Budget' },
    timeReferences: [{ reference: 'life', personId: 'self' }, { reference: 'life', personId: 'partner' }],
  });
});

test('consumer budget reference resolves both life milestones from the plan', () => {
  const input = consumerBudgetReferenceInput(model, {
    casePlan: value => value.plan,
    sourceResidenceChanges: () => [],
    resolveTimeDate: (time, value) => value.plan.milestones.find(row => row.id === `${time.reference}:${time.personId}`).rule.date,
  });
  assert.deepEqual(input.lifeEnds, { self: '2050-01-01', partner: '2040-01-01' });
  assert.deepEqual(input.profile, model.profile);
});
