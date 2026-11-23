const kind = 'SEvp';

/** A holding can be unidentified or have an explicit identity with zero shares. */
export function validateVpSecurity(data, future = false) {
  if (data?.kind !== kind || data.security == null) return [];
  const security = data.security;
  if (!security || typeof security !== 'object' || Array.isArray(security)) return ['Ange ett giltigt aktieinnehav.'];
  const errors = [];
  if (typeof security.id !== 'string' || !security.id.trim() || security.id !== security.id.trim() || security.id.length > 80)
    errors.push('Ange aktiens identitet utan inledande eller avslutande blanksteg.');
  if (!Number.isFinite(security.quantity) || security.quantity < 0 || (!future && data.balance > 0 && security.quantity === 0))
    errors.push('Ange ett giltigt antal aktier; ett innehav med värde måste ha fler än noll aktier.');
  if (future && security.quantity !== 0) errors.push('En framtida VP-depå ska ha noll aktier vid kalkylstart.');
  if (!future && security.quantity === 0 && data.costBasis > 0) errors.push('Ett tomt aktieinnehav kan inte ha omkostnadsbelopp.');
  if ((future || security.openingPrice != null) && (!Number.isFinite(security.openingPrice) || security.openingPrice <= 0))
    errors.push('Ange en positiv nominell aktiekurs vid den framtida öppningen.');
  return errors;
}

/** A precise pool requires identifying every VP holding of the same owner. */
export function validateVpSecurityCoverage(entries) {
  const accounts = (entries ?? []).filter(entry => entry.data?.kind === kind);
  const identifiedOwners = new Set(accounts.filter(entry => entry.data.security != null).map(entry => entry.data.owner));
  return accounts.filter(entry => identifiedOwners.has(entry.data.owner) && entry.data.security == null)
    .map(entry => ({
      moduleId: entry.id,
      message: 'Ange aktieslag även för ägarens övriga VP-depåer innan gemensamt omkostnadsbelopp kan beräknas.',
    }));
}

const canonical = value => {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
};
const priceAssumptions = data => JSON.stringify(canonical({ yield: data.yield, dividendRate: data.dividendRate, dividendFrequency: data.dividendFrequency }));

/** The same owner/security cannot represent two prices or price trajectories.
 * Different owners have independent pools. Call only with active entries.
 */
export function validateSharedVpSecurityPrices(entries) {
  const groups = new Map();
  for (const entry of entries ?? []) {
    const data = entry.data;
    if (data?.kind !== kind || !data.security || typeof data.security.id !== 'string' || !data.security.id.trim()
        || !Number.isFinite(data.security.quantity) || data.security.quantity < 0) continue;
    const key = JSON.stringify([data.owner, data.security.id]);
    const group = groups.get(key) ?? [];
    group.push(entry);
    groups.set(key, group);
  }
  const diagnostics = [];
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const assumptions = priceAssumptions(group[0].data);
    const priced = group.filter(({ data }) => data.security.quantity > 0);
    const price = priced.length ? priced[0].data.balance / priced[0].data.security.quantity : null;
    if (group.some(({ data }) => priceAssumptions(data) !== assumptions) ||
        priced.some(({ data }) => Math.abs(data.balance / data.security.quantity - price) > Math.max(1e-8, Math.abs(price) * 1e-9))) {
      for (const entry of group) diagnostics.push({
        moduleId: entry.id,
        message: 'Samma aktie för samma ägare måste ha samma kurs och avkastningsantaganden i alla depåer.',
      });
    }
  }
  return diagnostics;
}

export default function (context) {
  const provider = 'cashle.finance.vp';
  const source = { language: 'groovy-cashle-plugin', source: 'swedish-vp.cashle' };
  return {
    modules: [context.investmentAccount({
      type: 'cashlab.vp', kind, country: 'SE', label: 'VP, aktie/fond',
      translations: context.translations,
      help: 'Svensk depå med aktier och fonder: vinster och förluster uppskattas från marknadsvärde och genomsnittligt omkostnadsbelopp. Nya köp ökar omkostnadsbeloppet; delförsäljningar minskar det proportionellt.',
      features: {
        basis: true, basisDefaultsToBalance: true, plannedSales: true, inlineGrowth: true, inlineBasis: true, identifiedSecurity: true,
        history: ['deposits', 'withdrawals', 'dividends', 'realizedGain', 'realizedLoss', 'distributedDividends', 'prepaidTax'],
      },
      validateAccount: (data, { future }) => validateVpSecurity(data, future),
      engineData(data, exportContext) {
        const entries = (exportContext?.model?.modules ?? []).filter(entry => entry.enabled !== false
          && entry.data?.kind === kind && entry.data.owner === data.owner);
        const errors = [...validateVpSecurityCoverage(entries), ...validateSharedVpSecurityPrices(entries)];
        if (errors.length) throw new Error(context.translations?.[context.language]?.[errors[0].message] ?? errors[0].message);
        return { ...data, costBasis: data.costBasis ?? data.balance };
      },
      emigrationSettings: {
        defaultOptions: { securitiesClassification: 'qualifying-shares', securitiesTreatyExemptionConfirmed: false, treatyCouponRate: .30 },
        fields: [
          { key: 'securitiesClassification', kind: 'select', label: 'Klassificering efter svensk utflyttning', options: [
            ['qualifying-shares', 'Aktier som omfattas av tioårsregeln (förvalt)'], ['fund', 'Fondandelar'],
            ['excluded', 'Undantagna innehav'], ['unknown', 'Okänd klassificering'],
          ], help: 'Kontots förval är vanliga aktier förvärvade före flytten. Ändra om detta inte stämmer.' },
          { key: 'securitiesTreatyExemptionConfirmed', kind: 'check', label: 'Bekräftad avtalsbegränsning undantar värdepappersvinster från svensk skatt' },
          { key: 'treatyCouponRate', kind: 'number', label: 'Bekräftad kupongskatt enligt avtal', percent: true, min: 0, max: .30, help: '30 % enligt nationella regler är förval. Skatteavtal kan begränsa svensk utdelningsskatt.' },
        ],
        invalidOptions: 'Ange giltiga inställningar för svensk skatt efter utflyttning.',
        assumptions: data => (data.emigrationOptions?.securitiesClassification ?? 'qualifying-shares') === 'qualifying-shares'
          ? ['Svensk aktiedepå: vanliga aktier förvärvade före utflyttning antas omfattas av tioårsregeln. Bekräftade skatteavtalsbegränsningar kan ändra svensk skatt.'] : [],
        appliesTo: (model, data) => context.sourceResidenceChanges(model)
          .some(row => (!row.owner || row.owner === 'joint' || row.owner === data.owner) && row.settings.country !== 'SE'),
      },
      sourceModule: { ...source, provider, dependencies: [{ ...source, provider: `${provider}.policy` }] },
      usageModel: 'identity',
    })],
  };
}
