import municipalities from './municipalities-2026.js';

const municipalityCodes = new Set(municipalities.map(([code]) => code));
const householdChildren = profile => {
  if (profile?.mode === 'couple') return [];
  return profile?.mode === 'household' && Array.isArray(profile.household?.children)
    ? profile.household.children : null;
};

export default function (context) {
  const { translations } = context;
  const taxText = (key, parameters = {}) => {
    const catalogue = translations[context.language] ?? translations[context.language?.split('-')[0]];
    return (catalogue?.[key] ?? translations.sv?.[key] ?? key)
      .replace(/\{([\w]+)\}/g, (match, name) => parameters[name] ?? match);
  };
  const profileChoice = (key, label, options, extra = {}) => ({ key, label, kind: 'select', options, ...extra });
  const profileNumber = (key, label, extra = {}) => ({ key, label, kind: 'number', ...extra });
  const nordicDefaults = { ruleYear: 2026, residency: 'full-year', territory: 'mainland' };
  const nativeOptions = options => Object.fromEntries(Object.entries(options).filter(([, value]) => value !== null && value !== undefined && value !== ''));

  const hasSale = (_data, context) => context?.propertySale !== false;
  const number = (key, label, value = 0, extra = {}) => ({ key, label, kind: 'number', default: value, min: 0, ...extra });
  const choice = (key, label, options, value, extra = {}) => ({ key, label, kind: 'select', options, default: value, ...extra });
  const check = (key, label, extra = {}) => ({ key, label, kind: 'check', default: false, ...extra });
  const date = (key, label, extra = {}) => ({ key, label, kind: 'date', default: '', ...extra });
  const noticeFields = (datesKey, label, amountsKey, amountsLabel, when) => [
    { key: datesKey, label, kind: 'dates', default: [], required: false, when, wide: true, help: 'Ange faktiska eller planerade förfallodatum när årsavstämningen kräver betalning eller återbetalning. Vid noll saldo behövs inget datum. Ett datum per rad (ÅÅÅÅ-MM-DD), i stigande ordning utan dubbletter.' },
    { key: amountsKey, label: amountsLabel, kind: 'numbers', money: true, default: [], datesKey, when, wide: true, help: 'Ange ett nominellt belopp i landets valuta per rad, i samma ordning som datumen. Negativa belopp avser återbetalning. Vid flera datum krävs belopp för varje datum.' },
  ];
  const common = propertyTypes => [
    choice('propertyType', 'Bostadstyp enligt skattereglerna', propertyTypes, propertyTypes[0][0]),
    number('ownershipShare', 'Laglig ägarandel (för beloppsgränser)' , 1, { min: 0, exclusiveMin: true, max: 1, help: 'Belopp avser postens ägare; gemensamma belopp delas lika mellan de vuxna. Ägarandelen används för lagens beloppsgränser.' }),
    date('contractDate', 'Bindande köpekontrakt undertecknat', { when: hasSale, help: 'Lämna tomt för samma datum som Försäljning → Sälj vid. Likviddagen och kontraktsdagen kan vara olika.' }),
    ...noticeFields('paymentDueDates', 'Betalningsdatum enligt slutskattebesked', 'paymentAmounts', 'Betalningsbelopp enligt slutskattebesked', hasSale),
  ];
  const residential = [['detachedHome', 'Småhus / permanentbostad'], ['residentialHome', 'Annan bostad som omfattas av reglerna']];
  const acquired = () => date('acquiredDate', 'Ursprungligt förvärvsdatum', { required: true, when: hasSale, help: 'Det faktiska historiska datumet behövs för landets ägar- och boendetidsregler.' });
  const fiFields = [
    ...common(residential), acquired(), check('permanentFamilyHome', 'Bostaden har varit min eller familjens stadigvarande bostad'),
    number('continuousResidenceMonths', 'Sammanhängande månader som stadigvarande bostad', null, { integer: true }),
    number('plotAreaM2', 'Tomtarea', null, { unit: 'm²' }),
    check('zonedPlotWithinLimit', 'Hela tomten omfattas av den tillåtna planlagda bostadstomten', { when: data => data.plotAreaM2 > 10000, mustBeTrue: true }),
  ];
  const finnishTax = {
    validateSources(sources) {
      const bases = new Set(sources.map(source => source.basis));
      return bases.has('benefits') && (bases.has('salary') || bases.has('pension')) ? [taxText('Finlands skattemodell kan inte kombinera förmåner med lön eller pension.')] : [];
    },
    propertyTax: { fields: fiFields, help: 'Finland: undantaget kräver verifierad sammanhängande användning som stadigvarande bostad. Skattemotorn prövar också faktisk respektive schablonmässig anskaffningsutgift.' },
    translate: taxText,
    translations,
    sourceTax: { language: 'groovy-cashle-plugin', provider: 'cashle.tax.fi', source: 'finnish-tax.cashle' },
    id: 'FI', supportedBases: ['salary', 'pension', 'capitalIncome', 'benefits'], label: 'Finland', currency: 'EUR', ruleYear: 2026,
    description: 'Finska regler 2026 för fastlandet. Lön och pension kan ingå samma år. Vid en åldersgräns räknas årets lön som intjänad före gränsen.',
    defaultOptions: { ...nordicDefaults, municipality: '', churchMembership: 'none', children: 0, singleParent: false },
    fields: [
      profileChoice('municipality', 'Kommun', [['', 'Välj kommun'], ...municipalities]),
      profileChoice('churchMembership', 'Kyrkotillhörighet', [['none', 'Ingen kyrkoskatt'],
        ['lutheran', 'Evangelisk-luthersk'], ['orthodox', 'Ortodox']]),
      profileNumber('children', 'Antal kvalificerande barn', { integer: true, when: (_, profile) => householdChildren(profile) === null }),
      { key: 'singleParent', kind: 'check', label: 'Ensamförälder enligt skattereglerna' },
    ],
    validate(options, profile, { householdProfile = profile, personScoped = false } = {}) {
      const errors = [];
      const legacy = !options.municipality && Number.isFinite(options.municipalRate) &&
        options.municipalRate >= 0 && options.municipalRate <= .3 &&
        Number.isFinite(options.churchRate ?? 0) && (options.churchRate ?? 0) >= 0 && (options.churchRate ?? 0) <= .1;
      if (!municipalityCodes.has(options.municipality) && !legacy) errors.push(taxText('Välj kommun.'));
      if ((personScoped || householdChildren(householdProfile) === null) && (!Number.isInteger(options.children) || options.children < 0 || options.children > 30)) errors.push(taxText('Ange 0–30 kvalificerande barn.'));
      if (typeof options.singleParent !== 'boolean') errors.push(taxText('Ange ensamförälderstatus.'));
      return errors;
    },
    assessmentOptions({ productionExpenses, ...options }, profile, { personScoped = false } = {}) {
      const data = { ...nativeOptions(options), ...nordicDefaults };
      const children = personScoped ? null : householdChildren(profile);
      if (children !== null) data.householdChildBirthYears = children.map(child => child.birthYear).filter(Number.isInteger);
      return data;
    },
  };
  return { taxes: [finnishTax] };
}
