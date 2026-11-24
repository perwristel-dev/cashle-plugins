const provider = 'cashle.finance.fi-capital-redemption';
const source = 'finnish-capital-redemption.cashle';

export default function (context) {
  const t = context.translate;
  const account = context.investmentAccount({
    type: 'cashlab.fi-capital-redemption', kind: 'FIcapitalRedemption', country: 'FI',
    label: 'label', help: 'help.scope', closureOnlyLoss: true, withdrawalProfitHistory: true,
    withdrawalProfitHelp: 'help.historicalGain', prepaidTaxHelp: 'help.withholding',
    defaults: { policyOptions: { ordinaryContractConfirmed: false, holderControlRights: false }, openingState: {} },
    policyFields: [
      { key: 'ordinaryContractConfirmed', label: 'field.ordinaryContractConfirmed', kind: 'check', help: 'help.scope' },
      { key: 'holderControlRights', label: 'field.holderControlRights', kind: 'check', help: 'help.control' },
    ],
    features: { basis: true, plannedSales: false, dividendsReinvest: true, dividendsMustReinvest: true, canAdd: true,
      history: ['openingValue', 'deposits', 'withdrawals', 'dividends', 'realizedGain', 'prepaidTax'] },
    validateOptions(options, data) {
      if (data.owner === 'joint') return [t('invalid.owner')];
      return options.ordinaryContractConfirmed === true && options.holderControlRights === false ? [] : [t('invalid.ordinary')];
    },
    translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source,
      dependencies: [{ language: 'groovy-cashle-plugin', provider: provider + '.policy', source }] },
    usageModel: 'identity',
  });
  return { modules: [{
    ...account,
    engineInput(data, model) {
      const result = account.engineInput(data, model);
      return { ...result, input: { ...result.input, assetNature: 'INSURANCE_ASSET' } };
    },
  }] };
}
