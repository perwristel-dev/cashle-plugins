const provider = 'cashle.finance.pension.is';
const type = 'icelandic-public-pension';
const standardStart = { reference: 'age', age: 67, offset: 0, personId: 'self' };

function agePaymentDate(person, age) {
  return new Date(Date.UTC(person.birthYear + age, person.birthMonth, 1)).toISOString().slice(0, 10);
}

function paymentBounds(data, model) {
  const person = model?.profile?.people?.find(row => row.id === data.owner);
  if (!Number.isInteger(person?.birthYear) || !Number.isInteger(person?.birthMonth)) {
    return { minStart: null, maxStart: null };
  }
  return {
    minStart: agePaymentDate(person, data.earlyEligible && person.birthYear >= 1958 ? 65 : 67),
    maxStart: agePaymentDate(person, person.birthYear < 1952 ? 72 : 80),
  };
}

function resolveStart(data, model, desired) {
  const { minStart, maxStart } = paymentBounds(data, model);
  if (!minStart || !desired) return null;
  const next = new Date(`${desired.slice(0, 7)}-01T00:00:00Z`);
  if (data.payoutStart?.reference === 'age' || !desired.endsWith('-01')) {
    next.setUTCMonth(next.getUTCMonth() + 1);
  }
  const payment = next.toISOString().slice(0, 10);
  return payment < minStart ? minStart : payment > maxStart ? maxStart : payment;
}

export default function (context) {
  const t = context.translate;
  const entitlementFields = [
    { key: 'name', kind: 'text', label: 'name', default: t('label') },
    { key: 'owner', kind: 'owner', label: 'owner', default: 'self' },
    { key: 'residenceYears', kind: 'number', label: 'residenceYears', default: 40, min: 0, max: 51, help: 'residenceHelp' },
    { key: 'annualEmploymentIncome', kind: 'number', label: 'employmentIncome', default: 0, min: 0, help: 'incomeHelp' },
    { key: 'annualOtherIncome', kind: 'number', label: 'otherIncome', default: 0, min: 0, help: 'otherIncomeHelp' },
  ];
  const withdrawalFields = [
    { key: 'payoutStart', kind: 'time', label: 'start', default: standardStart, choices: ['age', 'date', 'milestone'],
      choiceLabels: { age: 'ageChoice' }, information: 'startHelp', currentDatePrecision: 'day',
      normalize: (time, _model, data) => time?.reference === 'age' ? { ...time, personId: data.owner } : time },
    { key: 'earlyEligible', kind: 'check', label: 'earlyEligible', default: false, help: 'earlyHelp' },
    { key: 'deferralEligible', kind: 'check', label: 'deferralEligible', default: false, help: 'deferralHelp' },
  ];


  const rule = context.validationRules;
  const validate = context.createValidator([
    { field: 'owner', rules: [(owner, _data, model) => owner !== 'joint' &&
      (model?.profile?.people ? model.profile.people.some(person => person.id === owner) : typeof owner === 'string')], message: 'invalidOwner' },
    { field: 'owner', when: (_, model) => Array.isArray(model?.profile?.people), rules: [(owner, _data, model) => {
      const person = model.profile.people.find(row => row.id === owner);
      return !person || (Number.isInteger(person.birthYear) && person.birthYear >= 1900 && person.birthYear <= 9900 &&
        Number.isInteger(person.birthMonth) && person.birthMonth >= 1 && person.birthMonth <= 12);
    }], message: 'invalidBirth' },
    { field: 'payoutStart', rules: [rule.time(['age', 'date', 'milestone']), (time, _data, model) =>
      Math.abs(time.offset) <= 1200 &&
      (time.reference !== 'age' || (Number.isInteger(time.age) && time.age >= 0 && time.age <= 120)) &&
      (time.reference !== 'milestone' || time.offset >= 0 ||
        context.resolveTimeDate({ ...time, offset: 0 }, model) !== null)], message: 'invalidStart' },
    { field: 'earlyEligible', rules: [rule.boolean], message: 'invalidEligibility' },
    { field: 'deferralEligible', rules: [rule.boolean], message: 'invalidEligibility' },
  ]);

  const module = context.schemaModule({
    id: type, category: 'income', financesTab: 'income', label: 'Icelandic public pension', pluginId: provider,
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    fields: [...entitlementFields, ...withdrawalFields], sections: [],
    creationData: () => ({ name: t('label') }),
    validateData: (data, model) => validate(data, model),
    engineInput(data, { model }) {
      const timeReferences = [data.payoutStart];
      if (context.casePlan(model).milestones?.some(row => row.builtin === 'life' && row.personId === data.owner)) {
        timeReferences.push({ reference: 'life', personId: data.owner });
      }
      return { input: data, timeReferences };
    },
    summarize(data) {
      return { title: data.name, detail: t(data.residenceYears < 3 ? 'minimumResidence' : 'entitlement') };
    },
  });

  return { modules: [{
    ...module,
    editor: { ...module.editor, currentKeys: ['name', 'owner', 'residenceYears'] },
    previousCategories: ['accounts'],
    withdrawal: {
      start(data) {
        const time = data.payoutStart ?? standardStart;
        return { key: 'payoutStart', time: time.reference === 'age' ? { ...time, personId: data.owner } : time };
      },
      limits: (data, { model }) => ({
        ...paymentBounds(data, model), minDuration: null, maxDuration: null, durationStep: 1,
        startLocked: data.payoutStart?.reference === 'milestone' &&
          !context.resolveTimeDate({ ...data.payoutStart, offset: 0 }, model)?.endsWith('-01'),
        lifetimeOnly: true,
      }),
      duration: () => 0,
      resolveStart: (data, { model, desiredDate }) => resolveStart(data, model, desiredDate),
      startPatch(_data, time) {
        const payoutStart = time.reference === 'age' ? { ...time, offset: time.offset - 1 }
          : time.reference === 'date' ? { ...time, day: 1 } : time;
        return { payoutStart };
      },
    },
    translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'icelandic-public-pension.cashle' },
    usageModel: 'identity',
  }] };
}
