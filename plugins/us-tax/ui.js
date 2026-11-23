export const usStates = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
  ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'],
  ['DC', 'District of Columbia'], ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'],
  ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'],
  ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'],
  ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'],
  ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'],
  ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'],
  ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'],
  ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
];

export default function (context) {
  const { translations } = context;
  const taxText = (key, parameters = {}) => {
    const catalogue = translations[context.language] ?? translations[context.language?.split('-')[0]];
    return (catalogue?.[key] ?? translations.sv?.[key] ?? key)
      .replace(/\{([\w]+)\}/g, (match, name) => parameters[name] ?? match);
  };
  const choice = (key, label, options, extra = {}) => ({ key, label, kind: 'select', options, ...extra });
  const number = (key, label, extra = {}) => ({ key, label, kind: 'number', min: 0, ...extra });
  const commonFields = [choice('ruleYear', 'Regelår', [['2026', '2026']], { numeric: true }), choice('residency', 'Skatterättslig hemvist', [['', 'Välj'], ['full-year', 'Bosatt hela året']])];
  const commonErrors = (o, profile) => {
    const errors = [];
    if (o.ruleYear !== 2026 || o.residency !== 'full-year') errors.push(taxText('Välj regelår 2026 och bekräfta hemvist hela året.'));
    if ((profile?.people ?? []).some(p => Number.isInteger(p.birthYear) && (p.birthYear < 1 || p.birthYear > 2007))) errors.push(taxText('Reglerna stöder vuxna från 19 års ålder i regelåret. Äldre personer stöds för de angivna inkomstslagen; pensionsförmåner och barnprofiler kräver andra regler.'));
    return errors;
  };
  const positive = (o, fields, errors) => { for (const key of fields) if (!Number.isFinite(o[key]) || o[key] < 0) errors.push(taxText('{field}: ange ett ändligt belopp som är 0 eller större.', { field: key })); };

  const verifiedUsStates = new Set(['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WY']);
  const usStateTaxFields = [
    { key: 'state', label: 'Delstat / District of Columbia', kind: 'select', options: [['', 'Välj'], ...usStates] },
    { key: 'stateTaxMethod', label: 'Lokal inkomstskatt', kind: 'select', options: [['verified', 'Verifierade regler (AK, FL, NV, SD, TN, TX, WY)'], ['estimated-flat', 'Schablon – egen effektiv skattesats']], help: 'Lokal skatt omfattar delstat och eventuell kommun. Övriga delstater och DC kräver ett uttryckligt val av schablon. Federal skatt beräknas med motorns regler i båda lägena.' },
    { key: 'estimatedStateTaxRate', label: 'Schablon för lokal inkomstskatt', kind: 'number', min: 0, max: 1, percent: true, when: o => o.stateTaxMethod === 'estimated-flat', help: 'Förvalet 5 % är ett ändringsbart prognosantagande, inte en fastställd skattesats. Skatten beräknas före grundavdrag på ett positivt AGI-liknande underlag (adjusted gross income) av de inkomster som markerats för lokal skatt. Federala principer används som schablon för nettning av vinster och förluster. Lön, ränta, utdelningar och realiserade investerings- och bostadsvinster kan ingå. Delstatens egna avdrag, undantag, skikt och lokala regler beräknas inte. Fastighetsskatt, försäljningsskatt och delstatliga löneavgifter ingår inte.' },
  ];
  function validateUsStateTax(options) {
    const errors = [];
    if (!usStates.some(([code]) => code === options.state)) errors.push(taxText('Välj en amerikansk delstat eller District of Columbia.'));
    const method = options.stateTaxMethod ?? 'verified';
    if (!['verified', 'estimated-flat'].includes(method)) errors.push(taxText('Välj verifierade delstatsregler eller en uttrycklig schablon.'));
    if (method === 'verified' && !verifiedUsStates.has(options.state)) errors.push(taxText('För denna delstat behöver du välja Schablon och ange en effektiv skattesats. Verifierade regler finns för AK, FL, NV, SD, TN, TX och WY.'));
    if (method === 'estimated-flat' && (!Number.isFinite(options.estimatedStateTaxRate) || options.estimatedStateTaxRate < 0 || options.estimatedStateTaxRate > 1)) errors.push(taxText('Ange en schablonskatt mellan 0 och 100 %.'));
    return errors;
  }

  const propertyTax = (() => {
    const number = (key, label, value = 0, extra = {}) => ({ key, label, kind: 'number', default: value, min: 0, ...extra });
    const check = (key, label, extra = {}) => ({ key, label, kind: 'check', default: false, ...extra });
    const date = (key, label, extra = {}) => ({ key, label, kind: 'date', default: '', ...extra });
    const choice = (key, label, options, value = '', extra = {}) => ({ key, label, kind: 'select', options, default: value, ...extra });
    const common = [choice('propertyType', 'Bostadstyp', [['detachedHome', 'Privat småhus'], ['residentialHome', 'Annan privat bostad']], 'detachedHome'), number('ownershipShare', 'Laglig ägarandel', 1, { exclusiveMin: true, max: 1 }), date('acquiredDate', 'Ursprungligt förvärvsdatum', { required: true }), date('contractDate', 'Bindande försäljningskontrakt'), date('paymentDueDate', 'Faktisk avvikande betalningsdag (valfritt)', { help: 'Lämna tomt för lagens ordinarie årliga betalningsdag. Extra preliminära betalningar modelleras separat.' })];
    const claiming = o => o.claimSection121;
    const jointClaim = o => o.claimSection121 && o.filingStatus === 'marriedJoint';
    return { help: 'USA: federal beräkning för privat bostad i någon av de 50 delstaterna eller DC. Bostadens delstat måste vara samma som ägarens hemvist under försäljningsåret. Utanför de sju verifierade delstaterna måste delstats- och lokalskatt väljas som schablon i personkortets skatteinställningar. Schablonen använder federalt AGI-underlag; delstatens egna bostadsundantag beräknas inte. Bostäder i en annan delstat kräver separata regler och stöds inte. Section 121 kräver verifierad 2-av-5-årstid och att ingen annan uteslutning använts de senaste två åren. Privat förlust är inte avdragsgill. Ingen verksamhet, uthyrning, avskrivning, nonqualified use eller partiell uteslutning. Tillträdesdagen styr innehavstid och skatteår. Slutlig skatt förfaller normalt 15 april följande år med helg-/Emancipation Day-justering; individuella uppskov anges som datum.', fields: [...common,
      choice('state', 'Bostadens och ägarens delstat', [['', 'Välj'], ...usStates]),
      choice('filingStatus', 'Deklarationsstatus försäljningsåret', [['', 'Välj'], ['single', 'Single'], ['marriedSeparate', 'Married filing separately'], ['headOfHousehold', 'Head of household']]),
      check('claimSection121', 'Begär full ordinarie Section 121-uteslutning'), number('ownershipMonthsLast60', 'Ägarmånader under de senaste 60 månaderna', 0, { integer: true, max: 60, when: claiming }), number('residenceMonthsLast60', 'Månader som huvudsaklig bostad under de senaste 60', 0, { integer: true, max: 60, when: claiming }), check('noOtherExclusionLast2Years', 'Ingen annan Section 121-uteslutning under de föregående två åren', { mustBeTrue: true, when: claiming }), number('spouseResidenceMonthsLast60', 'Makens boendemånader under de senaste 60', 0, { integer: true, max: 60, when: jointClaim }), check('spouseNoOtherExclusionLast2Years', 'Maken har inte använt annan uteslutning under de föregående två åren', { mustBeTrue: true, when: jointClaim }),
    ] };
  })();

  const unitedStatesTax = {
    translate: taxText,
    translations,
    requiresTaxPlan: true,
    sourceTax: { language: 'groovy-cashle-plugin', provider: 'cashle.tax.us', source: 'us-tax.cashle' },
    id: 'US', label: 'USA', currency: 'USD', ruleYear: 2026,
    supportedBases: ['salary', 'capitalIncome', 'qualifiedDividends', 'shortTermCapitalGains', 'shortTermCapitalLosses', 'longTermCapitalGains', 'longTermCapitalLosses'],
    propertyTax: propertyTax,
    description: 'USA 2026: federal inkomstskatt, kvalificerad utdelning, kort/lång kapitalvinst, AMT, NIIT och anställds FICA. Verifierade delstatsregler finns för AK, FL, NV, SD, TN, TX och WY. Alla 50 delstater och DC kan använda en uttryckligt vald, ändringsbar schablon för lokal inkomstskatt på ett AGI-liknande underlag av lokalt skattepliktiga inkomster. Förvalet 5 % är ett prognosantagande, inte en fastställd skattesats. Individuell deklaration, standardavdrag inklusive ålderstillägg från 65 och enhanced senior deduction med avtrappning. Inga barn-, utbildnings- eller andra personliga skattereduktioner. Sambeskattning, Social Security-utbetalningar, andra pensionsinkomster och pensionskonton stöds inte i planen.',
    sourceSettings: {
      defaultOptions: { federalTaxable: true, localTaxable: true },
      fields: [
        { key: 'federalTaxable', kind: 'check', label: 'Federal inkomstskatt', help: 'Inkomsten ingår i federal inkomstskatt. Löneavgifter som Social Security och Medicare (FICA) följer inkomstslaget separat; detta val gör inte en lön fri från löneavgifter.' },
        { key: 'localTaxable', kind: 'check', label: 'Lokal inkomstskatt', help: 'Inkomsten ingår i lokal skatt (delstat och eventuell kommun). Lokal skatt beräknas enligt personkortets verifierade regler eller valda schablon. Samma inkomst kan omfattas av både federal och lokal skatt.' },
      ],
      validate(options) {
        const errors = [];
        if (!options || typeof options !== 'object' || Array.isArray(options)) return [taxText('Ange giltiga skatteuppgifter för inkomsten.')];
        for (const key of Object.keys(options)) if (!['federalTaxable', 'localTaxable'].includes(key)) errors.push(taxText('USA: okänt skattefält för inkomsten: {field}.', { field: key }));
        for (const key of ['federalTaxable', 'localTaxable']) if (typeof options[key] !== 'boolean') errors.push(taxText('Ange om inkomsten omfattas av federal respektive lokal inkomstskatt.'));
        return errors;
      },
    },
    source: 'https://www.irs.gov/irb/2025-45_IRB',
    defaultOptions: { ruleYear: 2026, residency: '', state: '', stateTaxMethod: 'verified', estimatedStateTaxRate: .05, filingStatus: '', openingShortTermCapitalLoss: 0, openingLongTermCapitalLoss: 0, seniorDeductionEligible: true, januaryFirstBirthday: false },
    fields: [...commonFields, ...usStateTaxFields, choice('filingStatus', 'Deklarationsstatus', [['', 'Välj'], ['single', 'Single'], ['marriedSeparate', 'Married filing separately'], ['headOfHousehold', 'Head of household – verifierad behörighet']]), number('openingShortTermCapitalLoss', 'Ingående kortfristig kapitalförlust (USD)', { money: true }), number('openingLongTermCapitalLoss', 'Ingående långfristig kapitalförlust (USD)', { money: true }), { key: 'seniorDeductionEligible', label: 'Giltigt SSN för enhanced senior deduction när åldersvillkoret uppfylls', kind: 'check', help: 'Från 65: upp till 6 000 USD med inkomstavtrappning. Married filing separately har inte rätt till detta extra avdrag. Regelutgåvan 2026 återanvänds i prognosår.' }, { key: 'januaryFirstBirthday', label: 'Födelsedagen är den 1 januari (USA:s särskilda åldersgräns)', kind: 'check', help: 'En person född den 1 januari anses uppnå åldern dagen före födelsedagen. Kräver separata personinställningar om två vuxna har olika födelsedagar.' }],
    validate(o, profile) { const errors = commonErrors(o, profile); errors.push(...validateUsStateTax(o)); if (!['single', 'marriedSeparate', 'headOfHousehold'].includes(o.filingStatus)) errors.push(taxText('Välj stödd individuell deklarationsstatus.')); positive(o, ['openingShortTermCapitalLoss', 'openingLongTermCapitalLoss'], errors); if ((profile?.people?.length ?? 0) > 1 && (o.openingShortTermCapitalLoss > 0 || o.openingLongTermCapitalLoss > 0)) errors.push(taxText('Ingående USA-förlust för två vuxna behöver separata personinställningar; gemensamma profilfält får inte dubblera samma förlust.')); return errors; },
    assessmentOptions(o) { const { openingShortTermCapitalLoss, openingLongTermCapitalLoss, ...options } = o; return { ...options, initialState: { shortTermCapitalLossCarry: openingShortTermCapitalLoss, longTermCapitalLossCarry: openingLongTermCapitalLoss, localShortTermCapitalLossCarry: openingShortTermCapitalLoss, localLongTermCapitalLossCarry: openingLongTermCapitalLoss, ...(options.initialState ?? {}) } }; },
  };

  return { taxes: [unitedStatesTax] };
}
