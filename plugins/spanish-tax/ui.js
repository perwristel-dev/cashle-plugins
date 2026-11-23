export default function (context) {
  const { translations } = context;
  const translate = (key, parameters = {}) => {
    const language = context.language;
    const catalogue = translations[language] ?? translations[language?.split('-')[0]] ?? translations.sv;
    return (catalogue?.[key] ?? translations.sv?.[key] ?? key)
      .replace(/\{([\w]+)\}/g, (match, name) => parameters[name] ?? match);
  };

  const number = (key, label, extra = {}) => ({ key, label, kind: 'number', min: 0, ...extra });
  const select = (key, label, options, extra = {}) => ({ key, label, kind: 'select', options, ...extra });
  const date = (key, label, extra = {}) => ({ key, label, kind: 'date', default: '', ...extra });
  const check = (key, label, extra = {}) => ({ key, label, kind: 'check', default: false, ...extra });
  const lossPrefixes = ['capitalLossYear', 'savingsIncomeLossYear'];
  const openingLossKeys = new Set(lossPrefixes.flatMap(prefix => [1, 2, 3, 4].map(year => prefix + year)));
  const requestingReinvestment = details => details.requestDeferral;
  const principalResidence = details => details.principalResidence;

  const fields = [
    select('ruleYear', 'Inkomstår / regelutgåva', [['2025', '2025']], { numeric: true }),
    select('residency', 'Skatterättslig hemvist', [['', 'Välj'], ['full-year', 'Hela året']]),
    date('settlementDate', 'Faktiskt eller uttryckligt prognostiserat betalningsdatum enligt skattebesked'),
    {
      key: 'initialState', label: 'Faktiska daterade ingående förlustsaldon (EUR)', kind: 'json', money: true,
      help: 'Objekt med capitalLossYear1…4 och savingsIncomeLossYear1…4. Year1 kan användas under första prognosåret och förfaller därefter. Nya förluster förs vidare automatiskt.',
    },
    {
      key: 'noticeDatesByYear', label: 'Faktiska betalningsdatum per inkomstår', kind: 'json',
      help: 'Till exempel {"2025":["2026-09-15","2026-10-15"]}. Använd faktiska besked.',
    },
    {
      key: 'noticeAmountsByYear', label: 'Faktiska betalningsbelopp per inkomstår', kind: 'json', money: true,
      help: 'Ett nominellt belopp per datum. Krävs vid flera delbetalningar.',
    },
    {
      key: 'settlementCalendar', label: 'Uttryckligen bekräftad återkommande prognoskalender', kind: 'json',
      help: '{"month":9,"day":30,"yearOffset":1,"confirmed":true}. En prognos är inte en garanterad myndighetsfrist.',
    },
    { key: 'autonomousCommunity', label: 'Faktisk autonom region (common territory)', kind: 'text' },
    {
      key: 'regionalSchedule', label: 'Regionens faktiska progressiva skala', kind: 'json', moneyKeys: ['upTo'],
      help: 'JSON-lista med {"upTo":12450,"rate":0.095}. Sista raden måste endast ha {"rate":...}; trösklar i stigande ordning, skattesatser som decimaler. Ange verklig regional skala för 2025.',
    },
    number('regionalMinimum', 'Regionens faktiska personminimum, vuxen under 65 (2025 års EUR)', {
      money: true,
      help: 'Publicerat personminimum för regelåret 2025. Beloppet är en regelkonstant, inte ett personligt nominellt framtidsbelopp.',
    }),
    number('employeeSocialContributions', 'Faktiska avdragsgilla arbetstagaravgifter per år (EUR)', { money: true }),
  ];

  const propertyTax = {
    fields: [
      select('propertyType', 'Privat bostad', [['detachedHome', 'Småhus'], ['residentialHome', 'Annan privat bostad']], {
        default: 'detachedHome',
      }),
      number('ownershipShare', 'Laglig ägarandel', { default: 1, exclusiveMin: true, max: 1 }),
      date('acquiredDate', 'Faktiskt historiskt förvärvsdatum', { required: true }),
      date('contractDate', 'Bindande försäljningskontrakt'),
      check('principalResidence', 'Kvalificerad permanentbostad enligt landets regler'),
      date('transferDate', 'Faktisk dag för övergång av äganderätten / escritura', { required: true }),
      date('dateOfBirth', 'Ägarens faktiska födelsedatum för 65-årsundantag', {
        when: principalResidence, requiredWhen: principalResidence,
      }),
      { key: 'paymentDueDates', label: 'Faktiska betalningsdatum enligt IRPF-besked', kind: 'dates', default: [] },
      {
        key: 'paymentAmounts', label: 'Faktiska nominella beskedsbelopp (ett per datum)', kind: 'numbers',
        money: true, datesKey: 'paymentDueDates', default: [],
      },
      number('birthYear', 'Ägarens födelseår', { default: null, integer: true, min: 1900, max: 2007 }),
      check('mainHomeEligibilityConfirmed', 'Jag har verifierat villkoren för vivienda habitual'),
      check('requestDeferral', 'Begär undantag genom faktiskt genomfört återköp av permanentbostad'),
      date('replacementAcquiredDate', 'Ersättningsbostadens faktiska förvärvsdatum', {
        when: requestingReinvestment, requiredWhen: requestingReinvestment,
      }),
      number('replacementBasis', 'Faktiskt återinvesterat belopp (EUR)', {
        default: 0, money: true, when: requestingReinvestment,
      }),
      number('mortgageOutstanding', 'Kapitalskuld på såld bostad vid försäljningen (EUR)', {
        default: 0, money: true, when: requestingReinvestment,
      }),
      check('replacementHomeEligibilityConfirmed', 'Jag har verifierat ersättningsbostadens boende- och tidsvillkor', {
        when: requestingReinvestment, mustBeTrue: true,
      }),
    ],
    help: 'Spanien: privat vinst till sparbasen. Förvärv före 31 december 1994 kräver särskilda övergångsregler och avvisas. Kvalificerad permanentbostad för ägare från 65 år kan vara skattefri. Faktisk återinvestering inom två år före/efter försäljningen ger proportionellt undantag; endast avsikt/förväntat återköp stöds inte. Bristande framtida boendevillkor kräver rättelse av ursprungsårets IRPF inklusive separat ränta, inte en ny svensk uppskovsskuld. Lokala plusvalía municipal ingår inte.',
  };

  const nonnegative = value => Number.isFinite(value) && value >= 0;
  const validOpeningLosses = state => state && typeof state === 'object' && !Array.isArray(state)
    && Object.entries(state).every(([key, value]) => openingLossKeys.has(key) && nonnegative(value));
  const validRegionalSchedule = schedule => Array.isArray(schedule) && schedule.length > 0
    && schedule.every((band, index) => band && nonnegative(band.rate) && band.rate <= 1
      && (index === schedule.length - 1 ? band.upTo === undefined
        : Number.isFinite(band.upTo) && band.upTo > (schedule[index - 1]?.upTo ?? 0)));

  const spanishTax = {
    translate,
    translations,
    sourceTax: { language: 'groovy-cashle-plugin', provider: 'cashle.tax.es', source: 'spanish-tax.cashle' },
    id: 'ES',
    label: 'Spanien',
    currency: 'EUR',
    ruleYear: 2025,
    requiresTaxPlan: true,
    supportedBases: ['salary', 'pension', 'capitalIncome'],
    description: 'IRPF 2025 för enskilda vuxna i det spanska ordinarie skattesystemet. Lön och pension ingår i samma skattebas. Ange verifierad regional skala och regionalt grundbelopp före ålderstillägg.',
    source: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025.html',
    defaultOptions: {
      ruleYear: 2025,
      residency: '',
      initialState: {},
      autonomousCommunity: '',
      regionalSchedule: [],
      regionalMinimum: null,
      employeeSocialContributions: null,
      settlementDate: '',
    },
    fields,
    propertyTax,
    validate(options) {
      const errors = [];
      if (options.initialState !== undefined && !validOpeningLosses(options.initialState))
        errors.push(translate('Ange ingående förlustsaldon med stödda årsbucketnycklar och icke-negativa nominella belopp.'));
      if (options.ruleYear !== 2025 || options.residency !== 'full-year')
        errors.push(translate('Välj inkomstår 2025 och bekräfta hemvist hela året.'));
      if (!/^\d{4}-\d{2}-\d{2}$/.test(options.settlementDate ?? '')
        && !Object.keys(options.noticeDatesByYear ?? {}).length && !options.settlementCalendar?.confirmed)
        errors.push(translate('Ange betalningsdatum enligt besked; deklarationsfrist är inte betalningsdatum.'));
      if (typeof options.autonomousCommunity !== 'string' || !options.autonomousCommunity.trim()
        || /navarr|basque|vasco/i.test(options.autonomousCommunity))
        errors.push(translate('Ange faktisk region inom common-territory-regimen.'));
      if (!validRegionalSchedule(options.regionalSchedule))
        errors.push(translate('Ange verifierad progressiv regional skala med en obegränsad sista rad.'));
      for (const field of ['regionalMinimum', 'employeeSocialContributions']) {
        if (!nonnegative(options[field])) errors.push(translate('Ange faktisk icke-negativ {field}.', { field }));
      }
      return errors;
    },
    assessmentOptions(options) {
      return Object.fromEntries(Object.entries(options).filter(([, value]) => value !== '' && value != null));
    },
  };

  return { taxes: [spanishTax] };
}
