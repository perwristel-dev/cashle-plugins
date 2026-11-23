const provider = 'cashle.finance.pension.ca';
const type = 'cashlab.canadian-public-pension';
const choices = ['age', 'date', 'retirement', 'milestone', 'now'];
const defaultStart = { reference: 'age', age: 65, offset: 0 };
const money = value => Number.isFinite(value) && value >= 0;
const validMonth = value => typeof value === 'string' && /^(?:19\d\d|[2-9]\d{3})-(?:0[1-9]|1[0-2])$/.test(value);
const validStart = start => choices.includes(start?.reference) && Number.isInteger(start.offset ?? 0) &&
  Math.abs(start.offset ?? 0) <= 1800 &&
  (start.reference !== 'age' || (Number.isInteger(start.age) && start.age >= 0 && start.age <= 125)) &&
  (start.reference !== 'milestone' || (typeof start.milestoneId === 'string' && !!start.milestoneId.trim()));
const hasOas = data => data.oasYears >= 10 && data.oasMonthly > 0;
const newOas = data => hasOas(data) && !data.oasReceiving;
const reachesFullOas = data => newOas(data) && data.oasYears === 40 && data.oasQualifyingYears >= 10 && data.oasQualifyingYears < 40;
const dateMonth = value => typeof value === 'string' && value ? value.slice(0, 7) : '';

const rights = [
  { key: 'name', label: 'field.name', kind: 'text', default: 'label' },
  { key: 'owner', label: 'field.owner', kind: 'owner', default: 'self' },
  { key: 'plan', label: 'field.plan', kind: 'select', default: 'cpp', options: [['cpp', 'CPP'], ['qpp', 'QPP']] },
  { key: 'earningsMonthly', label: 'field.earningsMonthly', kind: 'number', default: 0, min: 0, unit: 'unit.month', help: 'help.earnings' },
  { key: 'earningsReceiving', label: 'field.earningsReceiving', kind: 'check', default: false, forecastEditable: true },
  { key: 'qppEarlyRate', label: 'field.qppEarlyRate', kind: 'number', default: 0.6, min: 0.5, max: 0.6, unit: '%',
    when: data => data.plan === 'qpp' && !data.earningsReceiving, preserveWhenInactive: true, help: 'help.qppEarlyRate' },
];
const oas = [
  { key: 'oasYears', label: 'field.oasYears', kind: 'number', default: 0, min: 0, max: 40, integer: true, help: 'help.oasYears' },
  { key: 'oasMonthly', label: 'field.oasMonthly', kind: 'number', default: 762.5, min: 0, unit: 'unit.month',
    when: data => data.oasYears >= 10, preserveWhenInactive: true, help: 'help.oasMonthly' },
  { key: 'oasReceiving', label: 'field.oasReceiving', kind: 'check', default: false,
    when: data => data.oasYears >= 10, preserveWhenInactive: true, forecastEditable: true },
  { key: 'oasFirstPayment', label: 'field.oasFirstPayment', kind: 'date', default: '',
    when: newOas, preserveWhenInactive: true, help: 'help.oasFirstPayment' },
  { key: 'oasQualifyingYears', label: 'field.oasQualifyingYears', kind: 'number', default: 0, min: 0, max: 40, integer: true,
    when: newOas, preserveWhenInactive: true, help: 'help.oasQualifyingYears' },
  { key: 'oasFullPayment', label: 'field.oasFullPayment', kind: 'date', default: '',
    when: reachesFullOas, preserveWhenInactive: true },
  { key: 'gisMonthly', label: 'field.gisMonthly', kind: 'number', default: 0, min: 0, unit: 'unit.month',
    when: hasOas, preserveWhenInactive: true, help: 'help.gis' },
  { key: 'gisThrough', label: 'field.gisThrough', kind: 'text', default: '', when: data => hasOas(data) && data.gisMonthly > 0,
    preserveWhenInactive: true, forecastEditable: true },
];
const startField = (key, label, when) => ({
  key, label, kind: 'time', default: defaultStart, choices, choiceLabels: { age: 'field.age' }, when, currentDatePrecision: 'day',
  preserveWhenInactive: true, forecastEditable: true,
});
const starts = [
  startField('earningsStart', 'field.earningsStart', data => data.earningsMonthly > 0 && !data.earningsReceiving),
  startField('oasStart', 'field.oasStart', data => hasOas(data) && !data.oasReceiving),
];

