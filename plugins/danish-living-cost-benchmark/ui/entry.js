const provider = 'cashle.finance.budget.dk.raadighed';

export default function createPlugin(context) {
  const fields = [
    { key: 'name', kind: 'text', label: 'name', default: 'label' },
    { key: 'extraPercent', kind: 'number', label: 'adjustment', default: 0, min: -100, unit: '%', forecastEditable: true },
  ];
  const budget = context.schemaModule({
    id: 'danish-living-cost-benchmark', label: 'label', category: 'expenses', taxCountries: ['DK'],
    fields, inlineFields: fields, sections: [], creationData: () => ({ name: context.translate('label') }),
    engineInput(input, { model }) {
      const timeReferences = (context.casePlan(model).milestones ?? []).filter(row => row.builtin === 'life')
        .map(row => ({ reference: 'life', personId: row.personId }));
      return { input, timeReferences };
    },
    summarize: data => ({ title: data.name, detail: context.translate('summary') }),
  });
  return { modules: [{ ...budget, pluginId: provider, usageModel: 'identity', translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'danish-living-cost-benchmark.cashle' },
  }] };
}
