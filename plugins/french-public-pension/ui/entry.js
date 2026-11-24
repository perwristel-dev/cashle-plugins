const pluginId = 'cashle.finance.pension.public.fr';
const label = 'Retraite de base – Assurance retraite';
const incomeLabel = 'Versement de la retraite de base';
const savingsFields = [
  { key: 'name', kind: 'text', label: 'Nom', default: label },
  { key: 'owner', kind: 'owner', label: 'Titulaire', default: 'self' },
  { key: 'bornOnFirst', kind: 'check', label: 'Titulaire né le premier jour du mois', default: false },
  { key: 'monthlyQuote', kind: 'number', label: 'Montant mensuel brut estimé par l’Assurance retraite', default: 0, min: 0, unit: 'EUR' },
];
const incomeFields = [
  { key: 'claimRoute', kind: 'select', label: 'Motif de départ', default: 'ordinary', forecastEditable: true,
    options: [['ordinary', 'Départ ordinaire'], ['inaptitude', 'Inaptitude au travail reconnue']] },
  { key: 'payoutStart', kind: 'time', label: 'Départ souhaité', default: { reference: 'minimum', offset: 0 },
    choices: ['minimum', 'age', 'now', 'date', 'retirement', 'milestone'],
    choiceLabels: { minimum: 'Premier départ autorisé', age: 'Âge' }, datePrecision: 'day', forecastEditable: true },
  { kind: 'message', label: 'Utilisez le montant estimé pour la date de départ retenue.' },
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
  const receipt = context.schemaModule({
    id: 'french-public-pension-receipt', label: incomeLabel, pluginId, category: 'income', fields: incomeFields, sections: [],
    engineInput, summarize: (data, model) => ({ title: context.translate(incomeLabel), amount: money(data, model),
      detail: context.translate('Versement mensuel viager') }),
  });
  const savings = context.schemaModule({
    id: 'french-public-pension', label, pluginId, category: 'accounts', financesTab: 'savings',
    fields: [...savingsFields, ...incomeFields], inlineFields: savingsFields, sections: [], engineInput,
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    validateData: (data, model) => {
      const owner = model?.profile?.people?.find(person => data.owner === person.id);
      return owner?.birthYear < 1955 ? ['Ce module couvre les titulaires nés à partir de 1955.'] : [];
    },
    summarize: (data, model) => ({ title: data.name, amount: money(data, model), detail: context.translate('Montant mensuel brut') }),
  });
  const translations = Object.fromEntries(Object.entries(context.translations).map(([locale, messages]) => [locale, { label: messages[label] ?? label }]));
  return { modules: [{ ...savings, translations, usageModel: 'identity', acceptsDeposits: false, acceptsRemainder: false,
    sourceModule: { language: 'groovy-cashle-plugin', provider: pluginId, source: 'french-public-pension.cashle' },
    secondaryView: { category: 'income', label: () => context.translate(incomeLabel), editor: receipt.editor, summarize: receipt.summarize },
  }] };
};
