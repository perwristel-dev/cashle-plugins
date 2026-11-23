const spec = {
  type: 'cashlab.gb-brokerage',
  kind: 'GBbrokerage',
  country: 'GB',
  label: 'Brittisk aktiedepå (Section 104)',
  help: 'En aktieklass i en verifierad Section 104-pool. Proportionella uttag får använda poolens genomsnitt endast när inga köp samma dag eller under 30 dagar efter försäljningen kräver annan matchning, även i externa depåer. Bekräfta detta för hela prognosen. Extra insättningar och återinvesterade utdelningar är avstängda; utdelningen går till kontanter. Omedelbara återköp och andra matchningsprofiler stöds inte.',
  defaults: {
    policyOptions: { basisMethod: 'section104-pool', section104EligibilityConfirmed: false, acquiredDate: '' },
  },
  policyFields: [
    {
      key: 'acquiredDate',
      label: 'Ursprunglig anskaffningsdag',
      kind: 'date',
      help: 'En daterad homogen post. Blandade anskaffningar ska ligga i separata konton.',
    },
    {
      key: 'section104EligibilityConfirmed',
      label: 'Verifierad Section 104-pool utan köp samma dag/30 dagar efter försäljning',
      kind: 'check',
      help: 'Om verkliga eller planerade affärer bryter villkoret ska denna kontoprofil inte användas.',
    },
  ],
  features: {
    basis: true,
    plannedSales: false,
    dividendsReinvest: false,
    canAdd: false,
    history: ['deposits', 'withdrawals', 'dividends', 'realizedGain', 'realizedLoss', 'prepaidTax'],
  },
  validateOptions(options) {
    const errors = [];
    if (options.section104EligibilityConfirmed !== true) errors.push('Bekräfta Section 104-villkor och frånvaro av matchningsköp.');
    if (!options.acquiredDate) errors.push('Ange anskaffningsdag.');
    return errors;
  },
};

export default function (context) {
  return { modules: [context.investmentAccount({
    ...spec,
    translations: context.translations,
    sourceModule: {
      language: 'groovy-cashle-plugin',
      provider: 'cashle.finance.gb-brokerage',
      source: 'uk-brokerage.cashle',
      dependencies: [{
        language: 'groovy-cashle-plugin',
        provider: 'cashle.finance.gb-brokerage.tax',
        source: 'uk-brokerage-tax.cashle',
      }],
    },
    usageModel: 'identity',
  })] };
}
