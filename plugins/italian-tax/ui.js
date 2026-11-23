export default function (context) {
  const { translations } = context;
  const taxText = (key, parameters = {}) => {
    const catalogue = translations[context.language] ?? translations[context.language?.split('-')[0]];
    return (catalogue?.[key] ?? translations.sv?.[key] ?? key)
      .replace(/\{([\w]+)\}/g, (match, name) => parameters[name] ?? match);
  };
  const moneyField = (key, label, value = 0, extra = {}) => ({ key, label, kind: 'number', default: value, min: 0, ...extra });
  const propertyCheck = (key, label, extra = {}) => ({ key, label, kind: 'check', default: false, ...extra });
  const date = (key, label, extra = {}) => ({ key, label, kind: 'date', default: '', ...extra });
  const common = () => [{ key: 'propertyType', label: 'Privat bostad', kind: 'select', options: [['detachedHome', 'Småhus'], ['residentialHome', 'Annan privat bostad']], default: 'detachedHome' }, moneyField('ownershipShare', 'Laglig ägarandel', 1, { exclusiveMin: true, max: 1 }), date('acquiredDate', 'Faktiskt historiskt förvärvsdatum', { required: true }), date('contractDate', 'Bindande försäljningskontrakt'), propertyCheck('principalResidence', 'Kvalificerad permanentbostad enligt landets regler')];
  const propertyForm = () => ({ fields: [...common(), date('settlementDate', 'Faktiskt tillträdes-/notariedatum för ersättningsskatt', { required: true }), propertyCheck('principalResidenceMajorityConfirmed', 'Jag/familjen har bott i bostaden under merparten av innehavstiden', { when: d => d.principalResidence, mustBeTrue: true }), propertyCheck('inherited', 'Bostaden är ärvd'), propertyCheck('superbonusWithinTenYears', 'Superbonus-arbeten har avslutats under de senaste tio åren', { help: 'Detta särskilda tioåriga skattefall stöds inte och avvisas av motorn.' }), { key: 'taxElection', label: 'Skatteval vid skattepliktig försäljning', kind: 'select', options: [['notary-26-percent', 'Uttryckligt val av 26 % ersättningsskatt hos notarien']], default: 'notary-26-percent' }], help: 'Italien: över fem års innehav, arv eller permanentbostad under merparten av innehavet kan ge undantag. Skattepliktig vanlig privatbostad beräknas med uttrycklig 26 % notarieskatt. Superbonus tioårsregler avvisas. Tillgångens köpbasis ska redan omfatta alla avdragsgilla kostnader. Notarieskatten bokas vid tillträdet och krediteras årsavstämningen en gång.' });
  const n = (key, label, extra = {}) => ({ key, label, kind: 'number', min: 0, ...extra });
  const c = (key, label, options, extra = {}) => ({ key, label, kind: 'select', options, ...extra });
  const check = (key, label) => ({ key, label, kind: 'check' });
  const text = (key, label) => ({ key, label, kind: 'text' });
  const commonFields = [c('ruleYear', 'Inkomstår / regelutgåva', [['2025', '2025']], { numeric: true }), c('residency', 'Skatterättslig hemvist', [['', 'Välj'], ['full-year', 'Hela året']]), { key: 'settlementDate', label: 'Faktiskt eller uttryckligt prognostiserat betalningsdatum enligt skattebesked', kind: 'date' }, { key: 'initialState', label: 'Faktiska daterade ingående förlustsaldon (EUR)', kind: 'json', money: true, help: 'Objekt med capitalLossYear1…4. Year1 kan användas under första prognosåret och förfaller därefter. Nya förluster förs vidare automatiskt.' }, { key: 'noticeDatesByYear', label: 'Faktiska betalningsdatum per inkomstår', kind: 'json', help: 'Till exempel {"2025":["2026-09-15","2026-10-15"]}. Använd faktiska besked.' }, { key: 'noticeAmountsByYear', label: 'Faktiska betalningsbelopp per inkomstår', kind: 'json', money: true, help: 'Ett nominellt belopp per datum. Krävs vid flera delbetalningar.' }, { key: 'settlementCalendar', label: 'Uttryckligen bekräftad återkommande prognoskalender', kind: 'json', help: '{"month":9,"day":30,"yearOffset":1,"confirmed":true}. En prognos är inte en garanterad myndighetsfrist.' }];
  const base = o => { const e = []; const allowedLoss = new Set(Array.from({length: o.salaryDefinition !== undefined ? 10 : 4}, (_, i) => `capitalLossYear${i + 1}`)); if (o.autonomousCommunity !== undefined) for (let i = 1; i <= 4; i++) allowedLoss.add(`savingsIncomeLossYear${i}`); if (o.initialState !== undefined && (!o.initialState || typeof o.initialState !== 'object' || Array.isArray(o.initialState) || Object.entries(o.initialState).some(([k, v]) => !allowedLoss.has(k) || !Number.isFinite(v) || v < 0))) e.push(taxText('Ange ingående förlustsaldon med stödda årsbucketnycklar och icke-negativa nominella belopp.')); if (o.ruleYear !== 2025 || o.residency !== 'full-year') e.push(taxText('Välj inkomstår 2025 och bekräfta hemvist hela året.')); if (!/^\d{4}-\d{2}-\d{2}$/.test(o.settlementDate ?? '') && !Object.keys(o.noticeDatesByYear ?? {}).length && !o.settlementCalendar?.confirmed) e.push(taxText('Ange betalningsdatum enligt besked; deklarationsfrist är inte betalningsdatum.')); return e; };
  const amount = (o, k, e) => { if (!Number.isFinite(o[k]) || o[k] < 0) e.push(taxText('Ange faktisk icke-negativ {field}.', { field: k })); };
  const assessmentOptions = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '' && v !== null && v !== undefined));
  const italianTax = {
    translate: taxText,
    translations,
    requiresTaxPlan: true,
    sourceTax: { language: 'groovy-cashle-plugin', provider: 'cashle.tax.it', source: 'italian-tax.cashle' },
    id: 'IT', label: 'Italien', currency: 'EUR', ruleYear: 2025, supportedBases: ['salary', 'capitalIncome'], propertyTax: propertyForm(),
    description: 'IRPEF 2025, heltidsårsboende vanlig anställd. Lön är brutto före faktiska arbetstagaravgifter. Ange faktisk INPS, region och kommun samt verifierade platta lokala skattesatser eller faktiska publicerade progressiva skalor för 2025. Skalorna ska beskriva marginalskatt med eventuellt fullständigt kommunalt inkomstundantag; särskilda lokala avdrag och andra undantag ingår inte. Pension, särskilda inflyttarregler och hushållsavdrag ingår inte. 2026 års 33 %-skikt ingår inte i denna uttryckliga 2025-utgåva.',
    source: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2024-12-30;207',
    defaultOptions: { ruleYear: 2025, residency: '', initialState: {}, region: '', municipality: '', localTaxMethod: 'flat', regionalRate: null, municipalRate: null, municipalExemption: 0, flatLocalRatesConfirmed: false, regionalSchedule: [], municipalSchedule: [], localSchedulesConfirmed: false, employmentProfile: 'resolved-inps', employmentContract: '', employeeSocialContributions: null, employmentDays: 365, payrollSupplementResolved: false, settlementDate: '' },
    fields: [
      ...commonFields, text('region', 'Faktisk region'), text('municipality', 'Faktisk kommun'),
      c('localTaxMethod', 'Lokala skatteregler', [['flat', 'Verifierade platta skattesatser'], ['progressive-schedules', 'Faktiska publicerade progressiva skalor']]),
      n('regionalRate', 'Verifierad platt regional skattesats', { percent: true, when: o => (o.localTaxMethod ?? 'flat') === 'flat' }),
      n('municipalRate', 'Verifierad platt kommunal skattesats', { percent: true, when: o => (o.localTaxMethod ?? 'flat') === 'flat' }),
      { ...check('flatLocalRatesConfirmed', 'Jag har verifierat att angivna lokala skattesatser är platta och rätt för min region/kommun'), when: o => (o.localTaxMethod ?? 'flat') === 'flat' },
      { key: 'regionalSchedule', label: 'Regionens faktiska publicerade progressiva skala (2025 års EUR)', kind: 'json', moneyKeys: ['upTo'], when: o => o.localTaxMethod === 'progressive-schedules', help: 'JSON-lista med upTo (övre inkomstgräns i 2025 års EUR) och rate (decimal skattesats). Gränserna ska stiga; sista raden ska endast ha rate. Ange den faktiska publicerade skalan för din region. Regelgränserna räknas inte upp med inflation.' },
      { key: 'municipalSchedule', label: 'Kommunens faktiska publicerade progressiva skala (2025 års EUR)', kind: 'json', moneyKeys: ['upTo'], when: o => o.localTaxMethod === 'progressive-schedules', help: 'Samma marginalskatteformat som regionen; sista raden ska endast ha rate. En faktiskt platt kommunalskatt kan anges som en enda rad med rate. Inga förvalda eller uppskattade skalor.' },
      { ...check('localSchedulesConfirmed', 'Jag har verifierat båda publicerade 2025-skalorna och kommunens fullständiga inkomstundantag för min region/kommun; inga andra lokala undantag eller avdrag gäller'), when: o => o.localTaxMethod === 'progressive-schedules' },
      n('municipalExemption', 'Kommunalt fullständigt inkomstundantag (2025 års EUR)', { money: true, help: 'Lagstadgad lokal gräns i regelårets penningvärde. Över gränsen beskattas hela inkomsten enligt vald kommunalskatt. Ange inte ett inflationsuppräknat framtida belopp.' }),
      c('employmentProfile', 'INPS-profil', [['resolved-inps', 'Faktiska årsavgifter från lönespecifikation']]), c('employmentContract', 'Faktisk anställningsform', [['', 'Välj'], ['indefinite', 'Tillsvidare'], ['fixed-term', 'Tidsbegränsad']]), n('employeeSocialContributions', 'Faktiska avdragsgilla arbetstagaravgifter per år (EUR)', { money: true }), n('employmentDays', 'Anställningsdagar (1–365)', { max: 365, integer: true }), check('payrollSupplementResolved', 'Vid nettoinkomst 15 000–28 000 EUR: verifierat att ingen ytterligare avdragsberoende trattamento integrativo gäller'),
    ],
    validate(o) {
      const e = base(o);
      if (!['indefinite', 'fixed-term'].includes(o.employmentContract)) e.push(taxText('Ange faktisk anställningsform.'));
      if (typeof o.region !== 'string' || !o.region.trim() || typeof o.municipality !== 'string' || !o.municipality.trim()) e.push(taxText('Ange faktisk region och kommun.'));
      const method = o.localTaxMethod ?? 'flat';
      if (method === 'flat') {
        if (o.flatLocalRatesConfirmed !== true) e.push(taxText('Verifiera platta lokala skatteregler.'));
        for (const k of ['regionalRate', 'municipalRate']) { amount(o, k, e); if (o[k] > 1) e.push(taxText('Skattesatser ska vara mellan 0 och 100 %.')); }
      } else if (method === 'progressive-schedules') {
        if (o.localSchedulesConfirmed !== true) e.push(taxText('Verifiera båda faktiska publicerade lokala skalorna för 2025 och tillämpligt kommunalt inkomstundantag.'));
        for (const key of ['regionalSchedule', 'municipalSchedule']) {
          const rows = o[key];
          if (!Array.isArray(rows) || !rows.length || rows.some((r, i) => !r || typeof r !== 'object' || Array.isArray(r) || Object.keys(r).some(k => !['upTo', 'rate'].includes(k)) || !Number.isFinite(r.rate) || r.rate < 0 || r.rate > 1 || (i < rows.length - 1 ? !Number.isFinite(r.upTo) || r.upTo <= (rows[i - 1]?.upTo ?? 0) : Object.hasOwn(r, 'upTo')))) e.push(taxText('Ange faktisk publicerad {field} med stigande gränser och obegränsad sista rad.', { field: key }));
        }
      } else e.push(taxText('Välj stödd metod för lokala skatteregler.'));
      for (const k of ['employeeSocialContributions', 'municipalExemption']) amount(o, k, e);
      return e;
    }, assessmentOptions,
  };
  return { taxes: [italianTax] };
}
