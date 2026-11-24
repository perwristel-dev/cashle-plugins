const label = 'Assurance-vie en unités de compte';
const spec = {
  type: 'cashlab.fr-assurance-vie', kind: 'FRassuranceVie', country: 'FR', label,
  defaults: {
    reinvestDividends: true,
    policyOptions: { acquiredDate: '', completePortfolio: false },
    openingState: { priorYearPremiums: 0, youngGains: 0 },
  },
  policyFields: [
    { key: 'acquiredDate', label: 'Date du premier versement', kind: 'date' },
    { key: 'completePortfolio', label: 'Tous mes contrats relèvent de ce profil et figurent dans le plan', kind: 'check',
      help: 'Incluez tous vos contrats d’assurance-vie et de capitalisation. Ce profil couvre les primes versées à compter du 27 septembre 2017 et les supports en unités de compte.' },
  ],
  stateFields: [
    { key: 'priorYearPremiums', label: 'Primes non remboursées au 31 décembre précédent', kind: 'number', money: true, min: 0 },
    { key: 'youngGains', label: 'Produits des rachats de l’année avant huit ans', kind: 'number', money: true, min: 0 },
  ],
  features: {
    basis: true, plannedSales: false, dividendsReinvest: true, dividendsMustReinvest: true, canAdd: true,
    history: ['deposits', 'withdrawals', 'dividends', 'realizedGain'],
  },
  validateOptions(options) {
    const errors = [];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(options.acquiredDate ?? '') || options.acquiredDate < '2017-09-27') {
      errors.push('Indiquez un premier versement à compter du 27 septembre 2017.');
    }
    if (options.completePortfolio !== true) {
      errors.push('Confirmez que tous vos contrats éligibles figurent dans le plan.');
    }
    return errors;
  },
};

export default context => ({
  modules: [context.investmentAccount({
    ...spec, translations: context.translations, usageModel: 'identity',
    sourceModule: {
      language: 'groovy-cashle-plugin', provider: 'cashle.finance.fr-assurance-vie', source: 'french-assurance-vie.cashle',
      dependencies: [{ language: 'groovy-cashle-plugin', provider: 'cashle.finance.fr-assurance-vie.tax', source: 'french-assurance-vie-tax.cashle' }],
    },
  })],
});
