import municipalities from './municipalities-2026.js';

const municipalityCodes = new Set(municipalities.map(([code]) => code));
export default function (context) {
  const { translations } = context;
  const taxText = (key, parameters = {}) => {
    const catalogue = translations[context.language] ?? translations[context.language?.split('-')[0]];
    return (catalogue?.[key] ?? translations.sv?.[key] ?? key)
      .replace(/\{([\w]+)\}/g, (match, name) => parameters[name] ?? match);
  };
  const profileChoice = (key, label, options, extra = {}) => ({ key, label, kind: 'select', options, ...extra });
  // The published provider models an individual under the fixed 2026 rule set.
  const profileDefaults = { ruleYear: 2026, residency: 'full-year', civilStatus: 'single', singleParentSupplement: false };
  const profileFields = [
    profileChoice('municipality', 'Kommun', [['', 'Välj kommun'], ...municipalities]),
    { key: 'churchMember', label: 'Medlem i Danska folkkyrkan', kind: 'check', default: false },
  ];

  const nativeOptions = options => Object.fromEntries(Object.entries(options).filter(([, value]) => value !== null && value !== undefined && value !== ''));

  const hasSale = (_data, context) => context?.propertySale !== false;
  const number = (key, label, value = 0, extra = {}) => ({ key, label, kind: 'number', default: value, min: 0, ...extra });
  const check = (key, label, extra = {}) => ({ key, label, kind: 'check', default: false, ...extra });
  const date = (key, label, extra = {}) => ({ key, label, kind: 'date', default: '', ...extra });
  const noticeFields = (datesKey, label, amountsKey, amountsLabel, when) => [
    { key: datesKey, label, kind: 'dates', default: [], required: false, when, wide: true, help: 'Ange faktiska eller planerade förfallodatum när årsavstämningen kräver betalning eller återbetalning. Vid noll saldo behövs inget datum. Ett datum per rad (ÅÅÅÅ-MM-DD), i stigande ordning utan dubbletter.' },
    { key: amountsKey, label: amountsLabel, kind: 'numbers', money: true, default: [], datesKey, when, wide: true, help: 'Ange ett nominellt belopp i landets valuta per rad, i samma ordning som datumen. Negativa belopp avser återbetalning. Vid flera datum krävs belopp för varje datum.' },
  ];
  const residential = [['detachedHome', 'Småhus / permanentbostad'],
    ['residentialHome', 'Annan bostad som omfattas av reglerna']];
  const propertyFields = [
    profileChoice('propertyType', 'Bostadstyp enligt skattereglerna', residential, { default: 'detachedHome' }),
    number('ownershipShare', 'Laglig ägarandel (för beloppsgränser)', 1, { exclusiveMin: true, max: 1,
      help: 'Belopp avser postens ägare; gemensamma belopp delas lika mellan de vuxna. Ägarandelen används för lagens beloppsgränser.' }),
    date('contractDate', 'Bindande köpekontrakt undertecknat', { when: hasSale,
      help: 'Lämna tomt för samma datum som Försäljning → Sälj vid. Likviddagen och kontraktsdagen kan vara olika.' }),
    ...noticeFields('paymentDueDates', 'Betalningsdatum enligt slutskattebesked', 'paymentAmounts',
      'Betalningsbelopp enligt slutskattebesked', hasSale),
    date('acquiredDate', 'Ursprungligt förvärvsdatum', { required: true, when: hasSale,
      help: 'Det faktiska historiska datumet behövs för landets ägar- och boendetidsregler.' }),
    check('genuineResidence', 'Bostaden har faktiskt varit min eller hushållets bostad'),
    number('plotAreaM2', 'Tomtarea', null, { unit: 'm²' }),
    check('subdivisionProhibited', 'Tomten får enligt myndighetsbesked inte avstyckas', { when: data => data.plotAreaM2 >= 1400 }),
    check('valueReductionOver20Percent', 'Myndighet har bekräftat att avstyckning minskar återstående värde med mer än 20 %', { when: data => data.plotAreaM2 >= 1400 && !data.subdivisionProhibited }),
  ];

  const danishTax = {
    propertyTax: { fields: propertyFields, help: 'Danmark: faktisk användning som bostad och tomtens villkor avgör bostadsundantaget. Belopp från tillgångens anskaffningsunderlag används utan dubbla kostnadsposter.' },
    translate: taxText,
    translations,
    sourceTax: { language: 'groovy-cashle-plugin', provider: 'cashle.tax.dk', source: 'danish-tax.cashle' },
    id: 'DK', supportedBases: ['salary', 'pension', 'capitalIncome', 'interestExpenses', 'shareIncome'], label: 'Danmark', currency: 'DKK', ruleYear: 2026,
    description: 'Danska regler 2026 för ensamstående. Senioravdraget beräknas automatiskt på AM-bidragspliktig lön under de fem kalenderåren före folkepensionsåldern.',
    defaultOptions: { ...profileDefaults, municipality: '', churchMember: false },
    fields: profileFields,
    validate(options) {
      const errors = [];
      const legacy = !options.municipality && Number.isFinite(options.municipalRate) &&
        options.municipalRate >= 0 && options.municipalRate <= .4 &&
        Number.isFinite(options.churchRate ?? 0) && (options.churchRate ?? 0) >= 0 && (options.churchRate ?? 0) <= .1;
      if (!municipalityCodes.has(options.municipality) && !legacy) errors.push(taxText('Välj kommun.'));
      return errors;
    }, assessmentOptions: options => ({ ...nativeOptions(options), ...profileDefaults }),
  };

  return { taxes: [danishTax] };
}
