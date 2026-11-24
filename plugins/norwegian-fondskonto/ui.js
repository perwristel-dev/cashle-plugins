const language = 'groovy-cashle-plugin';
const provider = 'cashle.finance.no-fondskonto';

export default function createPlugin(context) {
  return { modules: [context.investmentAccount({
    type: 'cashlab.no-fondskonto', version: 1, pluginId: provider, country: 'NO', kind: 'NOfondskonto',
    label: 'Fondskonto', help: 'help', translations: context.translations,
    defaults: { policyOptions: { equityShare: null, verifiedShielding: 0 }, openingState: {
      appliedEquityThisYear: 0, appliedInterestThisYear: 0,
    } },
    policyFields: [
      { key: 'equityShare', label: 'field.equity', kind: 'number', required: true, min: 0, max: 100, help: 'help.equity' },
      { key: 'verifiedShielding', label: 'field.shielding', kind: 'number', min: 0, money: true, help: 'help.shielding' },
    ],
    stateFields: [
      { key: 'appliedEquityThisYear', label: 'field.pastEquity', kind: 'number', min: 0, money: true, help: 'help.history' },
      { key: 'appliedInterestThisYear', label: 'field.pastInterest', kind: 'number', min: 0, money: true, help: 'help.history' },
    ],
    features: { basis: true, plannedSales: false, dividendsReinvest: true, dividendsMustReinvest: true, canAdd: true,
      history: ['deposits', 'withdrawals', 'realizedGain', 'realizedLoss'] },
    validateOptions(options) {
      const errors = [];
      if (!Number.isFinite(options.equityShare) || options.equityShare < 0 || options.equityShare > 100)
        errors.push('invalid.equity');
      if (!Number.isFinite(options.verifiedShielding) || options.verifiedShielding < 0)
        errors.push('invalid.shielding');
      return errors;
    },
    sourceModule: { language, provider, source: 'norwegian-fondskonto.cashle', dependencies: [
      { language, provider: 'cashle.finance.no-fondskonto.policy', source: 'norwegian-fondskonto-tax.cashle' },
    ] },
    usageModel: 'identity',
  })] };
}
