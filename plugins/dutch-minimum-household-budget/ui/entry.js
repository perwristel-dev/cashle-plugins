const provider = 'cashle.finance.budget.nl';
const type = 'cashlab.dutch-minimum-household-budget';
const householdOptions = ['single-0', 'single-1', 'single-2', 'single-3', 'couple-0', 'couple-1', 'couple-2', 'couple-3',
  'aow-single', 'aow-couple'].map(id => [id, `option.${id}`]);

export default function createPlugin(context) {
  const { translate: t, savingsFundingFields, savingsFundingSummary } = context;
  const module = context.schemaModule({
    id: 'dutch-minimum-household-budget', category: 'expenses', label: 'label', help: 'help.scope',
    fields: [
      { key: 'name', kind: 'text', label: 'field.name', default: t('label') },
      { key: 'household', kind: 'select', label: 'field.household', default: 'single-0', options: householdOptions, forecastEditable: true },
      { key: 'includeReferenceRent', kind: 'check', label: 'field.rent', default: false, forecastEditable: true, help: 'help.rent' },
    ],
    sections: [{ id: 'funding', title: 'field.funding', fields: savingsFundingFields('core'),
      summary: data => savingsFundingSummary(data, 'core') }],
    validateLinks(model) {
      return model.modules.filter(entry => entry.type === type && entry.enabled !== false).length <= 1
        ? [] : ['invalid.duplicate'];
    },
    engineInput: data => ({ input: data }),
    summarize(data) {
      return { title: data.name, amount: t(`option.${data.household}`),
        detail: t(data.includeReferenceRent ? 'summary.withRent' : 'summary.withoutRent') };
    },
  });
  return { modules: [{ ...module, pluginId: provider, usageModel: 'identity', translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'dutch-minimum-household-budget.cashle' },
  }] };
}
