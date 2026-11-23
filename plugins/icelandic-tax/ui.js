export default function (context) {
  const { translations } = context;
  const taxText = (key, parameters = {}) => {
    const catalogue = translations[context.language] ?? translations[context.language?.split('-')[0]];
    return (catalogue?.[key] ?? translations.sv?.[key] ?? key)
      .replace(/\{([\w]+)\}/g, (match, name) => parameters[name] ?? match);
  };
  const profileChoice = (key, label, options, extra = {}) => ({ key, label, kind: 'select', options, ...extra });
  const profileNumber = (key, label, extra = {}) => ({ key, label, kind: 'number', ...extra });
  const nordicDefaults = { ruleYear: 2026, residency: '' };
  const nordicFields = [
    profileChoice('ruleYear', 'Regelår', [['2026', '2026']], { numeric: true }),
    profileChoice('residency', 'Skattskyldig hela året', [['', 'Välj'], ['full-year', 'Ja, hela året']],
      { help: 'Endast full skatterättslig hemvist hela året stöds.' }),
  ];
  const nativeOptions = options => Object.fromEntries(Object.entries(options).filter(([, value]) => value !== null && value !== undefined && value !== ''));

  const hasSale = (_data, context) => context?.propertySale !== false;
  const number = (key, label, value = 0, extra = {}) => ({ key, label, kind: 'number', default: value, min: 0, ...extra });
  const choice = (key, label, options, value, extra = {}) => ({ key, label, kind: 'select', options, default: value, ...extra });
  const check = (key, label, extra = {}) => ({ key, label, kind: 'check', default: false, ...extra });
  const date = (key, label, extra = {}) => ({ key, label, kind: 'date', default: '', ...extra });
  const property = (key, label, extra = {}) => ({ key, label, kind: 'property-reference', default: '', ...extra });
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
  const replacementCountryCodes = ['IS', 'NO', 'LI', 'CH', 'FO', 'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
  const regionNames = new Intl.DisplayNames(['sv'], { type: 'region' });
  const isFields = [
    ...common(residential), acquired(),
    number('previousDeferral', 'Tidigare överfört avdrag i bostadens anskaffningsunderlag', 0, { money: true, help: 'Ange det kvarvarande nominella avdrag som redan har överförts till denna bostads anskaffningsunderlag. Detta är inte ett svenskt uppskov och har ingen svensk frivillig återföring.' }),
    check('ownUse', 'Bostaden har använts som min egen bostad', { when: hasSale }),
    number('totalResidentialVolumeM3', 'Sammanlagd bostadsvolym som omfattas av innehavet', null, { unit: 'm³', when: (data, context) => hasSale(data, context) && !data.ownUse }),
    check('jointTaxation', 'Volymgränsen bedöms för sambeskattade makar', { when: (data, context) => hasSale(data, context) && !data.ownUse }),
    check('requestDeferral', 'Begär uppskov för en kvalificerad ersättningsbostad', { when: hasSale }),
    property('replacementHomeId', 'Ersättningsbostad i planen', { when: data => data.requestDeferral }),
    choice('replacementCountry', 'Ersättningsbostadens land', [['', 'Från vald ersättningsbostad'], ...replacementCountryCodes.map(code => [code, regionNames.of(code)])], '', { when: data => data.requestDeferral, help: 'Lämna förvalet för att använda landuppgiften från den länkade bostaden. Välj ett uttryckligt land om den uppgiften behöver preciseras.' }),
    ...noticeFields('reconciliationPaymentDueDates', 'Betalningsdatum efter prövning av ersättningsbostad', 'reconciliationPaymentAmounts', 'Belopp efter prövning av ersättningsbostad', data => data.requestDeferral),
    date('replacementAcquiredDate', 'Ersättningsbostadens förvärvsdatum', { when: data => data.requestDeferral }),
    date('replacementConstructionDate', 'Ersättningsbostadens byggdatum', { when: data => data.requestDeferral }),
  ];
  const icelandicTax = {
    propertyTax: { fields: isFields, help: 'Island: ägartid, egen användning och i tillämpliga fall volymgränser prövas. Ett uppskov minskar ersättningsbostadens anskaffningsunderlag enligt landets regler.' },
    translate: taxText,
    translations,
    sourceTax: { language: 'groovy-cashle-plugin', provider: 'cashle.tax.is', source: 'icelandic-tax.cashle' },
    id: 'IS', supportedBases: ['salary', 'pension', 'capitalIncome', 'otherCapitalIncome'], label: 'Island', currency: 'ISK', ruleYear: 2026,
    description: 'Isländska årsregler 2026. Ange faktisk kommunalskatt och faktiska avdragsgilla pensionsinbetalningar. Varje pensionsklass får uppgå till högst 4 % av årslönen. Inga pensionsbetalningar antas automatiskt.',
    defaultOptions: { ...nordicDefaults, period: 'annual', municipalRate: null, pensionContribution: 0, additionalPensionContribution: 0 },
    fields: [...nordicFields, profileChoice('period', 'Bedömningsperiod', [['annual', 'Årsbedömning']]), profileNumber('municipalRate', 'Faktisk kommunalskatt', { percent: true }), profileNumber('pensionContribution', 'Årets avdragsgilla pensionsinbetalningar', { money: true }), profileNumber('additionalPensionContribution', 'Årets ytterligare avdragsgilla pensionsinbetalningar', { money: true })],
    validate(options, profile) {
      const errors = [];
      if (options.ruleYear !== 2026) errors.push(taxText('Välj den stödda regelutgåvan {year}.', { year: 2026 }));
      if (options.residency !== 'full-year') errors.push(taxText('Bekräfta skatterättslig hemvist hela året.'));
      if (options.period !== 'annual') errors.push(taxText('Välj årsbedömning för den årliga skatteavstämningen.'));
      if (!Number.isFinite(options.municipalRate) || options.municipalRate < 0 || options.municipalRate > .3) {
        errors.push(taxText('{label}: ange ett värde mellan 0 och {max} %.', { label: taxText('Kommunalskatt'), max: 30 }));
      }
      for (const key of ['pensionContribution', 'additionalPensionContribution']) if (!Number.isFinite(options[key]) || options[key] < 0) errors.push(taxText('Ange faktiska, icke-negativa pensionsinbetalningar.'));
      return errors;
    }, assessmentOptions: nativeOptions,
  };
  return { taxes: [icelandicTax] };
}
