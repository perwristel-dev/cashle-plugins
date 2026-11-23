export default function (context) {
  const { translations } = context;
  const taxText = (key, parameters = {}) => {
    const catalogue = translations[context.language] ?? translations[context.language?.split('-')[0]];
    return (catalogue?.[key] ?? translations.sv?.[key] ?? key)
      .replace(/\{([\w]+)\}/g, (match, name) => parameters[name] ?? match);
  };
  const profileChoice = (key, label, options, extra = {}) => ({ key, label, kind: 'select', options, ...extra });
  const taxRate = (key, label, max, help) => ({ key, label, kind: 'number', percent: true, max, help });
  const confirm = (key, label) => profileChoice(key, label, [['', 'Välj'], ['false', 'Bekräftat']], { boolean: true });
  const profileFields = [
    profileChoice('ruleYear', 'Regelår', [['2026', '2026']], { numeric: true }),
    profileChoice('residency', 'Skattskyldig hela året', [['', 'Välj'], ['full-year', 'Ja, hela året']],
      { help: 'Endast full skatterättslig hemvist hela året stöds.' }),
    taxRate('municipalRate', 'Kommunalskatt', 0.4, 'Ange den faktiska lokala skattesatsen för regelåret.'),
    taxRate('churchRate', 'Kyrkoskatt', 0.1, 'Ange 0 om kyrkoskatt inte gäller.'),
    profileChoice('civilStatus', 'Civilstånd enligt skattereglerna', [['', 'Välj'], ['single', 'Ensamstående']]),
    confirm('seniorSupplement', 'Inget seniortillägg'),
    confirm('singleParentSupplement', 'Inget ensamföräldratillägg'),
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
    description: 'Danska regler 2026 stöder endast ensamstående utan senior- eller ensamföräldrartillägg. Löneinkomst stöds för födda 1966 eller senare. Ange faktisk AM-skattepliktig lön i inkomstposten.',
    defaultOptions: { ruleYear: 2026, residency: '', municipalRate: null, churchRate: 0, civilStatus: '', seniorSupplement: null, singleParentSupplement: null },
    fields: profileFields,
    validate(options) {
      const errors = [];
      if (options.ruleYear !== 2026) errors.push(taxText('Välj den stödda regelutgåvan {year}.', { year: 2026 }));
      if (options.residency !== 'full-year') errors.push(taxText('Bekräfta skatterättslig hemvist hela året.'));
      for (const [key, label, max] of [['municipalRate', 'Kommunalskatt', 40], ['churchRate', 'Kyrkoskatt', 10]]) {
        if (!Number.isFinite(options[key]) || options[key] < 0 || options[key] > max / 100) {
          errors.push(taxText('{label}: ange ett värde mellan 0 och {max} %.', { label: taxText(label), max }));
        }
      }
      if (options.civilStatus !== 'single' || options.seniorSupplement !== false || options.singleParentSupplement !== false) errors.push(taxText('Bekräfta ensamstående utan senior- och ensamföräldrartillägg.'));
      return errors;
    }, assessmentOptions: nativeOptions,
  };

  return { taxes: [danishTax] };
}
