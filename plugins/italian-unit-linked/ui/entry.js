const provider = 'cashle.finance.it-unit-linked';
const source = 'italian-unit-linked.cashle';

export default function (context) {
  return { modules: [context.investmentAccount({
    type: 'cashlab.italian-unit-linked', pluginId: provider, label: 'Italian unit-linked life insurance',
    country: 'IT', kind: 'ITunitLinked', help: 'help',
    defaults: { policyOptions: { eligibleGovernmentGainPercent: 0 }, openingState: {} },
    policyFields: [
      { key: 'eligibleGovernmentGainPercent', kind: 'number', min: 0, max: 100, unit: '%',
        label: 'governmentShare', help: 'governmentShareHelp' },
    ],
    features: { basis: true, plannedSales: false, dividendsReinvest: true, dividendsMustReinvest: true,
      canAdd: true, history: ['deposits', 'withdrawals', 'dividends'] },
    translations: context.translations,
    sourceModule: {
      language: 'groovy-cashle-plugin', provider, source,
      dependencies: [{ language: 'groovy-cashle-plugin', provider: `${provider}.tax-policy`, source }],
    },
    usageModel: 'identity',
  })] };
}
