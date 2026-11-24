const pluginId = 'cashle.finance.pension.occupational.fr.agirc-arrco';
const label = 'Retraite complémentaire Agirc-Arrco';
const fromPoints = data => data.basis === 'points';
const number = (key, label, options = {}) => ({ key, label, kind: 'number', default: 0, min: 0, ...options });
const pensionFields = [
  { key: 'name', kind: 'text', label: 'Nom', default: label },
  { key: 'owner', kind: 'owner', label: 'Titulaire', default: 'self' },
  { key: 'bornOnFirst', kind: 'check', label: 'Titulaire né le premier jour du mois', default: false },
  { key: 'basis', kind: 'select', label: 'Données Agirc-Arrco', default: 'points',
    options: [['points', 'Points du relevé de carrière'], ['quote', 'Estimation mensuelle officielle']] },
  number('points', 'Points Agirc-Arrco acquis', { when: fromPoints }),
  number('annualSalary', 'Salaire annuel brut soumis à cotisations Agirc-Arrco',
    { unit: 'EUR', when: fromPoints, forecastEditable: true }),
  number('monthlyQuote', 'Estimation mensuelle brute', { unit: 'EUR', when: data => !fromPoints(data) }),
  { key: 'quoteDate', kind: 'date', label: 'Date d’effet de l’estimation', default: '',
    required: true, when: data => !fromPoints(data) },
];
const incomeFields = [
  { key: 'claimRoute', kind: 'select', label: 'Conditions de départ en mode points', default: 'full',
    options: [['full', 'Taux plein automatique à 67 ans'], ['reduced', 'Départ indépendant avec minoration dès 57 ans']],
    forecastEditable: true, when: fromPoints },
  { key: 'payoutStart', kind: 'time', label: 'Départ souhaité', default: { reference: 'minimum', offset: 0 },
    choices: ['minimum', 'age', 'now', 'date', 'retirement', 'milestone'],
    choiceLabels: { minimum: 'Premier départ autorisé', age: 'Âge' }, datePrecision: 'day', forecastEditable: true },
  { kind: 'message', label: 'Saisissez uniquement une pension versée chaque mois.' },
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
  const quote = (data, model) => new Intl.NumberFormat(model?.locale ?? 'en', { style: 'currency', currency: 'EUR' }).format(data.monthlyQuote);
  const pension = context.schemaModule({
    id: 'french-agirc-arrco-pension', label, pluginId, category: 'income', financesTab: 'income',
    fields: [...pensionFields, ...incomeFields], sections: [], engineInput,
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    validateData: (data, model) => {
      const owner = model?.profile?.people?.find(person => data.owner === person.id);
      if (owner?.birthYear < 1955) return ['Ce module couvre les titulaires nés à partir de 1955.'];
      if (!fromPoints(data) && !/^\d{4}-\d{2}-01$/.test(data.quoteDate ?? '')) {
        return ['La date d’effet de l’estimation doit être le premier jour du mois.'];
      }
      return [];
    },
    summarize: (data, model) => ({ title: data.name,
      amount: fromPoints(data) ? new Intl.NumberFormat(model?.locale ?? 'en').format(data.points) : quote(data, model),
      detail: context.translate(fromPoints(data) ? 'Points Agirc-Arrco acquis' : 'Estimation mensuelle brute') }),
  });
  const translations = Object.fromEntries(Object.entries(context.translations).map(([locale, messages]) => [locale, { label: messages[label] ?? label }]));
  return { modules: [{ ...pension, translations, usageModel: 'identity', acceptsDeposits: false, acceptsRemainder: false,
    sourceModule: { language: 'groovy-cashle-plugin', provider: pluginId, source: 'french-agirc-arrco-pension.cashle' },
    previousCategories: ['accounts'],
  }] };
};
