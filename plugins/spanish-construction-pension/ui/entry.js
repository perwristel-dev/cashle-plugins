const provider = 'cashle.finance.pension.occupational.es.construction';
const starts = ['minimum', 'age', 'date', 'retirement', 'milestone'];
const defaultStart = { reference: 'minimum', offset: 0 };
const eligibility = { key: 'eligibilityDate', kind: 'date', label: 'eligibility', help: 'eligibilityHelp', default: '', required: true };
const inputs = [
  { key: 'name', kind: 'text', label: 'name', default: 'label' },
  { key: 'owner', kind: 'owner', label: 'owner', default: 'self' },
  { key: 'capital', kind: 'number', label: 'capital', unit: 'EUR', default: 0, min: 0 },
  { key: 'contributionMonthly', kind: 'number', label: 'contribution', help: 'contributionHelp', unit: 'EUR', default: 0, min: 0, forecastEditable: true },
  { key: 'annualReturn', kind: 'number', label: 'return', unit: '%', default: 0, min: -99, max: 100, forecastEditable: true },
  eligibility,
];
const payoutMode = { key: 'payoutMode', kind: 'select', label: 'mode', default: 'monthly', options: [['monthly', 'monthly'], ['capital', 'lumpSum']], forecastEditable: true };
const payoutMonths = { key: 'payoutMonths', kind: 'number', label: 'duration', unit: 'months', default: 60, min: 2, max: 600,
  integer: true, when: data => data.payoutMode === 'monthly', forecastEditable: true };
const payoutStart = { key: 'payoutStart', kind: 'time', label: 'start', choices: starts, default: defaultStart,
  choiceLabels: { minimum: 'minimum', age: 'age' }, currentDatePrecision: 'day', forecastEditable: true };

function normalizeTime(data) {
  const time = data.payoutStart ?? defaultStart;
  if (time.reference === 'age' || (time.reference === 'retirement' && !time.personId)) return { ...time, personId: data.owner };
  return time;
}

export default function createPlugin(context) {
  const { translate, language } = context;
  const income = context.schemaModule({ id: 'spanish-construction-pension-receipt', category: 'income', label: 'income',
    fields: [payoutStart, payoutMode, payoutMonths], sections: [] });
  const savings = context.schemaModule({
    id: 'spanish-construction-pension', label: 'label', category: 'accounts', financesTab: 'savings',
    fields: [...inputs, payoutStart, payoutMode, payoutMonths], inlineFields: inputs, sections: [],
    creationData: () => ({ name: translate('label') }),
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    engineInput(data) {
      const time = normalizeTime(data);
      const timeReferences = [{ reference: 'life', personId: data.owner }];
      if (['retirement', 'milestone'].includes(time.reference)) timeReferences.push(time);
      return { input: { ...data, payoutStart: time }, timeReferences };
    },
    summarize(data) {
      const amount = new Intl.NumberFormat(language, { style: 'currency', currency: 'EUR' }).format(data.capital);
      return { title: data.name, amount, detail: translate('right') };
    },
  });
  return { modules: [{
    ...savings, capabilities: { ...savings.capabilities, balance: true }, pluginId: provider, usageModel: 'identity', translations: context.translations, acceptsDeposits: false, acceptsRemainder: false,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'spanish-construction-pension.cashle' },
    secondaryView: { category: 'income', label: () => translate('income'), editor: income.editor,
      summarize: data => ({ title: data.name, detail: translate(data.payoutMode === 'capital' ? 'lumpSum' : 'monthly') }) },
  }] };
}
