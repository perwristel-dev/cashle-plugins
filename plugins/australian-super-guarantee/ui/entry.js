const provider = 'cashle.finance.pension.au.super-guarantee';
const startChoices = ['age', 'date', 'milestone'];
const payoutStart = { reference: 'age', age: 65, offset: 0 };
const memberFor = (data, model) => model?.profile?.people?.find(person => person.id === data.owner && person.id !== 'joint');
const validBirth = member => Number.isInteger(member?.birthYear) && member.birthYear >= 1800 && member.birthYear <= 2300 &&
  Number.isInteger(member.birthMonth) && member.birthMonth >= 1 && member.birthMonth <= 12;
const dateAfterBirthday = (person, age) => new Date(Date.UTC(person.birthYear + age, person.birthMonth, 1)).toISOString().slice(0, 10);
const monthOnOrAfter = iso => {
  const [year, month, day] = iso.split('-').map(Number);
  return day === 1 ? iso : new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
};
const timeFor = data => ({ ...(data.payoutStart ?? payoutStart), personId: data.owner });

function earliestStart(data, model) {
  const member = memberFor(data, model);
  return validBirth(member) ? dateAfterBirthday(member, data.cessationConfirmed ? 60 : 65) : null;
}

const savingsFields = [
  { key: 'name', kind: 'text', label: 'field.name', default: 'Employer super' },
  { key: 'owner', kind: 'owner', label: 'field.owner', default: 'self' },
  { key: 'openingBalance', kind: 'number', label: 'field.balance', default: 0, min: 0, unit: 'AUD' },
  { key: 'qualifyingAnnualEarnings', kind: 'number', label: 'field.earnings', default: 0, min: 0,
    unit: 'AUD', forecastEditable: true, help: 'help.earnings' },
  { key: 'currentYearPriorEarnings', kind: 'number', label: 'field.priorEarnings', default: 0, min: 0,
    unit: 'AUD', help: 'help.priorEarnings' },
  { key: 'contributeAfterStart', kind: 'check', label: 'field.continueContributions', default: false,
    forecastEditable: true, help: 'help.continueContributions' },
  { key: 'annualReturn', kind: 'number', label: 'field.return', default: 0, min: -99, max: 100,
    unit: '%', forecastEditable: true, help: 'help.return' },
];
const paymentFields = [
  { key: 'payoutStart', kind: 'time', label: 'field.start', default: payoutStart, choices: startChoices,
    choiceLabels: { age: 'option.age' }, hideOffset: true, currentDatePrecision: 'day', forecastEditable: true, help: 'help.start' },
  { key: 'cessationConfirmed', kind: 'check', label: 'field.cessation', default: false,
    forecastEditable: true, help: 'help.cessation' },
  { key: 'transferCap', kind: 'number', label: 'field.cap', default: 2100000, min: 0,
    unit: 'AUD', forecastEditable: true, help: 'help.cap' },
  { key: 'monthlyWithdrawal', kind: 'number', label: 'field.withdrawal', default: 0, min: 0,
    unit: 'AUD', forecastEditable: true, help: 'help.withdrawal' },
];

export default function createPlugin(context) {
  const { translate: t, casePlan, resolveTimeDate, validationRules } = context;
  const payment = context.schemaModule({ id: 'australian-super-guarantee-payments', category: 'income',
    label: 'label.payments', fields: paymentFields, sections: [] });
  const module = context.schemaModule({
    id: 'australian-super-guarantee', category: 'accounts', financesTab: 'savings', label: 'label',
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    capabilities: { balance: true },
    fields: [...savingsFields, ...paymentFields], inlineFields: savingsFields, sections: [],
    availability(model) {
      const country = model?.profile?.tax?.country;
      return country && country !== 'AU' ? [t('invalid.taxCountry')] : [];
    },
    validateData(data, model) {
      const errors = [];
      if (!validBirth(memberFor(data, model))) errors.push('invalid.owner');
      const plan = casePlan(model);
      const time = timeFor(data);
      if (time.offset !== 0 || !validationRules.time(startChoices)(time, data, { plan }) ||
          (time.reference === 'age' && (!Number.isInteger(time.age) || time.age < 0 || time.age > 130))) errors.push('invalid.start');
      if (data.currentYearPriorEarnings > 0 && (plan.from < '2026-07-01' || plan.from?.slice(5) === '07-01')) {
        errors.push('invalid.prior');
      }
      return errors;
    },
    engineInput(data, { model }) {
      const payoutStart = timeFor(data);
      const timeReferences = payoutStart.reference === 'milestone' ? [payoutStart] : [];
      if (casePlan(model).milestones?.some(row => row.builtin === 'life' && row.personId === data.owner)) {
        timeReferences.push({ reference: 'life', personId: data.owner });
      }
      return { input: { ...data, payoutStart }, timeReferences };
    },
    totals(data, model) {
      return { assets: model?.profile?.currency === 'AUD' ? data.openingBalance : 0, liabilities: 0 };
    },
    summarize(data) {
      const amount = new Intl.NumberFormat(context.language, { style: 'currency', currency: 'AUD' }).format(data.openingBalance);
      return { title: data.name, amount, detail: t('summary.balance') };
    },
  });

  return { modules: [{
    ...module, pluginId: provider, usageModel: 'identity', translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'australian-super-guarantee.cashle' },
    acceptsDeposits: false, acceptsRemainder: false,
    secondaryView: {
      category: 'income', financesTab: 'income', label: () => t('label.payments'), editor: payment.editor,
      summarize(data, model) {
        const member = memberFor(data, model);
        const plan = casePlan(model);
        const time = timeFor(data);
        const earliest = earliestStart(data, model);
        const requested = time.reference === 'age' && validBirth(member) && Number.isInteger(time.age)
          ? dateAfterBirthday(member, time.age)
          : resolveTimeDate(time, { plan, profile: model?.profile });
        const date = requested && earliest
          ? monthOnOrAfter([requested, earliest, plan.from].filter(Boolean).sort().at(-1)) : null;
        return { title: data.name, amount: t('summary.payout'),
          detail: date ? t('summary.start', { date }) : t('summary.pending') };
      },
    },
  }] };
}
