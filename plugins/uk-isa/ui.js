const spec = {
  type: 'cashlab.gb-isa',
  kind: 'GBisa',
  country: 'GB',
  label: 'Stocks and Shares ISA',
  help: 'Vuxens brittiska Stocks and Shares ISA. Inkomst och kapitalvinster är skattefria. £20 000 årligt sammanlagt insättningstak delas med andra ISAs; ange externa ISA-insättningar. Endast en modellerad ISA per ägare. Detta är en icke flexibel ISA: uttag återställer inte årets insättningsutrymme. Inga pensions-, Junior- eller Lifetime ISA-regler.',
  defaults: { policyOptions: { otherIsaSubscriptions: 0 } },
  policyFields: [
    { key: 'otherIsaSubscriptions', label: 'Årets insättningar till andra ISAs (GBP)', kind: 'number', money: true },
  ],
  features: {
    basis: false,
    plannedSales: false,
    dividendsReinvest: true,
    canAdd: true,
    history: ['deposits', 'withdrawals', 'dividends'],
  },
  validateOptions(options) {
    return Number.isFinite(options.otherIsaSubscriptions) && options.otherIsaSubscriptions >= 0
      ? []
      : ['Ange årets externa ISA-insättningar.'];
  },
};

export default function (context) {
  return { modules: [context.investmentAccount({
    ...spec,
    translations: context.translations,
    sourceModule: {
      language: 'groovy-cashle-plugin',
      provider: 'cashle.finance.gb-isa',
      source: 'uk-isa.cashle',
      dependencies: [{
        language: 'groovy-cashle-plugin',
        provider: 'cashle.finance.gb-isa.tax',
        source: 'uk-isa-tax.cashle',
      }],
    },
    usageModel: 'identity',
  })] };
}
