const provider = 'cashle.finance.pension.public.es';
const starts = ['minimum', 'age', 'date', 'retirement', 'milestone'];
const defaultStart = { reference: 'minimum', offset: 0 };
const confirmed = { key: 'confirmedStart', kind: 'date', label: 'confirmed', help: 'confirmedHelp', default: '', required: false, forecastEditable: true };
const inputs = [
  { key: 'name', kind: 'text', label: 'name', default: 'label' },
  { key: 'owner', kind: 'owner', label: 'owner', default: 'self' },
  { key: 'grossMonthly', kind: 'number', label: 'gross', help: 'quoteHelp', unit: 'EUR', default: 0, min: 0, forecastEditable: true },
  { key: 'contributionMonths', kind: 'number', label: 'coverage', unit: 'months', default: 456, min: 0, max: 900, integer: true },
  { key: 'recentCoverage', kind: 'check', label: 'recent', default: true },
  confirmed,
];
const payoutStart = { key: 'payoutStart', kind: 'time', label: 'start', choices: starts, default: defaultStart,
  choiceLabels: { minimum: 'minimum', age: 'age' }, currentDatePrecision: 'day', forecastEditable: true };

function normalizeTime(data) {
  const time = data.payoutStart ?? defaultStart;
  if (time.reference === 'age' || (time.reference === 'retirement' && !time.personId)) return { ...time, personId: data.owner };
  return time;
}

export default function createPlugin(context) {
  const { translate, language } = context;
  const pension = context.schemaModule({
    id: 'spanish-public-pension', label: 'label', category: 'income', financesTab: 'income',
    fields: [...inputs, payoutStart], sections: [],
    creationData: () => ({ name: translate('label') }),
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    engineInput(data) {
      const time = normalizeTime(data);
      const timeReferences = [{ reference: 'life', personId: data.owner }];
      if (['retirement', 'milestone'].includes(time.reference)) timeReferences.push(time);
      return { input: { ...data, payoutStart: time }, timeReferences };
    },
    summarize(data) {
      const amount = new Intl.NumberFormat(language, { style: 'currency', currency: 'EUR' }).format(data.grossMonthly);
      return { title: data.name, amount, detail: translate('right') };
    },
  });
  return { modules: [{
    ...pension, pluginId: provider, usageModel: 'identity', translations: context.translations, acceptsDeposits: false, acceptsRemainder: false,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'spanish-public-pension.cashle' },
    previousCategories: ['accounts'],
  }] };
}
