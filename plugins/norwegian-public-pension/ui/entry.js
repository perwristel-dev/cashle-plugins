const pluginId = 'cashle.finance.pension.public.no';
const label = 'Folketrygdens alderspensjon';
const receiptLabel = 'Utbetalning av norsk ålderspension';
const source = 'norwegian-public-pension.cashle';
const fromBalance = data => data.basis === 'balance';
const number = (key, label, value, options = {}) => ({ key, label, kind: 'number', default: value, min: 0, ...options });
const select = (key, label, options, value, config = {}) => ({ key, label, kind: 'select', options, default: value, ...config });
const dateString = ({ year, month, day }) => `${year}-${String(month).padStart(2, '0')}-${String(day ?? 1).padStart(2, '0')}`;

export default context => {
  const capital = [
    { key: 'name', kind: 'text', label: 'Namn', default: label },
    { key: 'owner', kind: 'owner', label: 'Person', default: 'self' },
    select('basis', 'Underlag från NAV', [['balance', 'Pensjonsbeholdning'], ['nav', 'Månadsbelopp från NAV']], 'balance'),
    number('openingBalance', 'Pensjonsbeholdning', 0, { unit: 'NOK', when: fromBalance }),
    number('pensionableAnnual', 'Pensionsgrundande årsinkomst fram till uttag', 0, { unit: 'NOK', when: fromBalance, forecastEditable: true }),
    number('insuranceYears', 'Trygdetid i Norge', 40, { max: 40, integer: true, when: fromBalance }),
    select('guaranteeRate', 'Garantipension', [['high', 'Hög sats'], ['ordinary', 'Ordinarie sats']], 'high', { when: fromBalance }),
    number('navMonthly', 'Månadsbelopp från NAV före skatt vid fullt uttag', 0, { unit: 'NOK', when: data => !fromBalance(data) }),
  ];
  const payout = [
    { key: 'payoutStart', kind: 'time', label: 'Önskad uttagsstart', default: { reference: 'age', age: 67, personId: 'self', offset: 0 },
      choices: ['age', 'now', 'date', 'retirement', 'milestone'], choiceLabels: { age: 'Ålder' }, datePrecision: 'day', forecastEditable: true },
    select('fraction', 'Uttagsgrad', ['20', '40', '50', '60', '80', '100'].map(value => [value, `${value} %`]), '100', { forecastEditable: true }),
    { key: 'hasNavEarliest', kind: 'check', label: 'Jag har ett tidigaste uttagsdatum från NAV för vald uttagsgrad', default: false, forecastEditable: true },
    { key: 'navEarliest', kind: 'time', label: 'Tidigaste uttag enligt NAV',
      default: { reference: 'date', year: 2026, month: 1, offset: 0 }, choices: ['date'],
      when: data => data.hasNavEarliest, forecastEditable: true },
    { kind: 'message', label: 'Utbetalningen är livsvarig. Önskad start flyttas vid behov till en månad som tillåts enligt reglerna.' },
  ];
  const engineInput = data => ({ input: {
    name: data.name, owner: data.owner, basis: data.basis,
    openingBalance: data.openingBalance, pensionableAnnual: data.pensionableAnnual,
    insuranceYears: data.insuranceYears, guaranteeRate: data.guaranteeRate, navMonthly: data.navMonthly,
    fraction: Number(data.fraction),
    payoutStart: data.payoutStart.reference === 'age'
      ? { ...data.payoutStart, personId: data.owner }
      : data.payoutStart,
    ...(data.hasNavEarliest ? { navEarliest: dateString(data.navEarliest) } : {}),
  } });
  const money = (amount, model) => new Intl.NumberFormat(model?.locale ?? 'en', {
    style: 'currency', currency: 'NOK', maximumFractionDigits: 0,
  }).format(amount);
  const receipt = context.schemaModule({
    id: 'norwegian-public-pension-receipt', label: receiptLabel, pluginId, category: 'income', fields: payout, sections: [],
    engineInput, summarize: (data, model) => ({
      title: context.translate(receiptLabel),
      amount: fromBalance(data) ? `${data.fraction} %` : money(data.navMonthly * Number(data.fraction) / 100, model),
      detail: context.translate('Livsvarig månadsutbetalning'),
    }),
  });
  const account = context.schemaModule({
    id: 'norwegian-public-pension', label, pluginId, category: 'accounts', financesTab: 'savings',
    capabilities: { balance: true }, fields: [...capital, ...payout], inlineFields: capital, sections: [], engineInput,
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    validateData: (data, model) => {
      const person = model?.profile?.people?.find(entry => entry.id === data.owner);
      return fromBalance(data) && person?.birthYear < 1963
        ? ['För personer födda före 1963, ange ett beräknat månadsbelopp från NAV.'] : [];
    },
    summarize: (data, model) => ({ title: data.name,
      amount: money(fromBalance(data) ? data.openingBalance : data.navMonthly, model),
      detail: context.translate(fromBalance(data) ? 'Bundna pensionsrättigheter' : 'Månadsbelopp från NAV') }),
  });
  const translations = Object.fromEntries(Object.entries(context.translations).map(([locale, messages]) =>
    [locale, { label: messages[label] ?? label }]));
  return { modules: [{ ...account, acceptsDeposits: false, acceptsRemainder: false, translations, usageModel: 'identity',
    sourceModule: { language: 'groovy-cashle-plugin', provider: pluginId, source },
    secondaryView: { category: 'income', label: () => context.translate(receiptLabel), editor: receipt.editor,
      summarize: receipt.summarize },
  }] };
};
