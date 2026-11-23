const provider = 'cashle.finance.pension.gb.workplace';
const choices = ['age', 'date', 'milestone'];
const hasPayout = data => ['once', 'monthly'].includes(data.payoutMode);
const hasContributions = data => data.grossMonthlyPay > 0;
const monthly = data => data.payoutMode === 'monthly';
const scheduled = data => hasPayout(data) && data.startMode === 'scheduled';
const money = (key, extra) => ({ key, kind: 'number', label: `field.${key}`, default: 0, min: 0, unit: 'GBP', ...extra });

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value;
}

function validPerson(person, day) {
  const year = person?.birthYear;
  const month = person?.birthMonth;
  if (!Number.isInteger(year) || year < 1900 || year > 2300 || !Number.isInteger(month) || month < 1 || month > 12) return false;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day == null || day === '' || (Number.isInteger(day) && day >= 1 && day <= lastDay);
}

const savingsFields = [
  { key: 'name', label: 'field.name', kind: 'text', default: 'UK workplace pension' },
  { key: 'owner', label: 'field.owner', kind: 'owner', default: 'self' },
  { key: 'birthDay', label: 'field.birthDay', kind: 'number', default: null, min: 1, max: 31, integer: true, help: 'help.birthDay' },
  money('openingCapital', { help: 'help.capital' }),
  money('grossMonthlyPay', { unit: 'unit.monthly', forecastEditable: true, help: 'help.pay' }),
  { key: 'contributionFrom', label: 'field.contributionFrom', kind: 'date', default: '', when: hasContributions,
    help: 'help.contributionFrom', forecastEditable: true, preserveWhenInactive: true },
  { key: 'contributionUntil', label: 'field.contributionUntil', kind: 'date', default: '', when: hasContributions,
    help: 'help.contributionUntil', forecastEditable: true, preserveWhenInactive: true },
  { key: 'annualReturn', label: 'field.annualReturn', kind: 'number', default: 0, min: -99, max: 100, unit: '%',
    forecastEditable: true, help: 'help.return' },
];
const payoutFields = [
  { key: 'payoutMode', label: 'field.payoutMode', kind: 'select', default: 'none', options: [
    ['none', 'option.none'], ['once', 'option.once'], ['monthly', 'option.monthly'],
  ], forecastEditable: true, help: 'help.payoutMode' },
  money('monthlyWithdrawal', { unit: 'unit.monthly', min: 0.01, when: monthly, required: true,
    forecastEditable: true, preserveWhenInactive: true }),
  money('remainingLumpSumAllowance', { default: 268275, max: 268275, when: hasPayout,
    help: 'help.allowance', forecastEditable: true, preserveWhenInactive: true }),
  { key: 'schemeAccessDate', label: 'field.schemeAccessDate', kind: 'date', default: '', when: hasPayout,
    help: 'help.schemeAccessDate', forecastEditable: true, preserveWhenInactive: true },
  { key: 'startMode', label: 'field.startMode', kind: 'select', default: 'minimum', when: hasPayout, options: [
    ['minimum', 'option.minimum'], ['scheduled', 'option.scheduled'],
  ], forecastEditable: true, preserveWhenInactive: true },
  { key: 'payoutStart', label: 'field.payoutStart', kind: 'time', when: scheduled, choices,
    choiceLabels: { age: 'option.age' }, hideOffset: true, currentDatePrecision: 'day', forecastEditable: true,
    default: { reference: 'age', age: 57, offset: 0 }, help: 'help.start', preserveWhenInactive: true },
];

export default function createPlugin(context) {
  const { translate: t, resolveTimeDate, casePlan } = context;
  const payoutEditor = context.schemaModule({
    id: 'uk-workplace-pension-payout', category: 'income', label: 'label.payout', fields: payoutFields, sections: [],
  }).editor;
  const format = value => new Intl.NumberFormat(context.language, { style: 'currency', currency: 'GBP' }).format(value);
  const module = context.schemaModule({
    id: 'uk-workplace-pension', category: 'accounts', financesTab: 'savings', label: 'label', taxCountries: ['GB'],
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    fields: [...savingsFields, ...payoutFields], inlineFields: savingsFields, sections: [],
    validateData(data, model) {
      const errors = [];
      const person = model?.profile?.people?.find(entry => entry.id === data.owner && entry.id !== 'joint');
      if (!validPerson(person, data.birthDay)) errors.push('invalid.person');
      if (hasContributions(data)) {
        const from = data.contributionFrom || casePlan(model)?.from;
        if ((data.contributionFrom && !validDate(data.contributionFrom)) ||
            (data.contributionUntil && (!validDate(data.contributionUntil) || (from && data.contributionUntil <= from)))) {
          errors.push('invalid.contribution');
        }
      }
      if (hasPayout(data) && data.schemeAccessDate && !validDate(data.schemeAccessDate)) errors.push('invalid.start');
      if (scheduled(data)) {
        const claim = data.payoutStart ?? {};
        const validAge = Number.isInteger(claim.age) && claim.age >= 0 && claim.age <= 130;
        if (!choices.includes(claim.reference) || (claim.offset ?? 0) !== 0 ||
            (claim.reference === 'age' && !validAge) ||
            (claim.reference === 'milestone' && (typeof claim.milestoneId !== 'string' || !claim.milestoneId.trim())) ||
            (claim.reference === 'date' && !resolveTimeDate(claim, { plan: casePlan(model), profile: model?.profile }))) {
          errors.push('invalid.start');
        }
      }
      return errors;
    },
    engineInput(data) {
      const { startMode, payoutStart, contributionFrom, contributionUntil, ...input } = data;
      if (hasContributions(data)) Object.assign(input, { contributionFrom, contributionUntil });
      input.payoutStart = scheduled(data) ? { ...payoutStart, personId: data.owner } : { reference: 'minimum' };
      return { input, timeReferences: [
        { reference: 'life', personId: data.owner },
        ...(input.payoutStart.reference === 'milestone' ? [input.payoutStart] : []),
      ] };
    },
    summarize(data) {
      const eligible = Math.max(0, Math.min(data.grossMonthlyPay, 4189) - 520);
      return { title: data.name, amount: format(data.openingCapital),
        detail: eligible > 0 ? t('summary.contribution', { amount: format(eligible * 0.08) }) : '' };
    },
  });

  return { modules: [{
    ...module,
    pluginId: provider,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'uk-workplace-pension.cashle' },
    usageModel: 'identity',
    translations: context.translations,
    acceptsDeposits: false,
    acceptsRemainder: false,
    secondaryView: {
      category: 'income', financesTab: 'income', label: () => t('label.payout'), editor: payoutEditor,
      summarize(data) {
        return { title: data.name, amount: monthly(data) ? format(data.monthlyWithdrawal) : '',
          detail: t(`option.${data.payoutMode ?? 'none'}`) };
      },
    },
  }] };
}