export default function createPlugin(context) {
  const { translate: t } = context;
  const module = context.schemaModule({
    id: 'canadian-public-pension', category: 'accounts', financesTab: 'savings', label: 'label',
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    fields: [...rights, ...oas, ...starts], inlineFields: rights,
    sections: [{ id: 'oas', title: t('section.oas'), fields: oas }],
    creationData: () => ({ name: t('label') }),
    validateData(data, model) {
      const person = model?.profile?.people?.find(person => person.id === data.owner && ['self', 'partner'].includes(person.id));
      const errors = [];
      if (!Number.isInteger(person?.birthYear) || person.birthYear < 1900 || person.birthYear > 9999 ||
          !Number.isInteger(person?.birthMonth) || person.birthMonth < 1 || person.birthMonth > 12) errors.push('invalid.owner');
      if (typeof data.name !== 'string' || !data.name.trim() || data.name.trim().length > 80) errors.push('invalid.name');
      if (!['cpp', 'qpp'].includes(data.plan)) errors.push('invalid.plan');
      if (!money(data.earningsMonthly) || typeof data.earningsReceiving !== 'boolean') errors.push('invalid.earnings');
      if (data.plan === 'qpp' && !data.earningsReceiving && data.earningsMonthly > 0 &&
          (!money(data.qppEarlyRate) || data.qppEarlyRate < 0.5 || data.qppEarlyRate > 0.6)) errors.push('invalid.qppRate');
      if (!Number.isInteger(data.oasYears) || data.oasYears < 0 || data.oasYears > 40 ||
          (data.oasYears > 0 && data.oasYears < 10) || !money(data.oasMonthly) || typeof data.oasReceiving !== 'boolean') errors.push('invalid.oas');
      if (newOas(data) && ((data.oasFirstPayment && !validMonth(dateMonth(data.oasFirstPayment))) ||
          (!Number.isInteger(data.oasQualifyingYears) || (data.oasQualifyingYears !== 0 &&
            (data.oasQualifyingYears < 10 || data.oasQualifyingYears > data.oasYears))))) errors.push('invalid.oasQualification');
      if (reachesFullOas(data) && (!validMonth(dateMonth(data.oasFullPayment)) ||
          dateMonth(data.oasFullPayment) < dateMonth(data.oasFirstPayment))) errors.push('invalid.oasFullQualification');
      if (hasOas(data) && (!money(data.gisMonthly) || (data.gisMonthly > 0 && !validMonth(data.gisThrough)))) errors.push('invalid.gis');
      if (data.earningsMonthly > 0 && !data.earningsReceiving && !validStart(data.earningsStart)) errors.push('invalid.earningsStart');
      if (hasOas(data) && !data.oasReceiving && !validStart(data.oasStart)) errors.push('invalid.oasStart');
      return errors;
    },
    validateLinks(model) {
      const owners = model.modules.filter(entry => entry.type === type && entry.enabled !== false).map(entry => entry.data.owner);
      return new Set(owners).size < owners.length ? ['invalid.duplicate'] : [];
    },
    engineInput(data) {
      const input = {
        ...data, gisMonthly: hasOas(data) ? data.gisMonthly : 0,
        oasFirstPayment: dateMonth(data.oasFirstPayment), oasFullPayment: dateMonth(data.oasFullPayment),
      };
      const timeReferences = [{ reference: 'life', personId: data.owner }];
      for (const [key, active] of [
        ['earningsStart', data.earningsMonthly > 0 && !data.earningsReceiving], ['oasStart', hasOas(data) && !data.oasReceiving],
      ]) {
        if (!active) continue;
        input[key] = { ...data[key], personId: data.owner };
        if (['retirement', 'milestone'].includes(input[key].reference)) timeReferences.push(input[key]);
      }
      return { input, timeReferences };
    },
    summarize(data) {
      const amount = new Intl.NumberFormat(context.language, { style: 'currency', currency: 'CAD' }).format(data.earningsMonthly);
      return { title: data.name, amount: data.earningsMonthly > 0 ? `${amount} ${t('unit.perMonth')}` : '', detail: t('summary.rights') };
    },
  });
  const claimEditor = context.schemaModule({
    id: 'canadian-public-pension-claim', category: 'income', label: 'label.claim', fields: starts, sections: [],
  }).editor;
  return { modules: [{
    ...module,
    pluginId: provider,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'canadian-public-pension.cashle' },
    taxCountries: ['CA'], usageModel: 'identity', translations: context.translations, acceptsDeposits: false, acceptsRemainder: false,
    secondaryView: {
      category: 'income', financesTab: 'income', label: () => t('label.claim'), editor: claimEditor,
      summarize: data => ({ title: data.name, amount: t('summary.lifetime'), detail: t('summary.claim') }),
    },
  }] };
}
