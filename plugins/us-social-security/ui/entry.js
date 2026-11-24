const provider = 'cashle.finance.pension.public.us';
const type = 'us-social-security';
const startChoices = ['age', 'date', 'retirement', 'milestone'];
const defaultStart = { reference: 'age', age: 67, offset: 0, personId: 'self' };

function personFor(data, model) {
  return model?.profile?.people?.find(person => person.id === data.owner && person.id !== 'joint');
}

function monthAt(year, month, offset = 0) {
  return new Date(Date.UTC(year, month - 1 + offset, 1)).toISOString().slice(0, 10);
}

function earliestClaim(data, model) {
  const person = personFor(data, model);
  if (!Number.isInteger(person?.birthYear) || !Number.isInteger(person.birthMonth)) return null;
  return monthAt(person.birthYear + 62, person.birthMonth, data.birthDay <= 2 ? 0 : 1);
}

function resolveStart(data, model, desiredDate, ageReference = false) {
  if (!desiredDate) return null;
  const [year, month, day] = desiredDate.split('-').map(Number);
  const date = monthAt(year, month, ageReference ? (data.birthDay === 1 ? -1 : 0) : (day > 1 ? 1 : 0));
  const earliest = earliestClaim(data, model);
  return earliest && earliest > date ? earliest : date;
}

export default function (context) {
  const t = context.translate;
  const amount = (value, model) => new Intl.NumberFormat(model?.profile?.locale ?? context.language, {
    style: 'currency', currency: 'USD', maximumFractionDigits: 2,
  }).format(value);
  const statementFields = [
    { key: 'name', kind: 'text', label: 'name', default: t('label') },
    { key: 'owner', kind: 'owner', label: 'owner', default: 'self' },
    { key: 'basis', kind: 'select', label: 'basis', default: 'full-retirement',
      options: [['full-retirement', 'fullRetirement'], ['claim-quote', 'quote']] },
    { key: 'monthlyBenefit', kind: 'number', label: 'monthlyBenefit', default: 0, min: 0, unit: 'USD',
      help: 'amountHelp', forecastEditable: true },
    { key: 'birthDay', kind: 'number', label: 'birthDay', default: 3, min: 1, max: 31, integer: true,
      help: 'birthHelp' },
  ];
  const payoutFields = [
    { key: 'payoutStart', kind: 'time', label: 'payoutStart', default: defaultStart,
      choices: startChoices, choiceLabels: { age: 'age' }, currentDatePrecision: 'day', information: 'payoutHelp', forecastEditable: true,
      normalize: (time, _model, data) => ['age', 'retirement'].includes(time?.reference)
        ? { ...time, personId: data.owner } : time },
  ];
  const timeFor = data => {
    const time = data.payoutStart ?? defaultStart;
    return ['age', 'retirement'].includes(time.reference) ? { ...time, personId: data.owner } : time;
  };
  const pension = context.schemaModule({
    id: type, category: 'income', financesTab: 'income', label: 'label', pluginId: provider,
    taxCountries: ['US'],
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    fields: [...statementFields, ...payoutFields], sections: [],
    creationData: () => ({ name: t('label') }),
    validateData(data, model) {
      const person = personFor(data, model);
      if (!Number.isInteger(person?.birthYear) || person.birthYear < 1900 || person.birthYear > 9800 ||
          !Number.isInteger(person.birthMonth) || person.birthMonth < 1 || person.birthMonth > 12) {
        return ['invalidPerson'];
      }
      const errors = [];
      const lastDay = new Date(Date.UTC(person.birthYear, person.birthMonth, 0)).getUTCDate();
      if (!Number.isInteger(data.birthDay) || data.birthDay < 1 || data.birthDay > lastDay) errors.push('invalidBirthDay');
      const cohort = person.birthYear - (person.birthMonth === 1 && data.birthDay === 1 ? 1 : 0);
      if (data.basis === 'full-retirement' && cohort < 1943) errors.push('invalidCohort');
      const time = data.payoutStart;
      if (!startChoices.includes(time?.reference) || !Number.isInteger(time.offset) || Math.abs(time.offset) > 1200 ||
          time.reference === 'age' && (!Number.isInteger(time.age) || time.age < 0 || time.age > 120)) {
        errors.push('invalidStart');
      }
      return errors;
    },
    engineInput(data, { model }) {
      const payoutStart = timeFor(data);
      const timeReferences = [payoutStart];
      if (context.casePlan(model).milestones?.some(row => row.builtin === 'life' && row.personId === data.owner)) {
        timeReferences.push({ reference: 'life', personId: data.owner });
      }
      return { input: { ...data, payoutStart }, timeReferences };
    },
    summarize: (data, model) => ({
      title: data.name, amount: amount(data.monthlyBenefit, model),
      detail: t(data.basis === 'claim-quote' ? 'quoteSummary' : 'fullSummary'),
    }),
  });

  return { modules: [{
    ...pension, translations: context.translations, acceptsDeposits: false, acceptsRemainder: false,
    usageModel: 'identity',
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'us-social-security.cashle' },
    previousCategories: ['accounts'],
    withdrawal: {
      start: data => ({ key: 'payoutStart', time: timeFor(data) }),
      limits: (data, { model }) => ({
        minStart: earliestClaim(data, model), maxStart: null, minDuration: null, maxDuration: null,
        durationStep: 1, startLocked: false, lifetimeOnly: true,
      }),
      duration: () => 0,
      resolveStart: (data, { model, desiredDate }) => resolveStart(data, model, desiredDate),
    },
  }] };
}
