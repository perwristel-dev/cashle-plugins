const provider = 'cashle.finance.de-life-insurance';
const source = { language: 'groovy-cashle-plugin', source: 'german-life-insurance.cashle' };
const leastContractDate = '2018-01-01';
const validDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const twelfthAnniversary = opened => {
  const [year, month, day] = opened.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year + 12, month, 0)).getUTCDate();
  return new Date(Date.UTC(year + 12, month - 1, Math.min(day, lastDay))).toISOString().slice(0, 10);
};

export default function createPlugin(context) {
  const swedish = context.translations.sv;
  const translations = Object.fromEntries(Object.entries(context.translations).map(([locale, messages]) => [locale, {
    ...messages,
    ...Object.fromEntries(['label', 'help', 'field.opened', 'field.halfGainFrom', 'halfGainHelp']
      .map(key => [swedish[key], messages[key]])),
  }]));
  const text = key => translations[context.language]?.[key] ??
    translations[context.language?.split('-')[0]]?.[key] ?? swedish[key];

  return { modules: [context.investmentAccount({
    type: 'cashlab.de-life-insurance',
    version: 1,
    pluginId: provider,
    kind: 'DEunitLinkedLife',
    country: 'DE',
    label: swedish.label,
    help: swedish.help,
    translations,
    defaults: { policyOptions: { acquiredDate: '', halfGainFrom: '' },
      liquidity: { withdrawals: 'never', liquid: 'never' }, allowTransfers: false },
    features: { basis: true, plannedSales: false, dividendsReinvest: false, canAdd: false, history: [] },
    policyFields: [
      { key: 'acquiredDate', label: swedish['field.opened'], kind: 'date', required: true },
      { key: 'halfGainFrom', label: swedish['field.halfGainFrom'], kind: 'date', help: swedish.halfGainHelp },
    ],
    validateOptions(options, data) {
      if (!validDate(options.acquiredDate) || options.acquiredDate < leastContractDate) return [text('invalid.contract')];
      if (options.halfGainFrom && (!validDate(options.halfGainFrom) ||
          options.halfGainFrom < twelfthAnniversary(options.acquiredDate))) return [text('invalid.eligibility')];
      if (data.closeEnabled && (!validDate(data.closeDate) || data.closeDate < options.acquiredDate))
        return [text('invalid.close')];
      return [];
    },
    validateAccount(data, { future }) {
      if (future || data.allowTransfers || data.liquidity?.withdrawals !== 'never' ||
          data.liquidity?.liquid !== 'never' || data.dividendRate !== 0 ||
          ['deposits', 'dividends', 'distributedDividends', 'withdrawals', 'realizedGain', 'realizedLoss', 'prepaidTax']
            .some(key => (data.initialYear?.[key] ?? 0) !== 0)) return [text('invalid.structure')];
      return [];
    },
    sourceModule: { ...source, provider, dependencies: [{ ...source, provider: provider + '.policy' }] },
    usageModel: 'identity',
  })] };
}
