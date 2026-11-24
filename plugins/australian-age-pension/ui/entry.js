const provider = 'cashle.finance.pension.au.public';
const type = 'cashlab.australian-age-pension';
const startChoices = ['age', 'date', 'milestone'];
const fullRates = { single: 1237.70, partnered: 933 };
const quoted = data => data.rate === 'quoted';
const scheduled = data => data.startMode === 'scheduled';
const ownerFor = (data, model) => model?.profile?.people?.find(person => person.id === data.owner && person.id !== 'joint');
const validBirth = owner => Number.isInteger(owner?.birthYear) && owner.birthYear >= 1800 && owner.birthYear <= 2300 &&
  Number.isInteger(owner.birthMonth) && owner.birthMonth >= 1 && owner.birthMonth <= 12;
const monthEnd = (year, month) => new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
const gross = data => quoted(data) ? data.grossFortnightly : fullRates[data.rate];

const rightsFields = [
  { key: 'name', kind: 'text', label: 'field.name', default: 'Age Pension' },
  { key: 'owner', kind: 'owner', label: 'field.owner', default: 'self' },
  { key: 'rate', kind: 'select', label: 'field.rate', default: 'quoted', forecastEditable: true,
    options: [['quoted', 'option.quoted'], ['single', 'option.single'], ['partnered', 'option.partnered']] },
  { key: 'grossFortnightly', kind: 'number', label: 'field.gross', default: 0, min: 0, when: quoted,
    preserveWhenInactive: true, forecastEditable: true, unit: 'AUD', help: 'help.gross' },
  { key: 'taxableFortnightly', kind: 'number', label: 'field.taxable', default: 0, min: 0, when: quoted,
    preserveWhenInactive: true, forecastEditable: true, unit: 'AUD', help: 'help.taxable' },
  { key: 'eligibilityConfirmed', kind: 'check', label: 'field.eligibility', default: false, forecastEditable: true,
    help: 'help.eligibility' },
];
const paymentFields = [
  { key: 'startMode', kind: 'select', label: 'field.start', default: 'statutory', forecastEditable: true,
    options: [['statutory', 'option.statutory'], ['scheduled', 'option.scheduled']] },
  { key: 'payoutStart', kind: 'time', label: 'field.requested', default: { reference: 'age', age: 67, offset: 0 },
    choices: startChoices, when: scheduled, preserveWhenInactive: true, hideOffset: true, currentDatePrecision: 'day',
    choiceLabels: { age: 'option.age' }, forecastEditable: true, help: 'help.start' },
];

export default function createPlugin(context) {
  const { translate: t, casePlan, resolveTimeDate, validationRules } = context;
  const payment = context.schemaModule({ id: 'australian-age-pension-payments', category: 'income',
    label: 'label.payments', fields: paymentFields, sections: [] });
  const module = context.schemaModule({
    id: 'australian-age-pension', category: 'accounts', financesTab: 'savings', label: 'label',
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    fields: [...rightsFields, ...paymentFields], inlineFields: rightsFields, sections: [],
    availability(model) {
      const country = model?.profile?.tax?.country;
      return country && country !== 'AU' ? [t('invalid.taxCountry')] : [];
    },
    validateData(data, model) {
      const errors = [];
      if (!validBirth(ownerFor(data, model))) errors.push('invalid.owner');
      if (quoted(data) && data.taxableFortnightly > data.grossFortnightly) errors.push('invalid.amount');
      if (gross(data) > 0 && data.eligibilityConfirmed !== true) errors.push('invalid.eligibility');
      if (scheduled(data)) {
        const time = data.payoutStart ?? {};
        if (time.offset !== 0 || !validationRules.time(startChoices)(time, data, { plan: casePlan(model) }) ||
            (time.reference === 'age' && (!Number.isInteger(time.age) || time.age < 0 || time.age > 130))) errors.push('invalid.start');
      }
      return errors;
    },
    validateLinks(model) {
      const owners = model.modules.filter(entry => entry.type === type && entry.enabled !== false).map(entry => entry.data.owner);
      return new Set(owners).size < owners.length ? ['invalid.duplicate'] : [];
    },
    engineInput(data) {
      const { startMode, payoutStart, ...input } = data;
      input.payoutStart = scheduled(data) ? { ...payoutStart, personId: data.owner } : { reference: 'statutory' };
      return { input, timeReferences: [
        { reference: 'life', personId: data.owner },
        ...(input.payoutStart.reference === 'milestone' ? [input.payoutStart] : []),
      ] };
    },
    summarize(data) {
      const amount = new Intl.NumberFormat(context.language, { style: 'currency', currency: 'AUD' }).format(gross(data));
      return { title: data.name, amount, detail: t('summary.fortnight') };
    },
  });
  return { modules: [{
    ...module, pluginId: provider, usageModel: 'identity', translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'australian-age-pension.cashle' },
    acceptsDeposits: false, acceptsRemainder: false,
    secondaryView: {
      category: 'income', financesTab: 'income', label: () => t('label.payments'), editor: payment.editor,
      summarize(data, model) {
        const person = ownerFor(data, model);
        const plan = casePlan(model);
        let date = null;
        if (validBirth(person)) {
          const floor = monthEnd(person.birthYear + 67, person.birthMonth);
          const time = data.payoutStart;
          const request = !scheduled(data) ? floor : time?.reference === 'age' && Number.isInteger(time.age)
            ? monthEnd(person.birthYear + time.age, person.birthMonth)
            : resolveTimeDate({ ...time, personId: data.owner }, { plan, profile: model?.profile });
          if (request) {
            const [year, month] = [request, floor, plan.from].filter(Boolean).sort().at(-1).split('-').map(Number);
            date = monthEnd(year, month);
          }
        }
        return { title: data.name, amount: t('summary.lifetime'),
          detail: date ? t('summary.start', { date }) : t('summary.pending') };
      },
    },
  }] };
}
