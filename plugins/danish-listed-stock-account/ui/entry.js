const provider = 'cashle.finance.dk-listed-shares';
const kind = 'DKlistedShares';
const source = { language: 'groovy-cashle-plugin', source: 'danish-listed-stock-account.cashle' };
const validId = value => typeof value === 'string' && /^DK[A-Z0-9]{9}[0-9]$/.test(value);
const validAmount = value => Number.isFinite(value) && value >= 0;

export default function createPlugin(context) {
  const sv = context.translations.sv;
  const labels = ['label', 'help', 'field.confirmed', 'field.reporting', 'help.confirmed', 'help.reporting'];
  const translations = Object.fromEntries(Object.entries(context.translations).map(([locale, messages]) => [
    locale, { ...messages, ...Object.fromEntries(labels.map(key => [sv[key], messages[key]])) },
  ]));
  const text = key => translations[context.language]?.[key] ??
    translations[context.language?.split('-')[0]]?.[key] ?? sv[key];

  return { modules: [context.investmentAccount({
    type: 'cashlab.dk-listed-shares', version: 1, pluginId: provider, kind, country: 'DK',
    label: sv.label, help: sv.help, translations,
    defaults: { policyOptions: { ordinaryHoldingConfirmed: false, lossReportingConfirmed: false } },
    policyFields: [
      { key: 'ordinaryHoldingConfirmed', label: sv['field.confirmed'], kind: 'check', help: sv['help.confirmed'] },
      { key: 'lossReportingConfirmed', label: sv['field.reporting'], kind: 'check', help: sv['help.reporting'] },
    ],
    features: {
      basis: true, inlineGrowth: true, inlineBasis: true, identifiedSecurity: true, dividendsReinvest: false,
      history: ['deposits', 'withdrawals', 'dividends', 'distributedDividends', 'realizedGain', 'realizedLoss', 'prepaidTax'],
    },
    validateOptions(options) {
      return options.ordinaryHoldingConfirmed === true && typeof options.lossReportingConfirmed === 'boolean' ? [] : [
        text('invalid.scope'),
      ];
    },
    validateAccount(data, { future }) {
      const security = data.security;
      if (!validId(security?.id) || !validAmount(security?.quantity)) return [text('invalid.security')];
      if (future) return security.quantity === 0 && security.openingPrice > 0 ? [] : [text('invalid.security')];
      return security.quantity > 0 || (data.balance === 0 && data.costBasis === 0) ? [] : [text('invalid.security')];
    },
    engineData(data, { model } = {}) {
      const otherDepots = (model?.modules ?? []).filter(entry => entry.enabled !== false && entry.data?.kind === kind &&
        entry.data.owner === data.owner && entry.data.security?.id === data.security?.id);
      const priced = otherDepots.map(entry => entry.data).filter(depot => depot.security.quantity > 0);
      if (data.security?.quantity > 0) {
        const price = data.balance / data.security.quantity;
        if (priced.some(depot => Math.abs(depot.balance / depot.security.quantity - price) >
            Math.max(1e-7, Math.abs(price) * 1e-9))) throw new Error(text('invalid.price'));
      }
      return data;
    },
    sourceModule: { ...source, provider, dependencies: [{ ...source, provider: provider + '.policy' }] },
    usageModel: 'identity',
  })] };
}
