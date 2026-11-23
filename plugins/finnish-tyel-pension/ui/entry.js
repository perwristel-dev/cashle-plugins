const pluginId = 'cashle.finance.pension.occupational.fi.tyel';
const label = 'TyEL – finsk arbetspension';
const incomeLabel = 'Utbetalning av TyEL';
const savingsFields = [
  { key: 'name', kind: 'text', label: 'Namn', default: label },
  { key: 'owner', kind: 'owner', label: 'Person', default: 'self' },
  { key: 'monthlyRight', kind: 'number', label: 'Intjänad månadspension med livslängdskoefficient', default: 0, min: 0, unit: 'EUR' },
  { key: 'annualSalary', kind: 'number', label: 'Pensionsgrundande årsinkomst fram till uttag', default: 0, min: 0, unit: 'EUR', forecastEditable: true },
];
const incomeFields = [
  { key: 'payoutStart', kind: 'time', label: 'Önskad uttagsstart', default: { reference: 'minimum', offset: 0 },
    choices: ['minimum', 'age', 'now', 'date', 'retirement', 'milestone'], choiceLabels: { minimum: 'Lägsta pensionsålder', age: 'Ålder' },
    datePrecision: 'day', forecastEditable: true },
  { kind: 'message', label: 'Pensionen är livsvarig. Anställningen ska upphöra innan fullt uttag börjar.' },
];

export default context => {
  const engineInput = data => {
    const payoutStart = data.payoutStart.reference === 'age'
      ? { ...data.payoutStart, personId: data.owner }
      : data.payoutStart;
    return {
      input: { ...data, payoutStart },
      timeReferences: [{ ...payoutStart, personId: payoutStart.personId ?? data.owner }],
    };
  };
  const receipt = context.schemaModule({
    id: 'finnish-tyel-pension-receipt', label: incomeLabel, pluginId, category: 'income', fields: incomeFields, sections: [],
    engineInput, summarize: () => ({ title: context.translate(incomeLabel), detail: context.translate('Livsvarig månadsutbetalning') }),
  });
  const savings = context.schemaModule({
    id: 'finnish-tyel-pension', label, pluginId, category: 'accounts', financesTab: 'savings',
    fields: [...savingsFields, ...incomeFields], inlineFields: savingsFields, sections: [], engineInput,
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    summarize: data => ({ title: data.name,
      amount: new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(data.monthlyRight),
      detail: context.translate('Intjänad månadspension') }),
  });
  const translations = Object.fromEntries(Object.entries(context.translations).map(([locale, messages]) => [locale, { label: messages[label] ?? label }]));
  return { modules: [{ ...savings, translations, usageModel: 'identity', acceptsDeposits: false, acceptsRemainder: false,
    sourceModule: { language: 'groovy-cashle-plugin', provider: pluginId, source: 'finnish-tyel-pension.cashle' },
    secondaryView: { category: 'income', label: () => context.translate(incomeLabel), editor: receipt.editor, summarize: receipt.summarize },
  }] };
};
