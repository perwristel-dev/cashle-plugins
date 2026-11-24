const provider = 'cashle.finance.pension.vblklassik.de';
const type = 'cashlab.german-vblklassik-pension';
const references = ['minimum', 'age', 'date', 'milestone'];
const recipient = (data, model) => model?.profile?.people?.find(person => person.id === data.owner && person.id !== 'joint');
const integer = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
const validBirth = person => integer(person?.birthYear, 1900, 2300) && integer(person?.birthMonth, 1, 12);
const validMonth = month => /^(?:19\d{2}|2\d{3})-(?:0[1-9]|1[0-2])$/.test(month);
const isoDate = (year, month, day = 1) => new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);

function validStart(start, person) {
  if (!references.includes(start?.reference) || (start.offset ?? 0) !== 0) return false;
  if (start.reference === 'minimum') return true;
  if (start.reference === 'age') return validBirth(person) && integer(start.age, 0, 130);
  if (start.reference === 'milestone') return typeof start.milestoneId === 'string' && !!start.milestoneId.trim();
  const { year, month, day = 1 } = start;
  return integer(year, 1900, 9999) && integer(month, 1, 12) && integer(day, 1, 31) &&
    Number(isoDate(year, month, day).slice(8, 10)) === day;
}

const claimFields = [
  { key: 'firstFullPensionMonth', label: 'field.fullPensionMonth', kind: 'text', default: '',
    help: 'help.fullPensionMonth', forecastEditable: true },
  { key: 'payoutStart', label: 'field.start', kind: 'time', choices: references,
    choiceLabels: { minimum: 'option.minimum', age: 'option.age' }, default: { reference: 'minimum', offset: 0 },
    hideOffset: true, currentDatePrecision: 'day', forecastEditable: true },
];

export default function createPlugin(context) {
  const { translate: t, casePlan, resolveTimeDate } = context;
  const rightsFields = [
    { key: 'name', label: 'field.name', kind: 'text', default: 'label' },
    { key: 'owner', label: 'field.owner', kind: 'owner', default: 'self' },
    { key: 'grossMonthlyEur', label: 'field.amount', kind: 'number', default: 0, min: 0,
      unit: 'unit.eurMonthly', help: 'help.amount' },
  ];
  const claimEditor = context.schemaModule({ id: 'german-vblklassik-pension-claim', category: 'income',
    label: 'label.claim', fields: claimFields, sections: [] }).editor;
  const module = context.schemaModule({
    id: 'german-vblklassik-pension', category: 'accounts', financesTab: 'savings', label: 'label',
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    fields: [...rightsFields, ...claimFields], inlineFields: rightsFields, sections: [],
    validateData(data, model) {
      const person = recipient(data, model);
      if (!person) return ['invalid.owner'];
      if (!validMonth(data.firstFullPensionMonth)) return ['invalid.fullPensionMonth'];
      return validStart(data.payoutStart, person) ? [] : ['invalid.start'];
    },
    validateLinks(model) {
      const owners = model.modules.filter(entry => entry.type === type && entry.enabled !== false).map(entry => entry.data.owner);
      return new Set(owners).size < owners.length ? ['invalid.duplicate'] : [];
    },
    engineInput(data) {
      const start = data.payoutStart;
      return { input: data, timeReferences: [
        { reference: 'life', personId: data.owner },
        ...(start?.reference === 'milestone' ? [start] : []),
      ] };
    },
    summarize(data) {
      const amount = new Intl.NumberFormat(context.language, { maximumFractionDigits: 2 }).format(data.grossMonthlyEur);
      return { title: data.name, amount: t('summary.amount', { amount }), detail: t('summary.right') };
    },
  });
  return { modules: [{
    ...module,
    pluginId: provider,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'german-vblklassik-pension.cashle' },
    usageModel: 'identity', translations: context.translations, acceptsDeposits: false, acceptsRemainder: false,
    secondaryView: {
      category: 'income', financesTab: 'income', label: () => t('label.claim'), editor: claimEditor,
      summarize(data, model) {
        const earliest = validMonth(data.firstFullPensionMonth) ? `${data.firstFullPensionMonth}-01` : null;
        const person = recipient(data, model);
        const start = data.payoutStart;
        let date = null;
        if (earliest && validStart(start, person)) {
          let requested = earliest;
          if (start.reference === 'age') requested = isoDate(person.birthYear + start.age, person.birthMonth + 1);
          else if (start.reference !== 'minimum')
            requested = resolveTimeDate(start, { plan: casePlan(model), profile: model?.profile });
          if (requested) {
            const [year, month, day] = requested.split('-').map(Number);
            const rounded = day === 1 ? requested : isoDate(year, month + 1);
            date = rounded < earliest ? earliest : rounded;
          }
        }
        return { title: data.name, amount: t('summary.life'), detail: date ? t('summary.start', { date }) : t('summary.pending') };
      },
    },
  }] };
}
