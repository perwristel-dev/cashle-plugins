const provider = 'cashle.finance.pension.dk.industriens';
const startReferences = ['age', 'date', 'milestone'];
const hasContributions = data => data.pensionableMonthlyPay > 0;
const hasPayout = data => data.rateMonthly > 0 || data.lifelongMonthly > 0;

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '') || value < '1900-01-01') return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value;
}

function monthOnOrAfter(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, day === 1 ? month - 1 : month, 1)).toISOString().slice(0, 10);
}

function addYears(value, years) {
  const [year, month, day] = value.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year + years, month, 0)).getUTCDate();
  const result = new Date(Date.UTC(year + years, month - 1, Math.min(day, lastDay)));
  return result.toISOString().slice(0, 10);
}

const monthly = (key, extra = {}) => ({
  key, label: `field.${key}`, kind: 'number', default: 0, min: 0, unit: 'unit.monthly', ...extra,
});

const savingsFields = [
  { key: 'name', label: 'field.name', kind: 'text', default: 'Industriens Pension' },
  { key: 'owner', label: 'field.owner', kind: 'owner', default: 'self' },
  { key: 'openingCapital', label: 'field.openingCapital', kind: 'number', unit: 'DKK', min: 0,
    default: 0, help: 'help.capital' },
  monthly('pensionableMonthlyPay', { help: 'help.pay', forecastEditable: true }),
  { key: 'contributionFrom', label: 'field.contributionFrom', kind: 'date', default: '',
    when: hasContributions, required: true, help: 'help.contributionStart', forecastEditable: true },
  monthly('monthlyDeductions', { default: null, required: true, when: hasContributions, help: 'help.deductions',
    forecastEditable: true, preserveWhenInactive: true }),
];

const payoutFields = [
  monthly('rateMonthly', { help: 'help.rateQuote', forecastEditable: true }),
  { key: 'rateYears', label: 'field.rateYears', kind: 'number', default: 15, min: 10, max: 30,
    integer: true, unit: 'unit.years', when: data => data.rateMonthly > 0, forecastEditable: true, preserveWhenInactive: true },
  monthly('lifelongMonthly', { help: 'help.lifelongQuote', forecastEditable: true }),
  { key: 'firstEligiblePayout', label: 'field.firstEligiblePayout', kind: 'date', default: '',
    when: hasPayout, required: true, help: 'help.eligibility', preserveWhenInactive: true },
  { key: 'payoutStart', label: 'field.payoutStart', kind: 'time', when: hasPayout, choices: startReferences,
    choiceLabels: { age: 'option.age' }, hideOffset: true, currentDatePrecision: 'day', forecastEditable: true, preserveWhenInactive: true,
    default: { reference: 'age', age: 67, offset: 0 }, help: 'help.start' },
];

export default function createPlugin(context) {
  const { translate: t, resolveTimeDate, casePlan } = context;
  const payoutEditor = context.schemaModule({
    id: 'danish-industriens-pension-payout', category: 'income', label: 'label.payout', fields: payoutFields, sections: [],
  }).editor;

  const locatePerson = (owner, model) => model?.profile?.people?.find(person => person.id === owner && person.id !== 'joint');
  const selectedDate = (data, model) => resolveTimeDate({ ...data.payoutStart, personId: data.owner },
    { plan: casePlan(model), profile: model?.profile });
  const format = amount => new Intl.NumberFormat(context.language, { style: 'currency', currency: 'DKK' }).format(amount);

  const pension = context.schemaModule({
    id: 'danish-industriens-pension', category: 'accounts', financesTab: 'savings', label: 'label', taxCountries: ['DK'],
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    fields: [...savingsFields, ...payoutFields], inlineFields: savingsFields, sections: [],
    validateData(data, model) {
      const errors = [];
      const person = locatePerson(data.owner, model);
      if (!Number.isInteger(person?.birthYear) || person.birthYear < 1900 || person.birthYear > 2300
          || !Number.isInteger(person.birthMonth) || person.birthMonth < 1 || person.birthMonth > 12)
        errors.push('invalid.person');
      if (hasContributions(data) && (!validDate(data.contributionFrom) || !Number.isFinite(data.monthlyDeductions) ||
          data.monthlyDeductions < 0)) errors.push('invalid.contribution');
      if (!hasPayout(data)) return errors;
      const request = data.payoutStart;
      if (!validDate(data.firstEligiblePayout) || !startReferences.includes(request?.reference) ||
          (request.offset ?? 0) !== 0 || request.reference === 'age' && (!Number.isInteger(request.age) || request.age < 0 || request.age > 130)) {
        errors.push('invalid.payout');
        return errors;
      }
      const earliest = data.firstEligiblePayout;
      if (Number.isInteger(person?.birthYear) && Number.isInteger(person.birthMonth)) {
        const minimumMonth = `${person.birthYear + 60}-${String(person.birthMonth).padStart(2, '0')}-01`;
        if (earliest < minimumMonth) errors.push('invalid.payout');
      }
      const date = selectedDate(data, model);
      if (date && date < earliest && request.reference !== 'milestone')
        errors.push('invalid.payout');
      if (date && data.rateMonthly > 0 && Number.isInteger(data.rateYears) &&
          addYears(monthOnOrAfter(date < earliest ? earliest : date), data.rateYears) > addYears(earliest, 30))
        errors.push('invalid.rateWindow');
      return errors;
    },
    engineInput(data) {
      const payoutStart = hasPayout(data) ? { ...data.payoutStart, personId: data.owner } : undefined;
      return {
        input: { ...data, payoutStart },
        timeReferences: [
          { reference: 'life', personId: data.owner },
          ...(payoutStart?.reference === 'milestone' ? [payoutStart] : []),
        ],
      };
    },
    summarize(data, model) {
      const from = casePlan(model)?.from ?? '';
      const rate = from >= '2023-06-01' && from < '2025-05-01' ? 0.12 : 0.13;
      return {
        title: data.name,
        amount: format(data.openingCapital),
        detail: hasContributions(data) ? t('summary.gross', { amount: format(data.pensionableMonthlyPay * rate) }) : '',
      };
    },
  });

  return { modules: [{
    ...pension,
    pluginId: provider,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'industriens-pension.cashle' },
    usageModel: 'identity',
    translations: context.translations,
    acceptsDeposits: false,
    acceptsRemainder: false,
    secondaryView: {
      category: 'income', financesTab: 'income', label: () => t('label.payout'), editor: payoutEditor,
      summarize(data) {
        return {
          title: data.name,
          amount: hasPayout(data) ? format(data.rateMonthly + data.lifelongMonthly) : '',
          detail: hasPayout(data) ? t('summary.monthlyBeforeTax') : t('summary.noPayout'),
        };
      },
    },
  }] };
}
