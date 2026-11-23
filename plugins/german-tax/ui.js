export default function (context) {
  const { translations } = context;
  const taxText = (key, parameters = {}) => {
    const catalogue = translations[context.language] ?? translations[context.language?.split('-')[0]];
    return (catalogue?.[key] ?? translations.sv?.[key] ?? key)
      .replace(/\{([\w]+)\}/g, (match, name) => parameters[name] ?? match);
  };
  const check = (key, label, extra = {}) => ({ key, label, kind: 'check', default: false, ...extra });
  const date = (key, label, extra = {}) => ({ key, label, kind: 'date', default: '', ...extra });
  const common = [
    { key: 'propertyType', label: 'Bostadstyp', kind: 'select', options: [['detachedHome', 'Småhus'], ['residentialHome', 'Annan privatbostad']], default: 'detachedHome' },
    { key: 'ownershipShare', label: 'Laglig ägarandel', kind: 'number', min: 0, exclusiveMin: true, max: 1, default: 1 },
    date('acquiredDate', 'Historiskt bindande förvärvsdatum', { required: true }),
    date('contractDate', 'Bindande försäljningskontrakt', { help: 'Tomt använder tillgångens försäljningsdatum.' }),
    { key: 'paymentDueDates', label: 'Faktiska betalningsdatum enligt skattebesked', kind: 'dates', default: [], required: false },
    { key: 'paymentAmounts', label: 'Belopp per betalningsdatum', kind: 'numbers', money: true, default: [], datesKey: 'paymentDueDates', required: false },
  ];
  const germanPropertyTax = { fields: [...common,
      check('ownUseThroughout', 'Uteslutande egen bostad under hela innehavet'),
      check('ownUseThreeCalendarYears', 'Sammanhängande egen användning i försäljningsåret och de två föregående kalenderåren', { help: 'Det mellanliggande kalenderåret måste omfattas helt. Bekräfta de faktiska villkoren; tre hela år krävs inte.' }),
      date('ownUseFrom', 'Sammanhängande egen användning från', { required: false }),
      date('ownUseUntil', 'Sammanhängande egen användning till och med', { required: false }),
    ], help: 'Tyskland 2026: privatbostad undantas vid kvalificerad egen användning eller försäljning efter mer än tio år. Exakt tio år är inom skatteperioden. Övrig vinst hör till vanlig progressiv inkomstskatt enligt §23, med gemensam årlig gräns 1 000 EUR. Faktisk likviddag styr inkomståret. Deprecierad uthyrningsfastighet, gåva, arv och blandad användning stöds inte.' };

  const number = (key, label, extra = {}) => ({ key, label, kind: 'number', ...extra });
  const choice = (key, label, options, extra = {}) => ({ key, label, kind: 'select', options, ...extra });
  const nativeOptions = options => Object.fromEntries(Object.entries(options).filter(([, v]) => v !== '' && v !== null && v !== undefined && !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)));
  const noticeFields = [
    { key: 'noticeDatesByYear', label: 'Skattebeskedens faktiska datum per inkomstår (JSON)', kind: 'json', help: 'Exempel: {"2026":["2027-09-15"]}. Vid flera delbetalningar anges belopp i samma ordning nedan.' },
    { key: 'noticeAmountsByYear', label: 'Skattebeskedens nominella belopp per inkomstår (JSON)', kind: 'json', money: true, help: 'Exempel: {"2026":[1000,2000]}. Måste summera till årets kvarvarande skatt.' },
    { key: 'settlementCalendar', label: 'Bekräftat återkommande betalningsantagande (JSON)', kind: 'json', help: 'Endast ett eget prognosantagande. Exempel: {"month":9,"day":30,"yearOffset":1,"confirmed":true}. Faktiska besked per år gäller i första hand.' },
  ];
  const commonFields = [choice('ruleYear', 'Regelår', [['2026', '2026']], { numeric: true }), choice('residency', 'Skatterättslig hemvist', [['', 'Välj'], ['full-year', 'Hela året']]), { key: 'settlementDate', label: 'Årets faktiska betalningsdatum enligt skattebesked', kind: 'date', help: 'Betalningsdatum beror på beskedet. Någon allmän betalning i maj antas inte.' }];
  commonFields.push(...noticeFields);
  const commonValidation = (o, profile, first, last) => {
    const errors = [];
    if (o.ruleYear !== 2026 || o.residency !== 'full-year') errors.push(taxText('Välj regler 2026 och bekräfta hemvist hela året.'));
    if ((profile?.people ?? []).some(p => Number.isInteger(p.birthYear) && (p.birthYear < first || p.birthYear > last))) errors.push(taxText('Den stödda profilen kräver födelseår {first}–{last} vid regelåret.', { first, last }));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(o.settlementDate ?? '') && !(o.noticeDatesByYear && typeof o.noticeDatesByYear === 'object' && !Array.isArray(o.noticeDatesByYear) && Object.keys(o.noticeDatesByYear).length) && o.settlementCalendar?.confirmed !== true) errors.push(taxText('Ange ett faktiskt eller uttryckligt prognostiserat betalningsdatum enligt skattebesked.'));
    return errors;
  };
  const germanTax = {
    translate: taxText,
    translations,
    requiresTaxPlan: true,
    sourceTax: { language: 'groovy-cashle-plugin', provider: 'cashle.tax.de', source: 'german-tax.cashle' },
    id: 'DE', label: 'Tyskland', currency: 'EUR', ruleYear: 2026, supportedBases: ['salary', 'capitalIncome', 'shareIncome', 'privatePropertyIncome'], propertyTax: germanPropertyTax,
    description: 'Individuell tysk bedömning 2026, utan barnskatteförmåner, ålder 24–64, vanlig anställning med lagstadgad försäkring. Årslön måste vara 0 eller över 24 000 EUR. Kyrkoskatt 8 % gäller Bayern/Baden-Württemberg, 9 % övriga delstater. Günstigerprüfung, sambeskattning, pension, fonder och deras Vorabpauschale stöds inte.',
    source: 'https://www.gesetze-im-internet.de/estg/__32a.html',
    defaultOptions: { ruleYear: 2026, residency: '', profile: '', churchRate: 0, healthAdditionalRate: .029, saxony: false, employmentExpenses: 0, churchTaxPaid: 0, initialState: { shareLossCarry: 0, otherCapitalLossCarry: 0, privatePropertyLossCarry: 0 }, settlementDate: '', noticeDatesByYear: {}, noticeAmountsByYear: {}, settlementCalendar: {} },
    fields: [...commonFields,
      choice('profile', 'Bekräftad tysk skatteprofil', [['', 'Välj'], ['single-childless-statutory', 'Individuell, barnlös, vanlig lagstadgad anställningsförsäkring']]),
      choice('churchRate', 'Kyrkoskatt som andel av inkomstskatten', [['0', 'Ingen'], ['0.08', '8 % (Bayern/Baden-Württemberg)'], ['0.09', '9 % (övriga delstater)']], { numeric: true }),
      number('healthAdditionalRate', 'Faktisk Zusatzbeitrag till sjukförsäkring', { percent: true, help: '2,9 % är det publicerade genomsnittet 2026. Ange den faktiska försäkringskassans tillägg.' }),
      { key: 'saxony', kind: 'check', label: 'Bosatt i Sachsen (annan arbetstagarandel av vårdförsäkringen)' },
      number('employmentExpenses', 'Faktiska avdragsgilla arbetskostnader per år (EUR)', { money: true, min: 0 }),
      number('churchTaxPaid', 'Faktiskt betald avdragsgill kyrkoskatt under året (EUR)', { money: true, min: 0 }),
      { key: 'initialState', label: 'Ingående förlustsaldon per person (JSON, nominella EUR)', kind: 'json', money: true, help: 'Separata saldon: shareLossCarry för aktieförsäljning, otherCapitalLossCarry för övrigt kapital, privatePropertyLossCarry för §23. Exempel: {"shareLossCarry":1000,"otherCapitalLossCarry":0,"privatePropertyLossCarry":0}.' },
    ],
    validate(o, p) { const errors = commonValidation(o, p, 1962, 2002); if (o.profile !== 'single-childless-statutory') errors.push(taxText('Bekräfta den stödda tyska individuella profilen.')); if (![0, .08, .09].includes(o.churchRate)) errors.push(taxText('Välj korrekt regional kyrkoskatt.')); if (!Number.isFinite(o.healthAdditionalRate) || o.healthAdditionalRate < 0 || o.healthAdditionalRate > .1) errors.push(taxText('Ange faktisk Zusatzbeitrag (0–10 %).')); if (typeof o.saxony !== 'boolean') errors.push(taxText('Bekräfta Sachsenstatus.')); for (const key of ['employmentExpenses', 'churchTaxPaid']) if (!Number.isFinite(o[key]) || o[key] < 0) errors.push(taxText('Ange icke-negativa avdrag.')); return errors; },
    assessmentOptions: nativeOptions,
  };

  return { taxes: [germanTax] };
}
