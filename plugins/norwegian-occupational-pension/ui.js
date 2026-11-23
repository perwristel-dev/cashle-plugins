const provider = 'cashle.finance.pension.occupational.no';
const type = 'norwegian-occupational-pension';
const startChoices = ['age', 'date', 'retirement', 'milestone'];
const defaultStart = { reference: 'age', age: 67, personId: 'self', offset: 0 };

const payoutReference = data => {
  const time = data.payoutStart ?? defaultStart;
  if (time.reference === 'age' || (time.reference === 'retirement' && !time.personId)) {
    return { ...time, personId: data.owner };
  }
  return time;
};
const ageDate = (person, age) => `${person.birthYear + age}-${String(person.birthMonth).padStart(2, '0')}-01`;
const monthIndex = iso => Number(iso.slice(0, 4)) * 12 + Number(iso.slice(5, 7));
const personFor = (data, model) => model?.profile?.people?.find(person => person.id === data.owner);
const hasBirth = person => Number.isInteger(person?.birthYear) && person.birthYear >= 1900 && person.birthYear <= 9800
  && Number.isInteger(person.birthMonth) && person.birthMonth >= 1 && person.birthMonth <= 12;

function bounds(data, model) {
  const person = personFor(data, model);
  return hasBirth(person) ? { minStart: ageDate(person, 62), maxStart: ageDate(person, 75) }
    : { minStart: null, maxStart: null };
}

function effectiveStart(data, model, desiredDate) {
  const { minStart, maxStart } = bounds(data, model);
  if (!minStart || !desiredDate) return null;
  const month = `${desiredDate.slice(0, 7)}-01`;
  return month < minStart ? minStart : month > maxStart ? maxStart : month;
}

const number = (key, value, settings = {}) => ({ key, label: key, kind: 'number', default: value, min: 0, ...settings });

export default function (context) {
  const { translate: t, resolveTimeDate, createValidator, validationRules: rules } = context;
  const capitalFields = [
    { key: 'name', kind: 'text', label: 'name', default: t('label') },
    { key: 'owner', kind: 'owner', label: 'owner', default: 'self' },
    number('openingBalance', 0, { unit: 'NOK' }),
    number('pensionableAnnual', 0, { unit: 'NOK', help: 'salaryHelp', forecastEditable: true }),
    number('employerRate', 2, { unit: '%', min: 2, max: 7, forecastEditable: true }),
    number('additionalRate', 0, { unit: '%', max: 18.1, help: 'additionalHelp', forecastEditable: true }),
    number('annualReturn', 0, { unit: '%', min: -99, max: 100, forecastEditable: true }),
  ];
  const payoutFields = [
    {
      key: 'payoutStart', kind: 'time', label: 'payoutStart', default: defaultStart, choices: startChoices,
      choiceLabels: { age: 'age' }, currentDatePrecision: 'day', forecastEditable: true, information: 'startHelp',
      normalize: (time, _model, data) => payoutReference({ ...data, payoutStart: time }),
    },
    number('durationYears', 10, { min: 1, max: 60, integer: true, forecastEditable: true }),
    { key: 'shortenSmallBalance', kind: 'check', label: 'shortenSmallBalance', default: false, help: 'shortenHelp', forecastEditable: true },
    { kind: 'message', label: 'termNote' },
  ];
  const validate = createValidator([
    { field: 'owner', rules: [(owner, data, model) => owner !== 'joint' && hasBirth(personFor(data, model))], message: 'invalidOwner' },
    { field: 'shortenSmallBalance', rules: [rules.boolean], message: 'invalidException' },
    {
      field: 'payoutStart',
      rules: [
        rules.time(startChoices),
        (time, data, model) => {
          const offset = time?.offset ?? 0;
          return Number.isInteger(offset) && Math.abs(offset) <= 1200 &&
            (time?.reference !== 'age' || (Number.isInteger(time.age) && time.age >= 0 && time.age <= 120)) &&
            (!['retirement', 'milestone'].includes(time?.reference) || offset >= 0 ||
              Boolean(resolveTimeDate({ ...payoutReference(data), offset: 0 }, model)));
        },
      ],
      message: 'invalidStart',
    },
  ]);
  const summarizePayout = (data, model) => {
    const start = effectiveStart(data, model, resolveTimeDate(payoutReference(data), model));
    const owner = personFor(data, model);
    return { title: t('receipt'), amount: start ?? t('pendingStart'),
      detail: data.shortenSmallBalance ? t('shortTermSummary') : start && owner
        ? t('paymentMonths').replace('{months}', Math.max(data.durationYears * 12, 120, monthIndex(ageDate(owner, 77)) - monthIndex(start)))
        : t('termSummary') };
  };
  const payoutEditor = context.schemaModule({
    id: `${type}-receipt`, label: 'receipt', category: 'income', fields: payoutFields, sections: [],
  }).editor;
  const account = context.schemaModule({
    id: type, label: 'label', pluginId: provider, category: 'accounts', financesTab: 'savings',
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    capabilities: { balance: true },
    fields: [...capitalFields, ...payoutFields], inlineFields: capitalFields, sections: [],
    creationData: () => ({ name: t('label') }),
    engineInput(data, { model }) {
      const payoutStart = payoutReference(data);
      const timeReferences = [payoutStart];
      if (context.casePlan(model).milestones?.some(row => row.builtin === 'life' && row.personId === data.owner))
        timeReferences.push({ reference: 'life', personId: data.owner });
      return { input: { ...data, payoutStart }, timeReferences };
    },
    validateData: validate,
    totals: (data, model) => ({ assets: model?.profile?.currency === 'NOK' ? data.openingBalance : 0, liabilities: 0 }),
    summarize(data, model) {
      return { title: data.name, detail: t('restrictedCapital'), amount: new Intl.NumberFormat(model?.locale ?? 'nb-NO', {
        style: 'currency', currency: 'NOK', maximumFractionDigits: 0,
      }).format(data.openingBalance) };
    },
  });

  return { modules: [{
    ...account,
    acceptsDeposits: false,
    acceptsRemainder: false,
    secondaryView: {
      category: 'income', financesTab: 'income', label: () => t('receipt'), editor: payoutEditor, summarize: summarizePayout,
    },
    withdrawal: {
      start: data => ({ key: 'payoutStart', time: payoutReference(data) }),
      limits: (data, { model }) => ({ ...bounds(data, model), allowLifetime: false }),
      resolveStart: (data, { model, desiredDate }) => effectiveStart(data, model, desiredDate),
    },
    translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'norwegian-occupational-pension.cashle' },
    usageModel: 'identity',
  }] };
}
