const provider = 'cashle.finance.pension.federal-public-service.ca';
const type = 'cashlab.canadian-federal-public-service-pension';
const choices = ['retirement', 'age', 'date', 'milestone', 'now'];
const money = value => Number.isFinite(value) && value >= 0;
const rights = [
  { key: 'name', label: 'field.name', kind: 'text', default: 'label' },
  { key: 'owner', label: 'field.owner', kind: 'owner', default: 'self' },
  { key: 'group', label: 'field.group', kind: 'select', default: 'group2', options: [
    ['group1', 'option.group1'], ['group2', 'option.group2'],
  ] },
  { key: 'serviceYears', label: 'field.service', kind: 'number', default: 2, min: 2, max: 35, unit: 'unit.years' },
  { key: 'annualLifetime', label: 'field.lifetime', kind: 'number', default: 0, min: 0, unit: 'unit.annual', help: 'help.lifetime' },
  { key: 'annualBridge', label: 'field.bridge', kind: 'number', default: 0, min: 0, unit: 'unit.annual', help: 'help.bridge' },
];
const payout = [
  { key: 'benefit', label: 'field.benefit', kind: 'select', default: 'unreduced', options: [
    ['unreduced', 'option.unreduced'], ['allowance', 'option.allowance'],
  ], forecastEditable: true },
  { key: 'payoutStart', label: 'field.start', kind: 'time', default: { reference: 'retirement', offset: 0 },
    choices, choiceLabels: { age: 'field.age' }, currentDatePrecision: 'day', forecastEditable: true, help: 'help.start' },
];

export default function createPlugin(context) {
  const { translate: t } = context;
  const main = context.schemaModule({
    id: 'canadian-federal-public-service-pension', category: 'income', financesTab: 'income', label: 'label',
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    fields: [...rights, ...payout], sections: [],
    creationData: () => ({ name: t('label') }),
    validateData(data, model) {
      const person = model?.profile?.people?.find(person => person.id === data.owner && ['self', 'partner'].includes(person.id));
      const errors = [];
      if (!Number.isInteger(person?.birthYear) || person.birthYear < 1900 || person.birthYear > 9999 ||
          !Number.isInteger(person?.birthMonth) || person.birthMonth < 1 || person.birthMonth > 12) errors.push('invalid.owner');
      if (typeof data.name !== 'string' || !data.name.trim() || data.name.trim().length > 80) errors.push('invalid.name');
      if (!['group1', 'group2'].includes(data.group)) errors.push('invalid.group');
      if (!Number.isFinite(data.serviceYears) || data.serviceYears < 2 || data.serviceYears > 35) errors.push('invalid.service');
      if (!money(data.annualLifetime) || !money(data.annualBridge)) errors.push('invalid.amount');
      if (!['unreduced', 'allowance'].includes(data.benefit)) errors.push('invalid.benefit');
      const start = data.payoutStart;
      if (!choices.includes(start?.reference) || !Number.isInteger(start.offset ?? 0) || Math.abs(start.offset ?? 0) > 1800 ||
          (start.reference === 'age' && (!Number.isInteger(start.age) || start.age < 0 || start.age > 125))) errors.push('invalid.start');
      return errors;
    },
    validateLinks(model) {
      const owners = model.modules.filter(entry => entry.type === type && entry.enabled !== false).map(entry => entry.data.owner);
      return new Set(owners).size < owners.length ? ['invalid.duplicate'] : [];
    },
    engineInput(data) {
      const payoutStart = { ...data.payoutStart, personId: data.owner };
      return { input: { ...data, payoutStart }, timeReferences: [
        { reference: 'life', personId: data.owner },
        ...(['retirement', 'milestone'].includes(payoutStart.reference) ? [payoutStart] : []),
      ] };
    },
    summarize(data) {
      const annual = new Intl.NumberFormat(context.language, { style: 'currency', currency: 'CAD' }).format(data.annualLifetime);
      return { title: data.name, amount: `${annual} ${t('unit.perYear')}`, detail: t('summary.rights') };
    },
  });
  return { modules: [{
    ...main, pluginId: provider,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'canadian-federal-public-service-pension.cashle' },
    taxCountries: ['CA'], usageModel: 'identity', translations: context.translations, acceptsDeposits: false, acceptsRemainder: false,
    previousCategories: ['accounts'],
  }] };
}
