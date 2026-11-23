export default function (context) {
  return { modules: [context.investmentAccount({
    type: 'cashlab.ca-tfsa',
    kind: 'CAtfsa',
    country: 'CA',
    label: 'Kanada – TFSA',
    help: 'Kanada 2026: skattefri avkastning och uttag. Modellera personens samtliga TFSA som ett konto med verifierat kvarvarande bidragsutrymme vid prognosstart; inkludera årets redan tilldelade 7 000 CAD. Insättningar förbrukar utrymmet. Uttag återställs först den 1 januari följande år, tillsammans med nästa års schablonmässiga 7 000 CAD i regelårets penningvärde. Värdeförlust skapar inget nytt utrymme. Inga icke-kvalificerade placeringar eller överinsättningar stöds.',
    defaults: { policyOptions: { openingContributionRoom: 0 }, openingState: {} },
    policyFields: [{
      key: 'openingContributionRoom', label: 'Verifierat kvarvarande personligt TFSA-utrymme (CAD)', kind: 'number', money: true, min: 0,
      help: 'Totalt kvarvarande utrymme nu, inklusive årets gräns och tidigare outnyttjat utrymme. Uttag under innevarande år får inte läggas tillbaka ännu.',
    }],
    features: {
      basis: true, plannedSales: false, dividendsReinvest: true, canAdd: true,
      history: ['deposits', 'withdrawals', 'dividends', 'distributedDividends'],
    },
    validateOptions(options, data) {
      return data.initialYear?.newAccountAtStart && data.balance > options.openingContributionRoom
        ? ['Den nya TFSA-insättningen vid start överstiger verifierat bidragsutrymme.']
        : [];
    },
    translations: context.translations,
    sourceModule: {
      language: 'groovy-cashle-plugin',
      provider: 'cashle.finance.ca-tfsa',
      source: 'canadian-tfsa.cashle',
      dependencies: [
        { language: 'groovy-cashle-plugin', provider: 'cashle.finance.ca-tfsa.tax-policy', source: 'canadian-tfsa.cashle' },
      ],
    },
    usageModel: 'identity',
  })] };
}
