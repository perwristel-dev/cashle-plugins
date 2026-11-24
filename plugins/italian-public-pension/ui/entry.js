const pluginId = 'cashle.finance.pension.public.it';
const label = 'Pensione di vecchiaia INPS';
const confirmed = data => data.claimRoute === 'confirmed';
const capitalFields = [
  { key: 'name', kind: 'text', label: 'Nome', default: label },
  { key: 'owner', kind: 'owner', label: 'Titolare', default: 'self' },
  { key: 'monthlyQuote', kind: 'number', label: 'Importo mensile lordo ordinario INPS', default: 0, min: 0, unit: 'EUR' },
  { key: 'claimRoute', kind: 'select', label: 'Requisiti di accesso', default: 'ordinary', options: [
    ['ordinary', 'Contributi anteriori al 1996, pensione ordinaria'],
    ['contributory', 'Primo contributo dal 1996, soglia INPS soddisfatta'],
    ['late-contributory', 'Primo contributo dal 1996, accesso con cinque anni effettivi'],
    ['confirmed', 'Decorrenza confermata dall’INPS'],
  ] },
  { key: 'qualifyingYears', kind: 'number', label: 'Anni di contribuzione al momento del raggiungimento dell’età', default: 0,
    min: 0, when: data => !confirmed(data) },
  { key: 'confirmedStart', kind: 'date', label: 'Data di decorrenza confermata', default: '', required: true, when: confirmed },
];
const incomeFields = [
  { key: 'payoutStart', kind: 'time', label: 'Decorrenza desiderata', default: { reference: 'minimum', offset: 0 },
    choices: ['minimum', 'age', 'now', 'date', 'retirement', 'milestone'],
    choiceLabels: { minimum: 'Prima decorrenza utile', age: 'Età' }, datePrecision: 'day', forecastEditable: true },
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
  const money = (data, model) => new Intl.NumberFormat(model?.locale ?? 'en', { style: 'currency', currency: 'EUR' }).format(data.monthlyQuote);
  const account = context.schemaModule({
    id: 'italian-public-pension', label, pluginId, category: 'income', financesTab: 'income',
    fields: [...capitalFields, ...incomeFields], sections: [], engineInput,
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    validateData: data => {
      if (confirmed(data)) {
        return /^\d{4}-\d{2}-01$/.test(data.confirmedStart ?? '') ? [] : ['La decorrenza confermata deve cadere il primo giorno del mese.'];
      }
      if (data.claimRoute === 'late-contributory') {
        return data.qualifyingYears >= 5 ? [] : ['Servono almeno cinque anni di contribuzione effettiva.'];
      }
      return data.qualifyingYears >= 20 ? [] : ['Servono almeno 20 anni di contribuzione utile.'];
    },
    summarize: (data, model) => ({ title: data.name, amount: money(data, model), detail: context.translate('Importo lordo mensile') }),
  });
  const translations = Object.fromEntries(Object.entries(context.translations).map(([locale, messages]) => [locale, { label: messages[label] ?? label }]));
  return { modules: [{ ...account, translations, usageModel: 'identity', acceptsDeposits: false, acceptsRemainder: false,
    sourceModule: { language: 'groovy-cashle-plugin', provider: pluginId, source: 'italian-public-pension.cashle' },
    previousCategories: ['accounts'],
  }] };
};
