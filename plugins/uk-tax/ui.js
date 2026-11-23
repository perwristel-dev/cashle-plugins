export default function (context) {
  const { translations } = context;
  const taxText = (key, parameters = {}) => {
    const catalogue = translations[context.language] ?? translations[context.language?.split('-')[0]];
    return (catalogue?.[key] ?? translations.sv?.[key] ?? key)
      .replace(/\{([\w]+)\}/g, (match, name) => parameters[name] ?? match);
  };
  const profileNumber = (key, label, extra = {}) => ({ key, label, kind: 'number', ...extra });
  const profileChoice = (key, label, options, extra = {}) => ({ key, label, kind: 'select', options, ...extra });
  const commonFields = [profileChoice('ruleYear', 'Regelutgåva', [['2026', '2026/27']], { numeric: true }), profileChoice('residency', 'Skattehemvist', [['', 'Välj'], ['full-year', 'Bosatt hela skatteåret']])];
  const nativeOptions = options => Object.fromEntries(Object.entries(options).filter(([, value]) => value !== null && value !== undefined && value !== ''));
  const commonErrors = options => [options.ruleYear !== 2026 ? taxText('Välj regelutgåva 2026/27.') : '', options.residency !== 'full-year' ? taxText('Bekräfta full skattehemvist hela skatteåret.') : ''].filter(Boolean);
  const openingLossErrors = (options, profile) => {
    const errors = [];
    if (!Number.isFinite(options.openingCapitalLoss) || options.openingCapitalLoss < 0) errors.push(taxText('Ange en ändlig, icke-negativ ingående kapitalförlust.'));
    if ((profile?.people?.length ?? 0) > 1 && options.openingCapitalLoss > 0) errors.push(taxText('Ingående kapitalförlust måste fördelas per person; ett positivt gemensamt profilvärde för två vuxna stöds inte.'));
    return errors;
  };
  const assessmentOptions = options => {
    const { openingCapitalLoss, ...rules } = nativeOptions(options);
    return { ...rules, initialState: { capitalLossCarry: openingCapitalLoss ?? 0 } };
  };

  const number = (key, label, value = 0, extra = {}) => ({ key, label, kind: 'number', default: value, min: 0, ...extra });
  const date = (key, label, extra = {}) => ({ key, label, kind: 'date', default: '', ...extra });
  const check = (key, label, extra = {}) => ({ key, label, kind: 'check', default: false, ...extra });
  const select = (key, label, options, value, extra = {}) => ({ key, label, kind: 'select', options, default: value, ...extra });
  const common = [select('propertyType', 'Bostadstyp', [['detachedHome', 'Småhus'], ['residentialHome', 'Annan privatbostad']], 'detachedHome'), number('ownershipShare', 'Laglig ägarandel', 1, { exclusiveMin: true, max: 1 }), date('acquiredDate', 'Historiskt förvärvsdatum', { required: true }), date('contractDate', 'Bindande försäljningskontrakt', { help: 'Tomt använder planens försäljningsdatum. Kontraktet styr skatteår, tillträdet styr likvid och särskilda tidsfrister.' })];
  const propertyTax = { help: 'Brittiska privatbostäder: verifierade kvalificerande boendedagar och sista nio månaderna styr befrielsen. Vinster delas med övriga kapitalvinster och årets £3 000-undantag. Ange beräknad/faktisk CGT-förskottsbetalning inom 60 dagar efter tillträde; slutavräkning följer 31 januari efter skatteåret. Inga automatiska lettings-, vårdhems- eller särskilda frånvaroutvidgningar.', fields: [...common, check('privateResidenceReliefConfirmed', 'Jag har verifierat ordinarie PRR-villkor utan särskilda undantag', { mustBeTrue: true }), check('mainResidenceEver', 'Bostaden har någon gång varit min verkliga huvudbostad'), number('qualifyingResidenceDaysExcludingFinalPeriod', 'Kvalificerade boendedagar utanför sista nio månaderna', 0, { integer: true, help: 'Ange bara dagar före slutperioden. Slutperioden läggs till automatiskt om bostaden varit huvudbostad. Kontrollera eventuell uthyrning och överlappning.' }), number('advanceTaxPayment', 'Beräknad/faktisk CGT-betalning efter 60 dagar', 0, { money: true, help: 'Nominell GBP per ägare; beaktar uppskattad årsinkomst, redan utnyttjat kapitalundantag och tillgängliga förluster. 0 är ett uttryckligt antagande. Beloppet krediteras vid årsavstämningen.' })] };

  const britishTax = {
    translate: taxText,
    translations,
    requiresTaxPlan: true,
    sourceTax: { language: 'groovy-cashle-plugin', provider: 'cashle.tax.gb', source: 'uk-tax.cashle' },
    id: 'GB', label: 'Storbritannien (UK)', currency: 'GBP', ruleYear: 2026, propertyTax: propertyTax,
    supportedBases: ['salary', 'capitalIncome', 'dividendIncome', 'capitalGains', 'investmentCapitalLoss'],
    source: 'https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past',
    description: '2026/27: 6 april–5 april. Fryst 2026/27-utgåva används även i senare prognosår. Inkomstskatt, årlig prognos för anställdas NI, sparränta, utdelning och kapitalvinster. Skotska löneband väljs separat. NI beräknas med årsgränser; faktisk oregelbunden lön kan ge annan avgift. Inga pensioner, FIG, barn- eller äktenskapsavdrag.',
    defaultOptions: { ruleYear: 2026, residency: '', region: '', niCategory: 'A', openingCapitalLoss: 0 },
    fields: [...commonFields, profileNumber('openingCapitalLoss', 'Ingående oanvänd kapitalförlust (GBP per person)', { money: true, min: 0, help: 'Verifierat oanvänt förlustbelopp från tidigare år. Detta är förluststock före årets kapitalundantag, inte en skatteavräkning.' }), profileChoice('region', 'Inkomstskatteregion', [['', 'Välj'], ['england-wales-ni', 'England, Wales och Nordirland'], ['scotland', 'Skottland']]), profileChoice('niCategory', 'National Insurance-kategori', [['A', 'A – vanlig anställd, årsprognos'], ['C', 'C – verifierad statlig pensionsålder']])],
    stateHelp: { capitalLossCarry: 'Oanvända godkända kapitalförluster från tidigare år; dras först så långt årets årliga kapitalundantag bevaras.' },
    validate(options, profile) { const errors = [...commonErrors(options), ...openingLossErrors(options, profile)]; if (!['england-wales-ni', 'scotland'].includes(options.region)) errors.push(taxText('Välj brittisk inkomstskatteregion.')); if (!['A', 'C'].includes(options.niCategory)) errors.push(taxText('Välj NI-kategori.')); return errors; },
    assessmentOptions,
  };

  return { taxes: [britishTax] };
}
