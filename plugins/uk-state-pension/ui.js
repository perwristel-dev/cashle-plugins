const provider = 'cashle.finance.pension.gb.public';
const type = 'cashlab.uk-state-pension';
const choices = ['age', 'date', 'milestone'];
const scheduled = data => data.startMode === 'scheduled';
const olderCohort = birth => birth < '1954-10-06';

function birthDate(person, day) {
  const year = person?.birthYear;
  const month = person?.birthMonth;
  if (!Number.isInteger(year) || year < 1900 || year > 2300 || !Number.isInteger(month) || month < 1 || month > 12) return null;
  const maximum = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day == null || day === '') day = maximum;
  if (!Number.isInteger(day) || day < 1 || day > maximum) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function confirmedDate(date, birth) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '') || date < '2016-04-06') return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isFinite(+parsed) && parsed.toISOString().slice(0, 10) === date &&
    date >= `${Number(birth.slice(0, 4)) + 60}${birth.slice(4, 7)}-01` &&
    date <= `${Number(birth.slice(0, 4)) + 66}${birth.slice(4)}`;
}

const rightsFields = [
  { key: 'name', label: 'field.name', kind: 'text', default: 'UK New State Pension' },
  { key: 'owner', label: 'field.owner', kind: 'owner', default: 'self' },
  { key: 'weeklyEntitlement', label: 'field.entitlement', kind: 'number', default: 241.30,
    required: true, min: 0, unit: 'unit.weekly', help: 'help.entitlement' },
  { key: 'birthDay', label: 'field.birthDay', kind: 'number', default: null, min: 1, max: 31,
    integer: true, help: 'help.birthDay' },
  { key: 'confirmedStatePensionDate', label: 'field.confirmedDate', kind: 'date', default: '', help: 'help.confirmedDate' },
];
const claimFields = [
  { key: 'startMode', label: 'field.startMode', kind: 'select', default: 'statutory', options: [
    ['statutory', 'option.statutory'], ['scheduled', 'option.scheduled'],
  ], forecastEditable: true },
  { key: 'payoutStart', label: 'field.start', kind: 'time', when: scheduled, choices,
    choiceLabels: { age: 'option.age' }, hideOffset: true, currentDatePrecision: 'day', forecastEditable: true,
    preserveWhenInactive: true, help: 'help.start', default: { reference: 'age', age: 67, offset: 0 } },
  { key: 'increaseForDeferral', label: 'field.deferral', kind: 'check', default: false,
    when: scheduled, preserveWhenInactive: true, forecastEditable: true, help: 'help.deferral' },
];

export default function createPlugin(context) {
  const { translate: t, resolveTimeDate, casePlan } = context;
  const claimEditor = context.schemaModule({
    id: 'uk-state-pension-claim', category: 'income', label: 'label.claim', fields: claimFields, sections: [],
  }).editor;
  const format = value => new Intl.NumberFormat(context.language, { style: 'currency', currency: 'GBP' }).format(value);
  const module = context.schemaModule({
    id: 'uk-state-pension', category: 'accounts', financesTab: 'savings', label: 'label', taxCountries: ['GB'],
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    fields: [...rightsFields, ...claimFields], inlineFields: rightsFields, sections: [],
    validateData(data, model) {
      const errors = [];
      const person = model?.profile?.people?.find(entry => entry.id === data.owner && entry.id !== 'joint');
      const birth = birthDate(person, data.birthDay);
      if (!birth) errors.push('invalid.person');
      else if (olderCohort(birth) && !confirmedDate(data.confirmedStatePensionDate, birth)) errors.push('invalid.eligibility');
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
    validateLinks(model) {
      const owners = model.modules.filter(entry => entry.type === type && entry.enabled !== false).map(entry => entry.data.owner);
      return new Set(owners).size < owners.length ? ['invalid.duplicate'] : [];
    },
    engineInput(data) {
      const { startMode, payoutStart, increaseForDeferral, ...input } = data;
      input.payoutStart = scheduled(data) ? { ...payoutStart, personId: data.owner } : { reference: 'statutory' };
      input.increaseForDeferral = scheduled(data) && increaseForDeferral === true;
      return { input, timeReferences: [
        { reference: 'life', personId: data.owner },
        ...(input.payoutStart.reference === 'milestone' ? [input.payoutStart] : []),
      ] };
    },
    summarize(data) {
      return { title: data.name, amount: format(data.weeklyEntitlement), detail: t('summary.weekly') };
    },
  });

  return { modules: [{
    ...module,
    pluginId: provider,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'uk-state-pension.cashle' },
    usageModel: 'identity',
    translations: context.translations,
    acceptsDeposits: false,
    acceptsRemainder: false,
    secondaryView: {
      category: 'income', financesTab: 'income', label: () => t('label.claim'), editor: claimEditor,
      summarize(data) {
        const detail = scheduled(data) ? t('summary.scheduled') : t('option.statutory');
        return { title: data.name, amount: t('summary.lifetime'), detail };
      },
    },
  }] };
}
