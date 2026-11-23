const stateLabels = {
  realizedShortTermGain: 'Tidigare kortfristig realiserad vinst',
  realizedShortTermLoss: 'Tidigare kortfristig realiserad förlust',
  realizedLongTermGain: 'Tidigare långfristig realiserad vinst',
  realizedLongTermLoss: 'Tidigare långfristig realiserad förlust',
};

export default function (context) {
  return { modules: [context.investmentAccount({
    type: 'cashlab.us-brokerage',
    kind: 'USbrokerage',
    country: 'US',
    label: 'USA – aktiedepå (ett anskaffningstillfälle)',
    help: 'USA 2026: en homogen post börsnoterade aktier med samma historiska anskaffningsdatum. Uttag säljer samma andel av denna post. Inga ytterligare köp, återinvesteringar eller försäljningar med återköp; nya poster kräver separata konton och kontroll av wash sale. Utdelning betalas till hushållets kontanter. Kort/lång vinst bestäms av faktisk ägartid; qualified gäller bara efter verifierat bolags- och innehavsvillkor. Historisk realisation måste delas i fyra kort/lång-vinst/förlustposter i ingående tillstånd.',
    translations: context.translations,
    defaults: {
      policyOptions: { acquiredDate: '', dividendTreatment: '', noWashSaleConfirmed: false },
      openingState: Object.fromEntries(Object.keys(stateLabels).map(key => [key, 0])),
    },
    policyFields: [
      { key: 'acquiredDate', label: 'Postens verkliga anskaffningsdatum', kind: 'date', required: true },
      { key: 'dividendTreatment', label: 'Verifierad utdelningsklass', kind: 'select', required: true,
        options: [['', 'Välj'], ['ordinary', 'Ordinary dividends'], ['qualified', 'Qualified dividends – verifierade villkor']] },
      { key: 'noWashSaleConfirmed', label: 'Inga wash sale-köp av väsentligen identiska värdepapper inom 30 dagar före/efter förlustförsäljningar (verifierat)', kind: 'check' },
    ],
    stateFields: Object.entries(stateLabels).map(([key, label]) => ({ key, label, kind: 'number', money: true, min: 0 })),
    features: {
      basis: true,
      plannedSales: false,
      dividendsReinvest: false,
      canAdd: false,
      history: ['deposits', 'withdrawals', 'dividends', 'distributedDividends', 'prepaidTax'],
    },
    validateOptions(options, data, model) {
      const errors = [];
      const start = model?.plan?.from;
      if (options.acquiredDate && start && options.acquiredDate > start) {
        errors.push('Posten måste ha förvärvats senast vid prognosstart.');
      }
      if (data.initialYear?.newAccountAtStart) {
        if (start && options.acquiredDate !== start) {
          errors.push('En ny post vid prognosstart måste ha samma anskaffningsdatum som prognosstarten.');
        }
        if (Object.values(data.openingState ?? {}).some(value => value > 0)) {
          errors.push('En ny post kan inte ha realiserad historik före starten.');
        }
      }
      if (data.reinvestDividends) errors.push('USA-posten tillåter inte återinvesterad utdelning.');
      return errors;
    },
    sourceModule: {
      language: 'groovy-cashle-plugin',
      provider: 'cashle.finance.us-brokerage',
      source: 'us-brokerage.cashle',
      dependencies: [{
        language: 'groovy-cashle-plugin',
        provider: 'cashle.finance.us-brokerage.tax',
        source: 'us-brokerage-tax.cashle',
      }],
    },
    usageModel: 'identity',
  })] };
}
