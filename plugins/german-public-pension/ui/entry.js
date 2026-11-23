const provider = 'cashle.finance.pension.public.de';
const type = 'cashlab.german-public-pension';
const references = ['minimum', 'age', 'date', 'milestone'];
const defaultStart = { reference: 'minimum', offset: 0 };
const recipient = (data, model) => model?.profile?.people?.find(person => person.id === data.owner && person.id !== 'joint');
const integer = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
const validBirth = person => integer(person?.birthYear, 1900, 2300) && integer(person?.birthMonth, 1, 12);
const monthPattern = /^(?:19\d{2}|2\d{3})-(?:0[1-9]|1[0-2])$/;
const isoDate = (year, month, day = 1) => new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);

function cohortAgeMonths(year) {
  if (year >= 1964) return 67 * 12;
  if (year >= 1959) return 66 * 12 + 2 * (year - 1958);
  return 65 * 12 + Math.max(0, year - 1946);
}

function ageStart(person, months, bornOnFirst) {
  return isoDate(person.birthYear, person.birthMonth + months + (bornOnFirst ? 0 : 1));
}

function firstEligible(data, person) {
  const regular = ageStart(person, cohortAgeMonths(person.birthYear), data.bornOnFirst);
  if (!data.earliestEarlyMonth) return regular;
  const confirmed = `${data.earliestEarlyMonth}-01`;
  return monthPattern.test(data.earliestEarlyMonth) &&
    confirmed >= ageStart(person, 63 * 12, data.bornOnFirst) && confirmed < regular ? confirmed : null;
}

function validStart(start) {
  if (!references.includes(start?.reference) || (start.offset ?? 0) !== 0) return false;
  if (start.reference === 'minimum') return true;
  if (start.reference === 'age') return integer(start.age, 0, 130);
  if (start.reference === 'milestone') return typeof start.milestoneId === 'string' && !!start.milestoneId.trim();
  const { year, month, day = 1 } = start;
  return integer(year, 1900, 9999) && integer(month, 1, 12) && integer(day, 1, 31) &&
    Number(isoDate(year, month, day).slice(8, 10)) === day;
}

const startField = { key: 'payoutStart', label: 'field.start', kind: 'time',
  choices: references, choiceLabels: { minimum: 'option.minimum', age: 'option.age' }, default: defaultStart, hideOffset: true, currentDatePrecision: 'day', forecastEditable: true };
const earlyField = { key: 'earliestEarlyMonth', label: 'field.early', kind: 'text', default: '',
  help: 'help.early', forecastEditable: true };

export default function createPlugin(context) {
  const { translate: t, casePlan, resolveTimeDate } = context;
  const rightsFields = [
    { key: 'name', label: 'field.name', kind: 'text', default: 'label' },
    { key: 'owner', label: 'field.owner', kind: 'owner', default: 'self' },
    { key: 'grossMonthlyEur', label: 'field.amount', kind: 'number', default: 0, min: 0,
      unit: 'unit.eurMonthly', help: 'help.amount' },
    { key: 'bornOnFirst', label: 'field.bornOnFirst', kind: 'check', default: false },
  ];
  const claimFields = [earlyField, startField];
  const claimEditor = context.schemaModule({ id: 'german-public-pension-claim', category: 'income',
    label: 'label.claim', fields: claimFields, sections: [] }).editor;
  const module = context.schemaModule({
    id: 'german-public-pension', category: 'accounts', financesTab: 'savings', label: 'label',
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    fields: [...rightsFields, ...claimFields], inlineFields: rightsFields, sections: [],
    validateData(data, model) {
      const person = recipient(data, model);
      if (!person) return ['invalid.owner'];
      if (!validBirth(person)) return ['invalid.birth'];
      if (!firstEligible(data, person)) return ['invalid.early'];
      return validStart(data.payoutStart) ? [] : ['invalid.start'];
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
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'german-public-pension.cashle' },
    usageModel: 'identity', translations: context.translations, acceptsDeposits: false, acceptsRemainder: false,
    secondaryView: {
      category: 'income', financesTab: 'income', label: () => t('label.claim'), editor: claimEditor,
      summarize(data, model) {
        const person = recipient(data, model);
        const start = data.payoutStart;
        let date = null;
        if (validBirth(person) && validStart(start)) {
          const earliest = firstEligible(data, person);
          let requested = earliest;
          if (start.reference === 'age') requested = ageStart(person, start.age * 12, data.bornOnFirst);
          else if (start.reference !== 'minimum')
            requested = resolveTimeDate(start, { plan: casePlan(model), profile: model?.profile });
          if (earliest && requested) {
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
