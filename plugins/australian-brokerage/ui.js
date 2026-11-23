export default function (context) {
  return { modules: [context.investmentAccount({
    type: 'cashlab.au-brokerage',
    kind: 'AUbrokerage',
    country: 'AU',
    label: 'Australisk aktiedepå',
    help: 'En identifierad anskaffningspost. Uttag säljer proportionellt inom just den posten; flera datum behöver separata konton. Ingen extra insättning eller återinvesterad utdelning. Utdelning betalas till kontanter. 50 % CGT-rabatt kräver mer än tolv månader, räknat utan anskaffnings- och försäljningsdag. Årets förluster används före rabatten. Ange franking-antaganden och verifiera rätten till credits i skatteprofilen.',
    defaults: {
      openingState: { discountEligibleGain: 0, gainTaxYear: 0 },
      policyOptions: { basisMethod: 'identified-lot', singleLotConfirmed: false, acquiredDate: '', frankedFraction: 0, companyTaxRate: .3 },
    },
    policyFields: [
      { key: 'acquiredDate', label: 'Ursprunglig anskaffningsdag', kind: 'date',
        help: 'En daterad homogen post. Blandade anskaffningar ska ligga i separata konton.' },
      { key: 'singleLotConfirmed', label: 'En daterad identifierad post utan wash-sale-arrangemang', kind: 'check' },
      { key: 'frankedFraction', label: 'Andel franked utdelning', kind: 'number', percent: true },
      { key: 'companyTaxRate', label: 'Bolagsskattesats för franking', kind: 'number', percent: true },
    ],
    features: {
      basis: true, plannedSales: false, dividendsReinvest: false, canAdd: false,
      history: ['deposits', 'withdrawals', 'dividends', 'realizedGain', 'realizedLoss', 'prepaidTax'],
    },
    stateFields: [
      { key: 'discountEligibleGain', label: 'Tidigare realiserade bruttovinster med CGT-rabatt detta år', kind: 'number', money: true, min: 0 },
      { key: 'gainTaxYear', label: 'Startår för dessa realiserade vinster (0 om inga)', kind: 'number', min: 0 },
    ],
    validateOptions(options) {
      const errors = [];
      if (options.singleLotConfirmed !== true) errors.push('Bekräfta en identifierad post.');
      if (!options.acquiredDate) errors.push('Ange anskaffningsdag.');
      const rates = [options.frankedFraction, options.companyTaxRate];
      if (!rates.every(rate => Number.isFinite(rate) && rate >= 0 && rate <= 1) || options.companyTaxRate >= 1) {
        errors.push('Ange giltiga franking-andelar och bolagsskattesats.');
      }
      return errors;
    },
    translations: context.translations,
    sourceModule: {
      language: 'groovy-cashle-plugin',
      provider: 'cashle.finance.au-brokerage',
      source: 'australian-brokerage.cashle',
      dependencies: [
        { language: 'groovy-cashle-plugin', provider: 'cashle.finance.au-brokerage.tax-policy', source: 'australian-brokerage.cashle' },
      ],
    },
    usageModel: 'identity',
  })] };
}
