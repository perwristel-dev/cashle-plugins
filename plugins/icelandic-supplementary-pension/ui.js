const provider = 'cashle.finance.pension.is.supplementary';
const contributing = data => data.grossMonthlyPay > 0;
const usingForHome = data => data.approvedHomeAmount > 0;
const money = (key, extra = {}) => ({ key, label: `field.${key}`, kind: 'number', default: 0, min: 0, unit: 'ISK', ...extra });

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value;
}

function earliestOrdinary(person, enteredDay) {
  const year = person?.birthYear;
  const month = person?.birthMonth;
  if (!Number.isInteger(year) || year < 1900 || year > 2300 || !Number.isInteger(month) || month < 1 || month > 12) return null;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = enteredDay == null || enteredDay === '' ? lastDay : enteredDay;
  if (!Number.isInteger(day) || day < 1 || day > lastDay) return null;
  const maximum = new Date(Date.UTC(year + 60, month, 0)).getUTCDate();
  return `${year + 60}-${String(month).padStart(2, '0')}-${String(Math.min(day, maximum)).padStart(2, '0')}`;
}

const savingsFields = [
  { key: 'name', label: 'field.name', kind: 'text', default: 'Séreignarsparnaður' },
  { key: 'owner', label: 'field.owner', kind: 'owner', default: 'self' },
  { key: 'birthDay', label: 'field.birthDay', kind: 'number', min: 1, max: 31, integer: true, default: null, help: 'help.birthDay' },
  money('openingCapital', { help: 'help.openingCapital' }),
  money('grossMonthlyPay', { unit: 'unit.monthly', forecastEditable: true, help: 'help.grossMonthlyPay' }),
  { key: 'employeeRate', label: 'field.employeeRate', kind: 'select', default: '4', options: [['2', '2%'], ['4', '4%']],
    when: contributing, preserveWhenInactive: true, forecastEditable: true, help: 'help.employeeRate' },
  { key: 'contributionUntil', label: 'field.contributionUntil', kind: 'date', default: '', when: contributing,
    preserveWhenInactive: true, forecastEditable: true, help: 'help.contributionUntil' },
  { key: 'annualReturn', label: 'field.annualReturn', kind: 'number', min: -99, max: 100, default: 0, unit: '%',
    help: 'help.annualReturn', forecastEditable: true },
];
const paymentFields = [
  money('approvedHomeAmount', { forecastEditable: true, help: 'help.homeAmount' }),
  { key: 'homePaymentDate', label: 'field.homePaymentDate', kind: 'date', default: '', when: usingForHome, required: true,
    preserveWhenInactive: true, forecastEditable: true },
  { key: 'ordinaryPaymentDate', label: 'field.ordinaryPaymentDate', kind: 'date', default: '',
    forecastEditable: true, help: 'help.ordinaryDate' },
];

export default function createPlugin(context) {
  const { translate: t, casePlan } = context;
  const paymentEditor = context.schemaModule({
    id: 'icelandic-supplementary-pension-payments', label: 'label.payments', category: 'income', fields: paymentFields, sections: [],
  }).editor;
  const format = value => new Intl.NumberFormat(context.language, { style: 'currency', currency: 'ISK' }).format(value);
  const module = context.schemaModule({
    id: 'icelandic-supplementary-pension', label: 'label', category: 'accounts', financesTab: 'savings', taxCountries: ['IS'],
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    fields: [...savingsFields, ...paymentFields], inlineFields: savingsFields, sections: [],
    validateData(data, model) {
      const warnings = [];
      const plan = casePlan(model);
      const person = model?.profile?.people?.find(entry => entry.id === data.owner && entry.id !== 'joint');
      const earliest = earliestOrdinary(person, data.birthDay);
      const inPlan = date => validDate(date) && (!plan?.from || date >= plan.from) && (!plan?.until || date < plan.until);
      if (!earliest) warnings.push('invalid.person');
      if (contributing(data) && data.contributionUntil &&
          (!validDate(data.contributionUntil) || data.contributionUntil < plan?.from)) warnings.push('invalid.contributions');
      if (usingForHome(data) && !inPlan(data.homePaymentDate)) warnings.push('invalid.homeDate');
      if (data.ordinaryPaymentDate && (!inPlan(data.ordinaryPaymentDate) || (earliest && data.ordinaryPaymentDate < earliest))) {
        warnings.push('invalid.ordinaryDate');
      }
      if (usingForHome(data) && data.homePaymentDate && data.ordinaryPaymentDate && data.homePaymentDate > data.ordinaryPaymentDate) {
        warnings.push('invalid.order');
      }
      return warnings;
    },
    engineInput(data) {
      const { homePaymentDate, contributionUntil, employeeRate, ...input } = data;
      input.employeeRate = Number(employeeRate ?? 4);
      if (usingForHome(data)) input.homePaymentDate = homePaymentDate;
      if (contributing(data)) input.contributionUntil = contributionUntil;
      return { input, timeReferences: [{ reference: 'life', personId: data.owner }] };
    },
    summarize(data) { return { title: data.name, amount: format(data.openingCapital) }; },
  });
  return { modules: [{ ...module, pluginId: provider, usageModel: 'identity', translations: context.translations,
    acceptsDeposits: false, acceptsRemainder: false,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'icelandic-supplementary-pension.cashle' },
    secondaryView: {
      category: 'income', financesTab: 'income', label: () => t('label.payments'), editor: paymentEditor,
      summarize(data) {
        return { title: data.name, amount: usingForHome(data) ? format(data.approvedHomeAmount) : '',
          detail: data.ordinaryPaymentDate || (usingForHome(data) ? data.homePaymentDate : '') };
      },
    },
  }] };
}
