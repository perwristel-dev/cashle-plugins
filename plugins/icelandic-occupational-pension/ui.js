const provider = 'cashle.finance.pension.is-occupational';
const type = 'icelandic-occupational-pension';
const standardStart = { reference: 'age', age: 67, offset: 0, personId: 'self' };

function paymentInMonth(month, offset, monthEnd) {
  const date = new Date(`${month}-01T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + offset + (monthEnd ? 1 : 0));
  if (monthEnd) date.setUTCDate(0);
  return date.toISOString().slice(0, 10);
}

function paymentBounds(data, model) {
  const person = model?.profile?.people?.find(row => row.id === data.owner);
  if (!Number.isInteger(person?.birthYear) || !Number.isInteger(person?.birthMonth) ||
      !Number.isInteger(data.earliestClaimAge) || !Number.isInteger(data.latestClaimAge)) {
    return { minStart: null, maxStart: null };
  }
  const monthEnd = data.paymentTiming !== 'month-start';
  const dateAtAge = age => paymentInMonth(
    `${person.birthYear + age}-${String(person.birthMonth).padStart(2, '0')}`,
    monthEnd ? 0 : 1, monthEnd,
  );
  return { minStart: dateAtAge(data.earliestClaimAge), maxStart: dateAtAge(data.latestClaimAge) };
}

function resolveStart(data, model, desired) {
  const { minStart, maxStart } = paymentBounds(data, model);
  if (!minStart || !desired) return null;
  const monthEnd = data.paymentTiming !== 'month-start';
  const advance = !monthEnd && (data.payoutStart?.reference === 'age' || !desired.endsWith('-01'));
  const payment = paymentInMonth(desired.slice(0, 7), advance ? 1 : 0, monthEnd);
  return payment < minStart ? minStart : payment > maxStart ? maxStart : payment;
}

export default function (context) {
  const t = context.translate;
  const entitlementFields = [
    { key: 'name', kind: 'text', label: 'name', default: t('label') },
    { key: 'owner', kind: 'owner', label: 'owner', default: 'self' },
    { key: 'monthlyPension', kind: 'number', label: 'monthlyPension', default: 0, min: 0,
      exclusiveMin: true, help: 'quoteHelp' },
  ];
  const withdrawalFields = [
    { key: 'payoutStart', kind: 'time', label: 'start', default: standardStart,
      choices: ['age', 'date', 'milestone'], choiceLabels: { age: 'ageChoice' },
      currentDatePrecision: 'day', information: 'startHelp',
      normalize: (time, _model, data) => time?.reference === 'age' ? { ...time, personId: data.owner } : time },
    { key: 'earliestClaimAge', kind: 'number', label: 'earliestAge', default: 67,
      min: 60, max: 120, integer: true, help: 'ageHelp' },
    { key: 'latestClaimAge', kind: 'number', label: 'latestAge', default: 67,
      min: 60, max: 120, integer: true },
    { key: 'paymentTiming', kind: 'select', label: 'paymentTiming', default: 'month-end',
      options: [['month-end', 'monthEnd'], ['month-start', 'monthStart']], help: 'timingHelp' },
  ];
  const withdrawalSummary = (data, model) => {
    const time = { ...(data.payoutStart ?? standardStart), personId: data.owner };
    const date = resolveStart(data, model, context.resolveTimeDate(time, model));
    const { maxStart } = paymentBounds(data, model);
    return { title: t('withdrawal'), amount: date ?? (maxStart ? t('milestoneStart', { date: maxStart }) : undefined),
      detail: t('lifetime') };
  };
  const withdrawalEditor = context.schemaModule({
    id: `${type}-withdrawal`, category: 'income', label: 'withdrawal',
    fields: withdrawalFields, sections: [], summarize: withdrawalSummary,
  }).editor;

  const rule = context.validationRules;
  const validate = context.createValidator([
    { field: 'owner', rules: [(owner, _data, model) => typeof owner === 'string' && owner && owner !== 'joint' &&
      (model?.profile?.people ? model.profile.people.some(person => person.id === owner) : true)],
      message: 'invalidOwner' },
    { field: 'owner', when: (_, model) => Array.isArray(model?.profile?.people), rules: [(owner, _data, model) => {
      const person = model.profile.people.find(row => row.id === owner);
      return !person || (Number.isInteger(person.birthYear) && person.birthYear >= 1900 && person.birthYear <= 9800 &&
        Number.isInteger(person.birthMonth) && person.birthMonth >= 1 && person.birthMonth <= 12);
    }], message: 'invalidBirth' },
    { field: 'latestClaimAge', rules: [(latest, data) => latest >= data.earliestClaimAge], message: 'invalidAgeRange' },
    { field: 'payoutStart', rules: [rule.time(['age', 'date', 'milestone']), (time, _data, model) =>
      Math.abs(time.offset) <= 1200 &&
      (time.reference !== 'age' || (Number.isInteger(time.age) && time.age >= 0 && time.age <= 120)) &&
      (time.reference !== 'milestone' || time.offset >= 0 ||
        context.resolveTimeDate({ ...time, offset: 0 }, model) !== null)], message: 'invalidStart' },
  ]);

  const module = context.schemaModule({
    id: type, category: 'accounts', financesTab: 'savings', label: 'Icelandic occupational pension', pluginId: provider,
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    fields: [...entitlementFields, ...withdrawalFields], inlineFields: entitlementFields, sections: [],
    creationData: () => ({ name: t('label') }),
    validateData: validate,
    engineInput(data, { model }) {
      const timeReferences = [data.payoutStart];
      if (context.casePlan(model).milestones?.some(row => row.builtin === 'life' && row.personId === data.owner)) {
        timeReferences.push({ reference: 'life', personId: data.owner });
      }
      return { input: data, timeReferences };
    },
    summarize(data, model) {
      const amount = new Intl.NumberFormat(model?.profile?.locale ?? 'is-IS', {
        style: 'currency', currency: 'ISK', maximumFractionDigits: 0,
      }).format(data.monthlyPension);
      return { title: data.name, amount, detail: t('monthlyEntitlement') };
    },
  });

  return { modules: [{
    ...module,
    editor: { ...module.editor, currentKeys: ['name', 'owner'] },
    secondaryView: { category: 'income', financesTab: 'income', label: () => t('withdrawal'),
      editor: withdrawalEditor, summarize: withdrawalSummary },
    withdrawal: {
      start(data) {
        const time = data.payoutStart ?? standardStart;
        return { key: 'payoutStart', time: time.reference === 'age' ? { ...time, personId: data.owner } : time };
      },
      limits: (data, { model }) => ({
        ...paymentBounds(data, model), minDuration: null, maxDuration: null, durationStep: 1,
        startLocked: data.paymentTiming === 'month-start' && data.payoutStart?.reference === 'milestone' &&
          !context.resolveTimeDate({ ...data.payoutStart, offset: 0 }, model)?.endsWith('-01'),
        lifetimeOnly: true,
      }),
      duration: () => 0,
      resolveStart: (data, { model, desiredDate }) => resolveStart(data, model, desiredDate),
      startPatch(data, time) {
        const payoutStart = time.reference === 'age' && data.paymentTiming === 'month-start'
          ? { ...time, offset: time.offset - 1 }
          : time.reference === 'date' ? { ...time, day: 1 } : time;
        return { payoutStart };
      },
    },
    translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'icelandic-occupational-pension.cashle' },
    usageModel: 'identity',
  }] };
}
