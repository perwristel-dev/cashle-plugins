const provider = 'cashle.finance.gb-lifetime-isa';
const type = 'cashlab.gb-lifetime-isa';
const withdrawing = data => data.withdrawalReason !== 'none';
const buying = data => data.withdrawalReason === 'first-home';
const contributing = data => data.monthlyDeposit > 0;
const money = (key, extra = {}) => ({ key, label: `field.${key}`, kind: 'number', default: 0, min: 0, unit: 'GBP', ...extra });

function parsedDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value ? value : null;
}

function plusYears(date, years) {
  const [year, month, day] = date.split('-').map(Number);
  const target = year + years;
  const limit = new Date(Date.UTC(target, month, 0)).getUTCDate();
  return `${target}-${date.slice(5, 7)}-${String(Math.min(day, limit)).padStart(2, '0')}`;
}

function birthday(person, entered) {
  const year = person?.birthYear;
  const month = person?.birthMonth;
  if (!Number.isInteger(year) || year < 1900 || year > 2300 || !Number.isInteger(month) || month < 1 || month > 12) return null;
  const maximum = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = entered == null || entered === '' ? maximum : entered;
  return Number.isInteger(day) && day >= 1 && day <= maximum
    ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
}

const fields = [
  { key: 'name', label: 'field.name', kind: 'text', default: 'Lifetime ISA' },
  { key: 'owner', label: 'field.owner', kind: 'owner', default: 'self' },
  { key: 'birthDay', label: 'field.birthDay', kind: 'number', default: null, min: 1, max: 31, integer: true, help: 'help.birthDay' },
  { key: 'firstPaymentDate', label: 'field.firstPaymentDate', kind: 'date', required: true, default: '', help: 'help.firstPaymentDate' },
  money('openingBalance', { help: 'help.openingBalance' }),
  money('monthlyDeposit', { max: 4000, unit: 'unit.monthly', forecastEditable: true, help: 'help.monthlyDeposit' }),
  money('subscribedThisYear', { max: 4000, help: 'help.subscribedThisYear' }),
  money('otherIsaAnnual', { max: 20000, forecastEditable: true, help: 'help.otherIsaAnnual' }),
  { key: 'contributionUntil', label: 'field.contributionUntil', kind: 'date', default: '', when: contributing,
    forecastEditable: true, preserveWhenInactive: true, help: 'help.contributionUntil' },
  { key: 'annualReturn', label: 'field.annualReturn', kind: 'number', default: 0, min: -99, max: 100, unit: '%',
    forecastEditable: true, help: 'help.annualReturn' },
  { key: 'withdrawalReason', label: 'field.withdrawalReason', kind: 'select', default: 'none', options: [
    ['none', 'option.none'], ['ordinary', 'option.ordinary'], ['first-home', 'option.firstHome'], ['terminal', 'option.terminal'],
  ], forecastEditable: true, help: 'help.withdrawalReason' },
  { key: 'withdrawalDate', label: 'field.withdrawalDate', kind: 'date', default: '', when: withdrawing, required: true,
    forecastEditable: true, preserveWhenInactive: true },
  money('withdrawalGross', { when: withdrawing, forecastEditable: true, preserveWhenInactive: true, help: 'help.withdrawalGross' }),
  money('homePrice', { min: 0.01, when: buying, forecastEditable: true, preserveWhenInactive: true, help: 'help.homePrice' }),
];

export default function createPlugin(context) {
  const { translate: t, casePlan } = context;
  const module = context.schemaModule({
    id: 'gb-lifetime-isa', category: 'accounts', financesTab: 'savings', label: 'label', taxCountries: ['GB'],
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    fields, inlineFields: fields.slice(0, 5), sections: [],
    validateData(data, model) {
      const errors = [];
      const plan = casePlan(model);
      const person = model?.profile?.people?.find(entry => entry.id === data.owner && entry.id !== 'joint');
      const birth = birthday(person, data.birthDay);
      const first = parsedDate(data.firstPaymentDate);
      if (!birth) errors.push('invalid.owner');
      if (!first || first < '2017-04-06' || (birth && (first < plusYears(birth, 18) || first >= plusYears(birth, 40)))) {
        errors.push('invalid.firstPayment');
      }
      if (data.subscribedThisYear + data.otherIsaAnnual > 20000 ||
          (first && first >= plan?.from && (data.openingBalance > 0 || data.subscribedThisYear > 0))) {
        errors.push('invalid.subscription');
      }
      if (contributing(data) && data.contributionUntil &&
          (!parsedDate(data.contributionUntil) || (first && data.contributionUntil <= first))) errors.push('invalid.contribution');
      if (withdrawing(data)) {
        const date = parsedDate(data.withdrawalDate);
        if (!date || date < plan?.from || date >= plan?.until || (first && date < first)) errors.push('invalid.withdrawal');
        if (buying(data) && date && first && date < plusYears(first, 1)) errors.push('invalid.seasoning');
      }
      return errors;
    },
    validateLinks(model) {
      const owners = model.modules.filter(entry => entry.type === type && entry.enabled !== false).map(entry => entry.data.owner);
      return new Set(owners).size < owners.length ? ['invalid.duplicate'] : [];
    },
    engineInput(data) {
      const { contributionUntil, ...input } = data;
      if (contributing(data)) input.contributionUntil = contributionUntil;
      return { input, timeReferences: [{ reference: 'life', personId: data.owner }] };
    },
    summarize(data) {
      const format = new Intl.NumberFormat(context.language, { style: 'currency', currency: 'GBP' });
      return { title: data.name, amount: format.format(data.openingBalance), detail: contributing(data) ?
        t('summary.monthly', { amount: format.format(data.monthlyDeposit) }) : '' };
    },
  });
  return { modules: [{ ...module, pluginId: provider, usageModel: 'identity', translations: context.translations,
    acceptsDeposits: false, acceptsRemainder: false,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'lifetime-isa.cashle' },
  }] };
}
