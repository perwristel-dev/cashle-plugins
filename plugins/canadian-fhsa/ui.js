const provider = 'cashle.finance.ca-fhsa';
const source = 'canadian-fhsa.cashle';
const cash = (key, max) => ({ key, label: 'field.' + key, kind: 'number', money: true, min: 0, max, required: true });
const year = (key, min, max) => ({ key, label: 'field.' + key, kind: 'number', integer: true, min, max, required: true });
const date = (key, required = false) => ({ key, label: 'field.' + key, kind: 'date', required });
const check = key => ({ key, label: 'field.' + key, kind: 'check' });

export default function (context) {
  const t = context.translate;
  return { modules: [context.investmentAccount({
    type: 'cashlab.ca-fhsa', kind: 'CAfhsa', country: 'CA', label: 'label', help: 'help.scope',
    defaults: { policyOptions: { eligibilityConfirmed: false, firstFhsaOpened: '', turns71Year: null, roomYear: 2026,
      openingRoom: 8000, openingLifetimeUsed: 0, qualifyingDate: '', claimDeduction: true }, openingState: {} },
    policyFields: [
      check('eligibilityConfirmed'), date('firstFhsaOpened', true), year('turns71Year', 2023, 2300), year('roomYear', 2023, 2300),
      { ...cash('openingRoom', 16000), help: 'help.room' },
      { ...cash('openingLifetimeUsed', 40000), help: 'help.lifetime' },
      { ...date('qualifyingDate'), help: 'help.qualifying' },
      { ...check('claimDeduction'), help: 'help.deduction' },
    ],
    features: { basis: true, plannedSales: false, dividendsReinvest: true, dividendsMustReinvest: true, canAdd: true,
      history: ['openingValue', 'deposits', 'withdrawals', 'dividends', 'prepaidTax'] },
    validateOptions(options, data, model) {
      const errors = [];
      if (!options.eligibilityConfirmed) errors.push('invalid.confirmation');
      const firstYear = Number(options.firstFhsaOpened?.slice(0, 4));
      const startYear = Number(model?.plan?.from?.slice(0, 4));
      if (!firstYear || options.firstFhsaOpened < '2023-04-01' || options.roomYear < firstYear ||
          options.turns71Year < options.roomYear || options.turns71Year > firstYear + 53 ||
          (startYear && options.roomYear !== startYear)) errors.push('invalid.opened');
      const deadline = `${Math.min(firstYear + 15, options.turns71Year)}-12-31`;
      if (model?.plan?.until > deadline && (!data.closeEnabled || !data.closeDate || data.closeDate > deadline))
        errors.push('invalid.deadline');
      if (options.openingRoom > Math.min(options.roomYear === firstYear ? 8000 : 16000, 40000 - options.openingLifetimeUsed) ||
          (data.initialYear?.newAccountAtStart ? data.balance > options.openingRoom :
            data.balance > 0 && options.openingLifetimeUsed === 0)) errors.push('invalid.room');
      if (options.qualifyingDate && (!data.closeEnabled || data.closeDate !== options.qualifyingDate))
        errors.push('invalid.qualifying');
      return errors.map(t);
    },
    translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source,
      dependencies: [{ language: 'groovy-cashle-plugin', provider: provider + '.tax-policy', source }] },
    usageModel: 'identity',
  })] };
}
