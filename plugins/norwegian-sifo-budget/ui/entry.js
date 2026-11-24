const provider = 'cashle.finance.budget.no.sifo';

export default function createPlugin(context) {
  const fields = [
    { key: 'name', kind: 'text', label: 'name', default: 'label' },
    { key: 'extraPercent', kind: 'number', label: 'adjustment', default: 0, min: -100, unit: '%', forecastEditable: true },
    { key: 'osloTransit', kind: 'check', label: 'transport', default: false, forecastEditable: true },
  ];
  const budget = context.schemaModule({
    id: 'norwegian-sifo-budget', label: 'label', category: 'expenses', taxCountries: ['NO'],
    fields, inlineFields: fields, sections: [], creationData: () => ({ name: context.translate('label') }),
    engineInput(input, { model }) {
      const timeReferences = (context.casePlan(model).milestones ?? []).filter(row => row.builtin === 'life')
        .map(row => ({ reference: 'life', personId: row.personId }));
      return { input, timeReferences };
    },
    summarize: data => ({ title: data.name, detail: context.translate('summary') }),
  });
  return { modules: [{ ...budget, pluginId: provider, usageModel: 'identity', translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'norwegian-sifo-budget.cashle' },
  }] };
}
