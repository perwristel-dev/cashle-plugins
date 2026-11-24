const pluginId = 'cashle.finance.pension.occupational.it.cometa';
const label = 'Fondo Cometa';
const incomeLabel = 'Prestazione pensionistica Cometa';
const money = (key, label, options = {}) => ({ key, label, kind: 'number', default: 0, min: 0, unit: 'EUR', ...options });
const date = (key, label) => ({ key, label, kind: 'date', default: '', required: true });
const capitalFields = [
  { key: 'name', kind: 'text', label: 'Nome', default: label },
  { key: 'owner', kind: 'owner', label: 'Titolare', default: 'self' },
  money('positionAtClaim', 'Posizione finale stimata da Cometa'),
  date('membershipStart', 'Inizio della partecipazione continuativa utile'),
  date('mandatoryEligibility', 'Data di maturazione dei requisiti della pensione obbligatoria'),
  money('netMonthlyQuote', 'Rendita vitalizia mensile al netto delle ritenute definitive'),
  money('grossCapital', 'Capitale lordo una tantum (facoltativo)'),
  money('netCapital', 'Capitale una tantum al netto delle ritenute definitive', { when: data => data.grossCapital > 0 }),
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
      input: { ...data, payoutStart, netCapital: data.grossCapital > 0 ? data.netCapital : 0 },
      timeReferences: [{ ...payoutStart, personId: payoutStart.personId ?? data.owner }],
    };
  };
  const formatted = (value, model) => new Intl.NumberFormat(model?.locale ?? 'en', { style: 'currency', currency: 'EUR' }).format(value);
  const receipt = context.schemaModule({
    id: 'italian-cometa-pension-receipt', label: incomeLabel, pluginId, category: 'income', fields: incomeFields, sections: [],
    engineInput, summarize: (data, model) => ({ title: context.translate(incomeLabel), amount: formatted(data.netMonthlyQuote, model),
      detail: context.translate('Rendita vitalizia mensile netta') }),
  });
  const account = context.schemaModule({
    id: 'italian-cometa-pension', label, pluginId, category: 'accounts', financesTab: 'savings',
    fields: [...capitalFields, ...incomeFields], inlineFields: capitalFields, sections: [], engineInput,
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    validateData: data => {
      const errors = [];
      if (!data.membershipStart || !data.mandatoryEligibility) errors.push('Inserire entrambe le date di idoneità.');
      if (data.grossCapital > data.positionAtClaim * 0.5) errors.push('Il capitale lordo può essere al massimo il 50% della posizione.');
      if (data.grossCapital > 0 && (data.netCapital <= 0 || data.netCapital > data.grossCapital)) {
        errors.push('Inserire un capitale netto positivo che non superi quello lordo.');
      }
      if (data.grossCapital > 0 && data.netMonthlyQuote <= 0) errors.push('Inserire la rendita vitalizia residua.');
      return errors;
    },
    summarize: (data, model) => ({ title: data.name, amount: formatted(data.positionAtClaim, model), detail: context.translate('Posizione finale stimata da Cometa') }),
  });
  const translations = Object.fromEntries(Object.entries(context.translations).map(([locale, messages]) => [locale, { label: messages[label] ?? label }]));
  return { modules: [{ ...account, translations, usageModel: 'identity', acceptsDeposits: false, acceptsRemainder: false,
    sourceModule: { language: 'groovy-cashle-plugin', provider: pluginId, source: 'italian-cometa-pension.cashle' },
    secondaryView: { category: 'income', label: () => context.translate(incomeLabel), editor: receipt.editor, summarize: receipt.summarize },
  }] };
};
