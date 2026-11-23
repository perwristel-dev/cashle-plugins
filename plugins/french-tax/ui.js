export default function (context) {
  const { translations } = context;
  const taxText = (key, parameters = {}) => {
    const catalogue = translations[context.language] ?? translations[context.language?.split('-')[0]];
    return (catalogue?.[key] ?? translations.sv?.[key] ?? key)
      .replace(/\{([\w]+)\}/g, (match, name) => parameters[name] ?? match);
  };
  const n = (key, label, extra = {}) => ({ key, label, kind: 'number', min: 0, ...extra });
  const c = (key, label, options, extra = {}) => ({ key, label, kind: 'select', options, ...extra });
  const amount = (o, k, e) => { if (!Number.isFinite(o[k]) || o[k] < 0) e.push(taxText('Ange faktisk icke-negativ {field}.', { field: k })); };
  const assessmentOptions = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '' && v !== null && v !== undefined));

  const check = (key, label, extra = {}) => ({ key, label, kind: 'check', default: false, ...extra });
  const date = (key, label, extra = {}) => ({ key, label, kind: 'date', default: '', ...extra });
  const common = () => [
    { key: 'propertyType', label: 'Privat bostad', kind: 'select', options: [['detachedHome', 'Småhus'], ['residentialHome', 'Annan privat bostad']], default: 'detachedHome' },
    n('ownershipShare', 'Laglig ägarandel', { default: 1, exclusiveMin: true, max: 1 }),
    date('acquiredDate', 'Faktiskt historiskt förvärvsdatum', { required: true }),
    date('contractDate', 'Bindande försäljningskontrakt'),
    check('principalResidence', 'Kvalificerad permanentbostad enligt landets regler'),
  ];
  const propertyTax = { fields: [...common(), date('settlementDate', 'Faktiskt notarietillträde och skattebetalning', { required: true })],
    help: 'Frankrike: kvalificerad permanentbostad och ägarens försäljningslikvid högst 15 000 EUR är undantagna. Annan privat bostad beskattas med 19 % inkomstskatt och 17,2 % sociala avgifter på olika innehavstidsjusterade underlag (fulla undantag efter 22 respektive 30 år), plus tilläggsskatt över 50 000 EUR beskattningsbar vinst. Anskaffningsvärdet ska redan innehålla verifierade avdragsgilla kostnader; inga schablonpåslag läggs automatiskt på igen. Skatten betalas hos notarien och räknas av exakt en gång vid årsavstämningen.' };

  const commonFields = [
    c('ruleYear', 'Inkomstår / regelutgåva', [['2025', '2025 (Frankrike: deklaration 2026)']], { numeric: true }),
    c('residency', 'Skatterättslig hemvist', [['', 'Välj'], ['full-year', 'Hela året']]),
    { key: 'settlementDate', label: 'Faktiskt eller uttryckligt prognostiserat betalningsdatum enligt skattebesked', kind: 'date' },
    { key: 'initialState', label: 'Faktiska daterade ingående förlustsaldon (EUR)', kind: 'json', money: true, help: 'Objekt med capitalLossYear1…10. Year1 kan användas under första prognosåret och förfaller därefter. Nya förluster förs vidare automatiskt.' },
    { key: 'noticeDatesByYear', label: 'Faktiska betalningsdatum per inkomstår', kind: 'json', help: 'Till exempel {"2025":["2026-09-15","2026-10-15"]}. Använd faktiska besked.' },
    { key: 'noticeAmountsByYear', label: 'Faktiska betalningsbelopp per inkomstår', kind: 'json', money: true, help: 'Ett nominellt belopp per datum. Krävs vid flera delbetalningar.' },
    { key: 'settlementCalendar', label: 'Uttryckligen bekräftad återkommande prognoskalender', kind: 'json', help: '{"month":9,"day":30,"yearOffset":1,"confirmed":true}. En prognos är inte en garanterad myndighetsfrist.' },
  ];

  const base = options => {
    const errors = [];
    const allowedLosses = new Set(Array.from({ length: 10 }, (_, i) => `capitalLossYear${i + 1}`));
    const state = options.initialState;
    if (state !== undefined && (!state || typeof state !== 'object' || Array.isArray(state) ||
        Object.entries(state).some(([key, value]) => !allowedLosses.has(key) || !Number.isFinite(value) || value < 0))) {
      errors.push(taxText('Ange ingående förlustsaldon med stödda årsbucketnycklar och icke-negativa nominella belopp.'));
    }
    if (options.ruleYear !== 2025 || options.residency !== 'full-year') {
      errors.push(taxText('Välj inkomstår 2025 och bekräfta hemvist hela året.'));
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(options.settlementDate ?? '') &&
        !Object.keys(options.noticeDatesByYear ?? {}).length && !options.settlementCalendar?.confirmed) {
      errors.push(taxText('Ange betalningsdatum enligt besked; deklarationsfrist är inte betalningsdatum.'));
    }
    return errors;
  };

  const frenchTax = {
    translate: taxText,
    translations,
    requiresTaxPlan: true,
    sourceTax: { language: 'groovy-cashle-plugin', provider: 'cashle.tax.fr', source: 'french-tax.cashle' },
    id: 'FR', label: 'Frankrike', currency: 'EUR', ruleYear: 2025, supportedBases: ['salary', 'capitalIncome'], propertyTax,
    description: 'Inkomster 2025, barème/deklaration 2026. Separata ensamstående skattehushåll, vanligt quotient familial och tak 1 807 EUR per extra halvpart samt décote. Lön är bruttokontantlön. Ange faktiska totala och avdragsgilla arbetstagaravgifter samt skattepliktiga lönetillägg från lönebeskedet. Nettofiskal lön räknas som brutto minus avdragsgilla avgifter plus tillägg; därefter dras arbetskostnader av. Faktiska totala socialavgifter bokas separat som kontant belastning. Endast PFU; 2025 utdelning 30 %, värdepappersvinster som bedöms 2026 31,4 %. Sambeskattning/PACS, barème-val, särskilda familjetak och höginkomst CEHR/CDHR ingår inte.',
    source: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1419',
    defaultOptions: { ruleYear: 2025, residency: '', initialState: {}, salaryDefinition: '', civilStatus: 'single', familyParts: 1, familyProfile: 'ordinary', capitalElection: 'pfu', employmentSocialContributions: null, deductibleEmployeeContributions: null, payrollTaxableAdditions: 0, settlementDate: '' },
    fields: [
      ...commonFields,
      c('salaryDefinition', 'Lönebeloppets exakta definition', [['', 'Välj'], ['gross-resolved-payroll', 'Bruttokontantlön med exakt lönebeskedsavstämning']]),
      c('civilStatus', 'Skatteenhet', [['single', 'Separat ensamstående skattehushåll']]),
      n('familyParts', 'Verifierat antal vanliga familjeandelar (halvsteg)', { min: 1, max: 6 }),
      c('familyProfile', 'Familjeregler', [['ordinary', 'Vanligt tak; inga särskilda halvpartsregler']]),
      c('capitalElection', 'Kapitalinkomstval för hela året', [['pfu', 'PFU (inget globalt barème-val)']]),
      n('employmentSocialContributions', 'Faktiska obligatoriska arbetstagaravgifter per år (EUR)', { money: true, help: 'Samtliga obligatoriska arbetstagaravgifter. Endast avdragsgill del dras från skatteunderlaget.' }),
      n('deductibleEmployeeContributions', 'Faktisk avdragsgill del av arbetstagaravgifter inklusive avdragsgill CSG (EUR)', { money: true }),
      n('payrollTaxableAdditions', 'Faktiska skattepliktiga tillägg till nettofiskal lön utöver bruttokontantlönen (EUR)', { money: true }),
    ],
    validate(options) {
      const errors = base(options);
      if (options.salaryDefinition !== 'gross-resolved-payroll') errors.push(taxText('Bekräfta bruttokontantlön och exakta lönebeskedsuppgifter.'));
      if (options.civilStatus !== 'single' || options.familyProfile !== 'ordinary' || options.capitalElection !== 'pfu') {
        errors.push(taxText('Välj stödd separat skatteenhet, vanlig familjeprofil och PFU.'));
      }
      if (!Number.isFinite(options.familyParts) || options.familyParts < 1 || options.familyParts > 6 || !Number.isInteger(options.familyParts * 2)) {
        errors.push(taxText('Ange verifierade familjeandelar i halvsteg.'));
      }
      for (const key of ['employmentSocialContributions', 'deductibleEmployeeContributions', 'payrollTaxableAdditions']) {
        amount(options, key, errors);
      }
      if (options.deductibleEmployeeContributions > options.employmentSocialContributions) {
        errors.push(taxText('Avdragsgilla avgifter får inte överstiga totala avgifter.'));
      }
      return errors;
    },
    assessmentOptions,
  };

  return { taxes: [frenchTax] };
}
