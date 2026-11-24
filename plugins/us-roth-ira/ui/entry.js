const provider = 'cashle.finance.us-roth-ira';
const source = 'us-roth-ira.cashle';
const fields = [
  { key: 'firstRothTaxYear', label: 'firstRothTaxYear', kind: 'number', min: 0, max: 9800, integer: true, help: 'firstYearHelp' },
  { key: 'openingRoom', label: 'openingRoom', kind: 'number', min: 0, money: true, help: 'roomHelp' },
  { key: 'recurringRoom', label: 'recurringRoom', kind: 'number', min: 0, money: true, help: 'recurringHelp' },
];
const findOwner = (data, model) => model?.profile?.people?.find(person => person.id === data.owner);

export default function (context) {
  return { modules: [context.investmentAccount({
    type: 'cashlab.us-roth-ira', pluginId: provider, kind: 'USrothIRA', country: 'US',
    label: 'US Roth IRA', help: 'help',
    defaults: {
      policyOptions: { firstRothTaxYear: 0, openingRoom: 0, recurringRoom: 0 }, openingState: {},
      liquidity: { withdrawals: 'never', fromYear: 2026, from: { reference: 'now', offset: 0, personId: 'self' }, liquid: 'never' },
    },
    policyFields: fields,
    features: { basis: true, plannedSales: false, dividendsReinvest: true, dividendsMustReinvest: true,
      canAdd: true, history: ['deposits', 'withdrawals', 'dividends'] },
    validateOptions(options, data, model) {
      const owner = findOwner(data, model);
      const year = Number(model?.plan?.from?.slice(0, 4));
      const errors = [];
      if (!Number.isInteger(owner?.birthYear) || !Number.isInteger(owner.birthMonth) ||
          owner.birthYear < 1900 || owner.birthYear > 9800 || owner.birthMonth < 1 || owner.birthMonth > 12) {
        errors.push('invalidOwner');
      }
      if ((options.firstRothTaxYear !== 0 && (!Number.isInteger(options.firstRothTaxYear) || options.firstRothTaxYear < 1998 ||
           Number.isFinite(year) && options.firstRothTaxYear > year)) ||
          (data.balance > 0 && !data.initialYear.newAccountAtStart && options.firstRothTaxYear === 0)) {
        errors.push('invalidFirstYear');
      }
      if (data.initialYear.newAccountAtStart && model?.profile?.currency === 'USD' &&
          data.balance > options.openingRoom && Number.isFinite(year)) errors.push('invalidRoom');
      return errors;
    },
    engineData(data, { model }) {
      const owner = findOwner(data, model);
      const year = Number(context.casePlan(model)?.from?.slice(0, 4));
      return { ...data, policyOptions: {
        ...data.policyOptions,
        ownerBirthYear: owner?.birthYear, ownerBirthMonth: owner?.birthMonth,
        ...(Number.isInteger(year) ? { openingRoomYear: year } : {}),
      } };
    },
    translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source, dependencies: [
      { language: 'groovy-cashle-plugin', provider: `${provider}.tax-policy`, source },
    ] },
    usageModel: 'identity',
  })] };
}
