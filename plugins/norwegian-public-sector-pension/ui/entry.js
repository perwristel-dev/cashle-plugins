const provider = 'cashle.finance.pension.public-sector.no';
const type = 'cashlab.norwegian-public-sector-pension';
const references = ['age', 'date', 'milestone'];
const ordinary = data => data.rules === 'ordinary';
const recipient = (data, model) => model?.profile?.people?.find(person => person.id === data.owner && person.id !== 'joint');
const validBirth = person => Number.isInteger(person?.birthYear) && person.birthYear >= 1963 && person.birthYear <= 2300 &&
  Number.isInteger(person.birthMonth) && person.birthMonth >= 1 && person.birthMonth <= 12;
const validMonth = month => /^(?:18\d\d|19\d\d|2[0-3]\d\d|2400)-(?:0[1-9]|1[0-2])$/.test(month);
const isoMonth = (year, month) => new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);

const rulesFields = [
  { key: 'rules', label: 'field.rules', kind: 'select', default: 'ordinary', options: [
    ['ordinary', 'option.ordinary'], ['confirmed', 'option.confirmed'],
  ], forecastEditable: true },
  { key: 'confirmedMonth', label: 'field.confirmedMonth', kind: 'text', default: '',
    when: data => !ordinary(data), preserveWhenInactive: true, forecastEditable: true, help: 'help.confirmed' },
];
const startField = { key: 'payoutStart', label: 'field.requestedStart', kind: 'time', when: ordinary,
  choices: references, choiceLabels: { age: 'option.age' }, default: { reference: 'age', age: 67, offset: 0 },
  hideOffset: true, currentDatePrecision: 'day', preserveWhenInactive: true, forecastEditable: true };
const rightsFields = [
  { key: 'name', label: 'field.name', kind: 'text', default: 'label' },
  { key: 'owner', label: 'field.owner', kind: 'owner', default: 'self' },
  { key: 'grossMonthlyNok', label: 'field.amount', kind: 'number', default: 0, min: 0,
    unit: 'unit.nokMonthly', help: 'help.amount' },
  ...rulesFields,
];

export default function createPlugin(context) {
  const { translate: t } = context;
  const module = context.schemaModule({
    id: 'norwegian-public-sector-pension', category: 'income', financesTab: 'income', label: 'label',
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    fields: [...rightsFields, startField], sections: [],
    creationData(model) {
      const birthYear = recipient({ owner: 'self' }, model)?.birthYear;
      return birthYear && birthYear < 1963 ? { rules: 'confirmed' } : {};
    },
    validateData(data, model) {
      const person = recipient(data, model);
      if (!person) return ['invalid.owner'];
      if (!ordinary(data)) return validMonth(data.confirmedMonth) ? [] : ['invalid.confirmed'];
      const { reference, age, offset } = data.payoutStart ?? {};
      if (!validBirth(person)) return ['invalid.cohort'];
      if (!references.includes(reference) || offset !== 0 || (reference === 'age' && (!Number.isInteger(age) || age < 0 || age > 130)))
        return ['invalid.start'];
      return [];
    },
    validateLinks(model) {
      const owners = model.modules.filter(entry => entry.type === type && entry.enabled !== false).map(entry => entry.data.owner);
      return new Set(owners).size < owners.length ? ['invalid.duplicate'] : [];
    },
    engineInput(data) {
      const { payoutStart, confirmedMonth, ...input } = data;
      if (ordinary(data)) input.payoutStart = { ...payoutStart, personId: data.owner };
      else {
        const [year, month] = confirmedMonth.split('-').map(Number);
        input.payoutStart = { reference: 'date', year, month, day: 1, offset: 0 };
      }
      return { input, timeReferences: [
        { reference: 'life', personId: data.owner },
        ...(input.payoutStart.reference === 'milestone' ? [input.payoutStart] : []),
      ] };
    },
    summarize(data) {
      const amount = new Intl.NumberFormat(context.language, { maximumFractionDigits: 2 }).format(data.grossMonthlyNok);
      return { title: data.name, amount: t('summary.amount', { amount }), detail: t('summary.right') };
    },
  });
  return { modules: [{
    ...module,
    pluginId: provider,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'norwegian-public-sector-pension.cashle' },
    usageModel: 'identity', translations: context.translations, acceptsDeposits: false, acceptsRemainder: false,
    previousCategories: ['accounts'],
  }] };
}
