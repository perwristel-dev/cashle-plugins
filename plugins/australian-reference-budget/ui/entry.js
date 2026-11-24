const provider = 'cashle.finance.budget.au';
const type = 'cashlab.australian-reference-budget';
const choices = ids => ids.map(id => [id, `option.${id}`]);
const householdTypes = choices([
  'single-adult', 'single-mother-1', 'single-father-1', 'single-mother-2', 'single-father-2', 'couple-0', 'couple-1', 'couple-2',
]);
const employmentTypes = choices(['full-time', 'part-time', 'single-earner', 'dual-earner', 'unemployed']);

function matchingEmployment(household) {
  if (household === 'single-adult') return ['full-time', 'unemployed'];
  if (household?.startsWith('couple-')) return ['single-earner', 'dual-earner', 'unemployed'];
  return ['full-time', 'part-time', 'unemployed'];
}

export default function createPlugin(context) {
  const { translate: t, savingsFundingFields, savingsFundingSummary } = context;
  const module = context.schemaModule({
    id: 'australian-reference-budget', category: 'expenses', label: 'label', help: 'help.scope',
    fields: [
      { key: 'name', kind: 'text', label: 'field.name', default: t('label') },
      { key: 'household', kind: 'select', label: 'field.household', default: 'single-adult', options: householdTypes, forecastEditable: true },
      { key: 'employment', kind: 'select', label: 'field.employment', default: 'full-time', options: employmentTypes,
        optionsFor: data => employmentTypes.filter(([id]) => matchingEmployment(data.household).includes(id)), forecastEditable: true },
    ],
    sections: [{ id: 'funding', title: 'field.funding', fields: savingsFundingFields('core'),
      summary: data => savingsFundingSummary(data, 'core') }],
    validateData(data) {
      return matchingEmployment(data.household).includes(data.employment) ? [] : ['invalid.household'];
    },
    validateLinks(model) {
      const budgets = model.modules.filter(entry => entry.type === type && entry.enabled !== false);
      return budgets.length <= 1 ? [] : ['invalid.duplicate'];
    },
    engineInput: data => ({ input: data }),
    summarize(data) {
      return { title: data.name, amount: t(`option.${data.household}`), detail: t(`option.${data.employment}`) };
    },
  });
  return { modules: [{
    ...module, pluginId: provider, usageModel: 'identity', translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'australian-reference-budget.cashle' },
  }] };
}
