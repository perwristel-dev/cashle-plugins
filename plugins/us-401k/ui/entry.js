const provider = 'cashle.finance.pension.occupational.us.401k';
const type = 'us-401k';
const startChoices = ['age', 'date', 'retirement', 'milestone'];
const defaultStart = { reference: 'age', age: 67, offset: 0, personId: 'self' };
const voluntary = data => data.distribution !== 'rmd-only';
const hasContributions = data => data.monthlyContribution > 0;

function personFor(data, model) {
  return model?.profile?.people?.find(person => person.id === data.owner && person.id !== 'joint');
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value;
}

function monthEnd(year, month) {
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

function minimumDate(data, model) {
  const person = personFor(data, model);
  if (!Number.isInteger(person?.birthYear) || !Number.isInteger(person.birthMonth)) return null;
  const statutory = new Date(Date.UTC(person.birthYear + 59, person.birthMonth - 1 + 6, 1)).toISOString().slice(0, 10);
  return validDate(data.eligibleDate) && data.eligibleDate > statutory ? data.eligibleDate : statutory;
}

function resolveStart(data, model, desired) {
  if (!desired) return null;
  const earliest = minimumDate(data, model);
  const date = earliest && earliest > desired ? earliest : desired;
  const [year, month] = date.split('-').map(Number);
  return monthEnd(year, month);
}

function firstRmdYear(person, data) {
  const year = person.birthYear;
  const required = year === 1949 && person.birthMonth > 6 || year === 1950 ? year + 72 :
    year < 1950 ? year + 70 + (person.birthMonth > 6 ? 1 : 0) :
    year < 1960 ? year + 73 : year + 75;
  return data.workingDeferral && validDate(data.eligibleDate)
    ? Math.max(required, Number(data.eligibleDate.slice(0, 4))) : required;
}

export default function (context) {
  const t = context.translate;
  const amount = (value, model) => new Intl.NumberFormat(model?.profile?.locale ?? context.language, {
    style: 'currency', currency: 'USD', maximumFractionDigits: 2,
  }).format(value);
  const capitalFields = [
    { key: 'name', kind: 'text', label: 'name', default: t('label') },
    { key: 'owner', kind: 'owner', label: 'owner', default: 'self' },
    { key: 'openingBalance', kind: 'number', label: 'openingBalance', default: 0, min: 0, unit: 'USD' },
    { key: 'annualReturn', kind: 'number', label: 'annualReturn', default: 0, min: -100, exclusiveMin: true,
      max: 100, unit: '%', forecastEditable: true },
    { key: 'monthlyContribution', kind: 'number', label: 'monthlyContribution', default: 0, min: 0, unit: 'USD',
      help: 'contributionHelp', forecastEditable: true },
    { key: 'contributionUntil', kind: 'date', label: 'contributionUntil', default: '',
      when: hasContributions, required: true, preserveWhenInactive: true, forecastEditable: true },
    { key: 'openingYearRmd', kind: 'number', label: 'openingYearRmd', default: null, min: 0, unit: 'USD',
      help: 'openingRmdHelp' },
    { key: 'eligibleDate', kind: 'date', label: 'eligibleDate', default: '', help: 'eligibilityHelp' },
    { key: 'workingDeferral', kind: 'check', label: 'workingDeferral', default: false, help: 'deferralHelp' },
  ];
  const payoutFields = [
    { key: 'distribution', kind: 'select', label: 'distribution', default: 'rmd-only', options: [
      ['rmd-only', 'rmdOnly'], ['lump-sum', 'lumpSum'], ['installments', 'installments'], ['annuity', 'annuity'],
    ], forecastEditable: true },
    { key: 'payoutStart', kind: 'time', label: 'payoutStart', default: defaultStart,
      choices: startChoices, currentDatePrecision: 'day', when: voluntary, preserveWhenInactive: true,
      forecastEditable: true, normalize: (time, _model, data) => ['age', 'retirement'].includes(time?.reference)
        ? { ...time, personId: data.owner } : time },
    { key: 'installmentYears', kind: 'number', label: 'installmentYears', default: 15, min: 1, max: 40,
      integer: true, when: data => data.distribution === 'installments', preserveWhenInactive: true,
      forecastEditable: true },
    { key: 'annuityMonthly', kind: 'number', label: 'annuityMonthly', default: 0, min: 0, exclusiveMin: true,
      unit: 'USD', when: data => data.distribution === 'annuity', preserveWhenInactive: true,
      help: 'annuityHelp', forecastEditable: true },
  ];
  const timeFor = data => {
    const time = data.payoutStart ?? defaultStart;
    return ['age', 'retirement'].includes(time.reference) ? { ...time, personId: data.owner } : time;
  };
  const payoutSummary = (data, model) => {
    const person = personFor(data, model);
    if (!voluntary(data)) return { title: t('payout'), detail: person ? t('rmdSummary', { year: firstRmdYear(person, data) }) : t('rmdOnly') };
    const date = resolveStart(data, model, context.resolveTimeDate(timeFor(data), model));
    const detail = data.distribution === 'installments' ? t('installmentSummary', { years: data.installmentYears }) :
      data.distribution === 'annuity' ? t('annuitySummary', { amount: amount(data.annuityMonthly, model) }) : t('lumpSum');
    return { title: t('payout'), amount: date ?? undefined, detail };
  };
  const payoutEditor = context.schemaModule({
    id: `${type}-payout`, category: 'income', label: 'payout', fields: payoutFields, sections: [],
  }).editor;
  const pension = context.schemaModule({
    id: type, category: 'accounts', financesTab: 'savings', label: 'label', pluginId: provider,
    taxCountries: ['US'], capabilities: { balance: true },
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    fields: [...capitalFields, ...payoutFields], inlineFields: capitalFields, sections: [],
    creationData: () => ({ name: t('label') }),
    validateData(data, model) {
      const person = personFor(data, model);
      if (!Number.isInteger(person?.birthYear) || person.birthYear < 1900 || person.birthYear > 9800 ||
          !Number.isInteger(person.birthMonth) || person.birthMonth < 1 || person.birthMonth > 12) {
        return ['invalidPerson'];
      }
      const errors = [];
      if (hasContributions(data) && !validDate(data.contributionUntil)) errors.push('invalidContribution');
      if (data.eligibleDate && !validDate(data.eligibleDate)) errors.push('invalidEligibility');
      const rmdYear = firstRmdYear(person, data);
      if ((data.workingDeferral && !validDate(data.eligibleDate)) ||
          (validDate(data.eligibleDate) && Number(data.eligibleDate.slice(0, 4)) > rmdYear)) {
        errors.push('invalidDeferral');
      }
      const from = context.casePlan(model)?.from;
      if (validDate(from) && data.openingBalance > 0 && Number(from.slice(0, 4)) >= rmdYear &&
          !from.endsWith('-01-01') && !Number.isFinite(data.openingYearRmd)) {
        errors.push('invalidOpeningRmd');
      }
      if (voluntary(data)) {
        const time = data.payoutStart;
        if (!startChoices.includes(time?.reference) || !Number.isInteger(time.offset) || Math.abs(time.offset) > 1200 ||
            time.reference === 'age' && (!Number.isInteger(time.age) || time.age < 0 || time.age > 120)) {
          errors.push('invalidStart');
        }
      }
      return errors;
    },
    engineInput(data, { model }) {
      const payoutStart = timeFor(data);
      const timeReferences = voluntary(data) ? [payoutStart] : [];
      if (context.casePlan(model).milestones?.some(row => row.builtin === 'life' && row.personId === data.owner)) {
        timeReferences.push({ reference: 'life', personId: data.owner });
      }
      return { input: { ...data, payoutStart }, timeReferences };
    },
    summarize: (data, model) => ({ title: data.name, amount: amount(data.openingBalance, model), detail: t('balanceSummary') }),
  });

  return { modules: [{
    ...pension, translations: context.translations, acceptsDeposits: false, acceptsRemainder: false,
    usageModel: 'identity',
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'us-401k.cashle' },
    secondaryView: { category: 'income', financesTab: 'income', label: () => t('payout'),
      editor: payoutEditor, summarize: payoutSummary },
    withdrawal: {
      start: data => voluntary(data) ? { key: 'payoutStart', time: timeFor(data) } : null,
      limits: (data, { model }) => ({
        minStart: minimumDate(data, model), maxStart: null, minDuration: 1, maxDuration: 40, durationStep: 1,
        startLocked: false, lifetimeOnly: data.distribution === 'annuity', allowLifetime: false,
      }),
      duration: data => data.distribution === 'installments' ? data.installmentYears :
        data.distribution === 'annuity' ? 0 : NaN,
      durationPatch: (_data, duration) => ({ installmentYears: duration }),
      resolveStart: (data, { model, desiredDate }) => resolveStart(data, model, desiredDate),
    },
  }] };
}
