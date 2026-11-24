export default function (context) {
  const { translations } = context;
  const taxText = (key, parameters = {}) => {
    const catalogue = translations[context.language] ?? translations[context.language?.split('-')[0]];
    return (catalogue?.[key] ?? translations.sv?.[key] ?? key)
      .replace(/\{([\w]+)\}/g, (match, name) => parameters[name] ?? match);
  };
  const choice = (key, label, options, extra = {}) => ({ key, label, kind: 'select', options, ...extra });
  const regionOptions = [['', 'Välj region'], ['ordinary', 'Ordinarie region'],
    ['intervention-zone', 'Verifierad hemvist i Finnmark/Nord-Troms']];
  const profileDefaults = { ruleYear: 2026, residency: 'full-year' };
  const profileFields = [choice('region', 'Skatteregion', regionOptions)];
  const nativeOptions = options => ({ ...profileDefaults, region: options.region });

  const hasSale = (_data, context) => context?.propertySale !== false;
  const number = (key, label, value = 0, extra = {}) => ({ key, label, kind: 'number', default: value, min: 0, ...extra });
  const check = (key, label, extra = {}) => ({ key, label, kind: 'check', default: false, ...extra });
  const date = (key, label, extra = {}) => ({ key, label, kind: 'date', default: '', ...extra });
  const noticeFields = (datesKey, label, amountsKey, amountsLabel, when) => [
    { key: datesKey, label, kind: 'dates', default: [], required: false, when, wide: true, help: 'Ange faktiska eller planerade förfallodatum när årsavstämningen kräver betalning eller återbetalning. Vid noll saldo behövs inget datum. Ett datum per rad (ÅÅÅÅ-MM-DD), i stigande ordning utan dubbletter.' },
    { key: amountsKey, label: amountsLabel, allowEqualInstallments: 2, kind: 'numbers', money: true, default: [], datesKey, when, wide: true, help: 'Ange ett nominellt belopp i landets valuta per rad, i samma ordning som datumen. Negativa belopp avser återbetalning. Vid flera datum krävs belopp för varje datum, utom Norges två lika lagstadgade delbetalningar.' },
  ];
  const residential = [['detachedHome', 'Småhus / permanentbostad'],
    ['residentialHome', 'Annan bostad som omfattas av reglerna']];
  const propertyFields = [
    choice('propertyType', 'Bostadstyp enligt skattereglerna', residential, { default: 'detachedHome' }),
    number('ownershipShare', 'Laglig ägarandel (för beloppsgränser)' , 1, { min: 0, exclusiveMin: true, max: 1, help: 'Belopp avser postens ägare; gemensamma belopp delas lika mellan de vuxna. Ägarandelen används för lagens beloppsgränser.' }),
    date('contractDate', 'Bindande köpekontrakt undertecknat', { when: hasSale, help: 'Lämna tomt för samma datum som Försäljning → Sälj vid. Likviddagen och kontraktsdagen kan vara olika.' }),
    ...noticeFields('paymentDueDates', 'Betalningsdatum enligt slutskattebesked', 'paymentAmounts', 'Betalningsbelopp enligt slutskattebesked', hasSale),
    date('acquiredDate', 'Ursprungligt förvärvsdatum', { required: true, when: hasSale,
      help: 'Det faktiska historiska datumet behövs för landets ägar- och boendetidsregler.' }),
    date('takeoverDate', 'Övertagandedatum / tillträde', { required: true }),
    check('fullOwnUse', 'Hela den sålda bostaden har varit min egen bostad', { mustBeTrue: true, help: 'Delvis uthyrda eller blandat använda bostäder behöver en separat verifierad fördelning.' }),
    number('ownResidenceMonthsLast24', 'Månader som egen bostad under de senaste 24 månaderna', null, { integer: true, max: 24 }),
  ];

  const norwegianTax = {
    propertyTax: { fields: propertyFields, help: 'Norge: bindande kontrakt styr prövningen av ägar- och boendetid. Övertagandet styr normalt beskattningsåret. Endast helt egenanvänd bostad stöds.'},
    translate: taxText,
    translations,
    sourceTax: { language: 'groovy-cashle-plugin', provider: 'cashle.tax.no', source: 'norwegian-tax.cashle' },
    id: 'NO', supportedBases: ['salary', 'pension', 'capitalIncome', 'interestExpenses'], label: 'Norge', currency: 'NOK', ruleYear: 2026,
    description: 'Norska regler 2026 för lön och pension. Särskilt skatteavdrag för pension och förmögenhetsskatt ingår inte.',
    defaultOptions: { ...profileDefaults, region: '' },
    fields: profileFields,
    validate(options) {
      const errors = [];
      if (!['ordinary', 'intervention-zone'].includes(options.region)) errors.push(taxText('Välj norsk skatteregion.'));
      return errors;
    }, assessmentOptions: nativeOptions,
  };

  return { taxes: [norwegianTax] };
}
