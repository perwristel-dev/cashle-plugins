export default function (context) {
  const { translations } = context;
  const taxText = (key, parameters = {}) => {
    const catalogue = translations[context.language] ?? translations[context.language?.split('-')[0]];
    return (catalogue?.[key] ?? translations.sv?.[key] ?? key)
      .replace(/\{([\w]+)\}/g, (match, name) => parameters[name] ?? match);
  };

  const number = (key, label, extra = {}) => ({ key, label, kind: 'number', ...extra });
  const choice = (key, label, options, extra = {}) => ({ key, label, kind: 'select', options, ...extra });
  const nativeOptions = options => Object.fromEntries(Object.entries(options).filter(([, v]) => v !== '' && v !== null && v !== undefined && !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)));
  const noticeFields = [
    { key: 'noticeDatesByYear', label: 'Skattebeskedens faktiska datum per inkomstår (JSON)', kind: 'json', help: 'Exempel: {"2026":["2027-09-15"]}. Vid flera delbetalningar anges belopp i samma ordning nedan.' },
    { key: 'noticeAmountsByYear', label: 'Skattebeskedens nominella belopp per inkomstår (JSON)', kind: 'json', money: true, help: 'Exempel: {"2026":[1000,2000]}. Måste summera till årets kvarvarande skatt.' },
    { key: 'settlementCalendar', label: 'Bekräftat återkommande betalningsantagande (JSON)', kind: 'json', help: 'Endast ett eget prognosantagande. Exempel: {"month":9,"day":30,"yearOffset":1,"confirmed":true}. Faktiska besked per år gäller i första hand.' },
  ];
  const profileFields = [choice('ruleYear', 'Regelår', [['2026', '2026']], { numeric: true }), choice('residency', 'Skatterättslig hemvist', [['', 'Välj'], ['full-year', 'Hela året']]), { key: 'settlementDate', label: 'Årets faktiska betalningsdatum enligt skattebesked', kind: 'date', help: 'Betalningsdatum beror på beskedet. Någon allmän betalning i maj antas inte.' }];
  profileFields.push(...noticeFields);
  const commonValidation = (o, profile, first, last) => {
    const errors = [];
    if (o.ruleYear !== 2026 || o.residency !== 'full-year') errors.push(taxText('Välj regler 2026 och bekräfta hemvist hela året.'));
    if ((profile?.people ?? []).some(p => Number.isInteger(p.birthYear) && (p.birthYear < first || p.birthYear > last))) errors.push(taxText('Den stödda profilen kräver födelseår {first}–{last} vid regelåret.', { first, last }));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(o.settlementDate ?? '') && !(o.noticeDatesByYear && typeof o.noticeDatesByYear === 'object' && !Array.isArray(o.noticeDatesByYear) && Object.keys(o.noticeDatesByYear).length) && o.settlementCalendar?.confirmed !== true) errors.push(taxText('Ange ett faktiskt eller uttryckligt prognostiserat betalningsdatum enligt skattebesked.'));
    return errors;
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

  const propertyTax = { fields: [...common,
      { key: 'propertyUse', label: 'Nederländsk skatteklassificering', kind: 'select', default: '', options: [['', 'Välj'], ['main-home', 'Egen permanentbostad (Box 1)'], ['second-home', 'Andrabostad (Box 3)'], ['rental-home', 'Uthyrningsbostad (Box 3)']] },
      check('box3PropertyReported', 'Januari 1-värde och tillhörande skuld är inkluderade i ägarens externa Box 3-underlag', { when: data => ['second-home', 'rental-home'].includes(data.propertyUse), mustBeTrue: true }),
    ], help: 'Nederländerna 2026: försäljningsvinsten beskattas inte som kapitalinkomst. Permanentbostaden omfattas av Box 1-regler; egenwoningforfait, ränteavdrag och bijleenregeling ingår inte här. Andra bostäder och uthyrningsbostäder hör till årets Box 3-underlag den 1 januari. Ange dessa värden och skulder i ägarens externa förmögenhetsunderlag.' };

  const dutchTax = {
    translate: taxText,
    translations,
    requiresTaxPlan: true,
    sourceTax: { language: 'groovy-cashle-plugin', provider: 'cashle.tax.nl', source: 'dutch-tax.cashle' },
    id: 'NL', label: 'Nederländerna', currency: 'EUR', ruleYear: 2026, supportedBases: ['salary', 'capitalIncome', 'box3InvestmentsJan1'], propertyTax: propertyTax,
    description: 'Nederländsk skattepliktig anställningsinkomst (fiscaal loon) under AOW-ålder, med allmän skattereduktion och arbetsreduktion. Box 3: förmögenhet den 1 januari, 59 357 EUR skattefritt per person, 36 % skatt och 6 % schablonavkastning på investeringar. Spar-/skuldräntor 1,28/2,70 % är preliminära 2026-antaganden, slutliga värden beslutas 2027. Verklig avkastning (tegenbewijs), partneromfördelning, Box 2 och gröna investeringsundantag stöds inte. Vanlig sparränta får vara kassaflöde som kapitalinkomst, men ger ingen extra inkomstskatt: kontots värde måste ingå i externa Box 3-bankmedel.',
    source: 'https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/berekening-box-3-inkomen-2026',
    defaultOptions: { ruleYear: 2026, residency: '', wealthFactsConfirmed: false, box3Mode: 'provisional-deemed', box3SavingsRate: .0128, box3DebtRate: .027, externalSavingsJan1: 0, externalInvestmentsJan1: 0, externalDebtsJan1: 0, settlementDate: '', noticeDatesByYear: {}, noticeAmountsByYear: {}, settlementCalendar: {} },
    fields: [...profileFields,
      choice('box3Mode', 'Box 3-metod', [['provisional-deemed', 'Preliminär schablonberäkning 2026']]),
      number('externalSavingsJan1', 'Externa bankmedel 1 januari per person (EUR)', { money: true, min: 0, help: 'Inkludera även vanliga bank-/sparkontomoduler och övriga bankmedel utanför investeringsmodulerna. Dessa hämtas inte automatiskt; beloppet ska tas med exakt en gång.' }),
      number('externalInvestmentsJan1', 'Externa investeringar/övriga tillgångar 1 januari per person (EUR)', { money: true, min: 0, help: 'Inkludera Box 3-värdet av andra-/uthyrningsbostäder och övrig förmögenhet. Ta inte med konton som redan modelleras som beleggingsrekening.' }),
      number('externalDebtsJan1', 'Externa Box 3-skulder 1 januari per person före gränsen (EUR)', { money: true, min: 0, help: 'Motorn drar av skuldgränsen 3 800 EUR en gång per person.' }),
      number('box3SavingsRate', 'Antagen schablonavkastning på bankmedel', { percent: true }), number('box3DebtRate', 'Antagen schablonavkastning på skulder', { percent: true }),
      { key: 'wealthFactsConfirmed', kind: 'check', label: 'Jag har angivit fullständiga individuella externa Box 3-värden/skulder och använder ingen partneromfördelning' },
    ],
    validate(o, p) { const errors = commonValidation(o, p, 1960, 2007); if (!o.wealthFactsConfirmed) errors.push(taxText('Bekräfta fullständiga externa Box 3-underlag för varje person.')); if (o.box3Mode !== 'provisional-deemed') errors.push(taxText('Välj preliminär schablonmetod.')); for (const key of ['externalSavingsJan1', 'externalInvestmentsJan1', 'externalDebtsJan1']) if (!Number.isFinite(o[key]) || o[key] < 0) errors.push(taxText('Ange alla externa förmögenhetsvärden, även 0.')); for (const key of ['box3SavingsRate', 'box3DebtRate']) if (!Number.isFinite(o[key]) || o[key] < 0 || o[key] > 1) errors.push(taxText('Ange uttryckliga avkastningsantaganden mellan 0 och 100 %.')); return errors; },
    assessmentOptions: nativeOptions,
  };

  return { taxes: [dutchTax] };
}
