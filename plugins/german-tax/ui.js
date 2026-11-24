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
  const retiree = options => options.profile === 'single-retiree';
  const employee = options => !retiree(options);
  const nonnegative = value => Number.isFinite(value) && value >= 0;
  const germanTax = {
    translate: taxText,
    translations,
    requiresTaxPlan: true,
    sourceTax: { language: 'groovy-cashle-plugin', provider: 'cashle.tax.de', source: 'german-tax.cashle' },
    id: 'DE', label: 'Tyskland', currency: 'EUR', ruleYear: 2026, supportedBases: ['salary', 'capitalIncome', 'shareIncome', 'privatePropertyIncome', 'germanStatutoryPension', 'germanVblPension'], propertyTax: germanPropertyTax,
    description: 'Individuell tysk bedömning enligt 2026 års regler. Välj profil för vanlig anställning eller pension. Pensionsprofilen omfattar GRV, VBLklassik och kapitalinkomster.',
    source: 'https://www.gesetze-im-internet.de/estg/__32a.html',
    defaultOptions: { ruleYear: 2026, residency: '', profile: '', churchRate: 0, healthAdditionalRate: .029, saxony: false, employmentExpenses: 0, churchTaxPaid: 0, pensionInsurancePaid: null, statutoryPensionStartYear: null, statutoryPensionExemptAmount: null, vblTaxableShare: null, initialState: { shareLossCarry: 0, otherCapitalLossCarry: 0, privatePropertyLossCarry: 0 }, settlementDate: '', noticeDatesByYear: {}, noticeAmountsByYear: {}, settlementCalendar: {} },
    fields: [...commonFields,
      choice('profile', 'Bekräftad tysk skatteprofil', [['', 'Välj'], ['single-childless-statutory', 'Individuell, barnlös, vanlig lagstadgad anställningsförsäkring'], ['single-retiree', 'Individuell pensionär']]),
      choice('churchRate', 'Kyrkoskatt som andel av inkomstskatten', [['0', 'Ingen'], ['0.08', '8 % (Bayern/Baden-Württemberg)'], ['0.09', '9 % (övriga delstater)']], { numeric: true }),
      number('healthAdditionalRate', 'Faktisk Zusatzbeitrag till sjukförsäkring', { percent: true, when: employee, help: '2,9 % är det publicerade genomsnittet 2026. Ange den faktiska försäkringskassans tillägg.' }),
      { key: 'saxony', kind: 'check', when: employee, label: 'Bosatt i Sachsen (annan arbetstagarandel av vårdförsäkringen)' },
      number('employmentExpenses', 'Faktiska avdragsgilla arbetskostnader per år (EUR)', { money: true, min: 0, when: employee }),
      number('statutoryPensionStartYear', 'GRV-pensionens första kalenderår', { min: 1900, max: 9999, when: retiree }),
      number('statutoryPensionExemptAmount', 'Fast årligt skattefritt GRV-belopp (EUR)', { money: true, min: 0, when: retiree,
        help: 'Använd skattebeskedet eller ett prognosbelopp från året efter pensionsstart.' }),
      number('vblTaxableShare', 'Skattepliktig andel av VBLklassik', { percent: true, min: 0, max: 100, when: retiree,
        help: 'Använd den skattepliktiga andelen enligt VBL:s uppgifter. Ange 100 % om hela pensionen är skattepliktig.' }),
      number('pensionInsurancePaid', 'Avdragsgilla sjuk- och vårdförsäkringspremier som pensionär (EUR per år)', { money: true, min: 0, when: retiree,
        help: 'Ange betalda avdragsgilla premier eller noll. Registrera även själva premiebetalningen som en utgift.' }),
      number('churchTaxPaid', 'Faktiskt betald avdragsgill kyrkoskatt under året (EUR)', { money: true, min: 0 }),
      { key: 'initialState', label: 'Ingående förlustsaldon per person (JSON, nominella EUR)', kind: 'json', money: true, help: 'Separata saldon: shareLossCarry för aktieförsäljning, otherCapitalLossCarry för övrigt kapital, privatePropertyLossCarry för §23. Exempel: {"shareLossCarry":1000,"otherCapitalLossCarry":0,"privatePropertyLossCarry":0}.' },
    ],
    validate(o, p) {
      const retired = retiree(o);
      const errors = commonValidation(o, p, retired ? 1900 : 1962, 2002);
      if (!retired && o.profile !== 'single-childless-statutory') errors.push(taxText('Bekräfta den stödda tyska individuella profilen.'));
      if (![0, .08, .09].includes(o.churchRate)) errors.push(taxText('Välj korrekt regional kyrkoskatt.'));
      if (retired) {
        const year = o.statutoryPensionStartYear;
        const exemption = o.statutoryPensionExemptAmount;
        const share = o.vblTaxableShare;
        if (!nonnegative(o.pensionInsurancePaid) ||
            (year != null && (!Number.isInteger(year) || year < 1900 || year > 9999)) ||
            (exemption != null && !nonnegative(exemption)) ||
            (share != null && (!nonnegative(share) || share > 1)))
          errors.push(taxText('Ange giltiga pensionsuppgifter och betalda försäkringspremier.'));
      } else {
        if (!Number.isFinite(o.healthAdditionalRate) || o.healthAdditionalRate < 0 || o.healthAdditionalRate > .1)
          errors.push(taxText('Ange faktisk Zusatzbeitrag (0–10 %).'));
        if (typeof o.saxony !== 'boolean') errors.push(taxText('Bekräfta Sachsenstatus.'));
        if (!nonnegative(o.employmentExpenses)) errors.push(taxText('Ange icke-negativa avdrag.'));
      }
      if (!nonnegative(o.churchTaxPaid)) errors.push(taxText('Ange icke-negativa avdrag.'));
      return errors;
    },
    assessmentOptions: nativeOptions,
  };

  return { taxes: [germanTax] };
}
