const provider = 'cashle.finance.pension.dk.public';
const type = 'cashlab.danish-public-pension';
const startReferences = ['age', 'date', 'milestone'];
const scheduled = data => data.startMode === 'scheduled';
const deferred = data => data.claimMode === 'deferred';
const validBirth = person => Number.isInteger(person?.birthYear) && person.birthYear >= 1800 &&
  person.birthYear <= 2300 && Number.isInteger(person.birthMonth) && person.birthMonth >= 1 && person.birthMonth <= 12;
const owner = (data, model) => model?.profile?.people?.find(person => person.id === data.owner && person.id !== 'joint');

function firstEligibleMonth(person) {
  if (!validBirth(person)) return null;
  const { birthYear, birthMonth } = person;
  const cohorts = [[1953, 65], [1962, 67], [1966, 68], [1970, 69], [Infinity, 70]];
  const years = birthYear === 1954 ? (birthMonth <= 6 ? 65.5 : 66)
    : birthYear === 1955 && birthMonth <= 6 ? 66.5
      : cohorts.find(([lastYear]) => birthYear <= lastYear)[1];
  return new Date(Date.UTC(birthYear, birthMonth + years * 12, 1)).toISOString().slice(0, 10);
}

const rightsFields = [
  { key: 'name', label: 'field.name', kind: 'text', default: 'Folkepension' },
  { key: 'owner', label: 'field.owner', kind: 'owner', default: 'self' },
  { key: 'entitlementPercent', label: 'field.entitlement', kind: 'number', default: 100,
    min: 0, max: 100, integer: true, unit: '%', help: 'help.entitlement' },
  { key: 'household', label: 'field.household', kind: 'select', default: 'single', options: [
    ['single', 'option.single'], ['partner-pensioner', 'option.partnerPensioner'], ['partner-other', 'option.partnerOther'],
  ] },
  { key: 'assessableAnnualIncome', label: 'field.income', kind: 'number', default: 0,
    min: 0, unit: 'unit.annualDkk', help: 'help.income' },
];
const claimFields = [
  { key: 'startMode', label: 'field.start', kind: 'select', default: 'statutory', options: [
    ['statutory', 'option.statutory'], ['scheduled', 'option.scheduled'],
  ], forecastEditable: true },
  { key: 'payoutStart', label: 'field.requestedStart', kind: 'time', when: scheduled, choices: startReferences,
    choiceLabels: { age: 'option.age' }, hideOffset: true, currentDatePrecision: 'day', forecastEditable: true,
    preserveWhenInactive: true, help: 'help.start', default: { reference: 'age', age: 67, offset: 0 } },
  { key: 'claimMode', label: 'field.claimMode', kind: 'select', default: 'ordinary', options: [
    ['ordinary', 'option.ordinary'], ['deferred', 'option.deferred'],
  ], forecastEditable: true, help: 'help.deferral' },
  { key: 'deferralPercent', label: 'field.deferral', kind: 'number', min: 0, default: 0,
    unit: '%', when: deferred, preserveWhenInactive: true, forecastEditable: true },
];

export default function createPlugin(context) {
  const { translate: t } = context;
  const module = context.schemaModule({
    id: 'danish-public-pension', category: 'income', financesTab: 'income', label: 'label', taxCountries: ['DK'],
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    fields: [...rightsFields, ...claimFields], sections: [],
    creationData(model) {
      const profile = model?.profile;
      const partnered = profile?.mode === 'couple' || (profile?.mode === 'household' && profile.household?.hasPartner);
      return { household: partnered ? 'partner-other' : 'single' };
    },
    validateData(data, model) {
      const errors = [];
      if (!validBirth(owner(data, model))) errors.push('invalid.person');
      if (scheduled(data)) {
        const { reference, age, offset } = data.payoutStart ?? {};
        if (!startReferences.includes(reference) || offset !== 0 ||
            (reference === 'age' && (!Number.isInteger(age) || age < 0 || age > 130))) errors.push('invalid.start');
      }
      return errors;
    },
    validateLinks(model) {
      const owners = model.modules.filter(entry => entry.type === type && entry.enabled !== false).map(entry => entry.data.owner);
      return new Set(owners).size < owners.length ? ['invalid.duplicate'] : [];
    },
    engineInput(data) {
      const { startMode, payoutStart, ...input } = data;
      input.payoutStart = startMode === 'scheduled' ? { ...payoutStart, personId: input.owner } : { reference: 'statutory' };
      return { input, timeReferences: [
        { reference: 'life', personId: input.owner },
        ...(input.payoutStart.reference === 'milestone' ? [input.payoutStart] : []),
      ] };
    },
    summarize(data) {
      const percent = new Intl.NumberFormat(context.language, { style: 'percent' }).format(data.entitlementPercent / 100);
      return { title: data.name, amount: percent, detail: t('summary.rights') };
    },
  });

  return { modules: [{
    ...module,
    pluginId: provider,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'danish-public-pension.cashle' },
    usageModel: 'identity',
    translations: context.translations,
    acceptsDeposits: false,
    acceptsRemainder: false,
    previousCategories: ['accounts'],
  }] };
}
