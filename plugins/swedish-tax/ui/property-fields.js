// Provider-owned supplemental property facts. Prices and the final acquisition
// basis come from the asset ledger, not a second set of form amounts.
const number = (key, label, value = 0, extra = {}) => ({ key, label, kind: 'number', default: value, min: 0, ...extra });
const choice = (key, label, options, value, extra = {}) => ({ key, label, kind: 'select', options, default: value, ...extra });
const check = (key, label, extra = {}) => ({ key, label, kind: 'check', default: false, ...extra });
const date = (key, label, extra = {}) => ({ key, label, kind: 'date', default: '', ...extra });
const property = (key, label, extra = {}) => ({ key, label, kind: 'property-reference', default: '', ...extra });
const selectedDeferral = data => ['final', 'provisional'].includes(data.deferralStatus);
const deferring = data => selectedDeferral(data) && (data.requestMaximumDeferral !== false || data.requestedDeferral > 0);
const finalDeferral = data => deferring(data) && data.deferralStatus === 'final';
const voluntary = (data, context) => context?.propertyOwner === 'joint'
  ? data.previousDeferralSelf > 0 || data.previousDeferralPartner > 0
  : data.previousDeferral > 0;
const hasSale = (_data, context) => context?.propertySale !== false;
const historicalReconciliation = (data,context) => hasSale(data,context) && /^\d{4}-/.test(data.contractDate??'') && /^\d{4}-/.test(context?.plan?.from??'') && Number(data.contractDate.slice(0,4))+1<Number(context.plan.from.slice(0,4));
const historicalOutcomes=[['','Välj tidigare prövning'],['none','Inget preliminärt uppskov'],['reinstated','Preliminärt uppskov återfördes helt'],['final','Preliminärt uppskov blev slutligt']];
const noticeFields = (datesKey, label, amountsKey, amountsLabel, when) => [
  { key: datesKey, label, kind: 'dates', default: [], required: false, when, wide: true, help: 'Ange faktiska eller planerade förfallodatum när årsavstämningen kräver betalning eller återbetalning. Vid noll saldo behövs inget datum. Ett datum per rad (ÅÅÅÅ-MM-DD), i stigande ordning utan dubbletter.' },
  { key: amountsKey, label: amountsLabel, kind: 'numbers', money: true, default: [], datesKey, when, wide: true, help: 'Ange ett nominellt belopp i landets valuta per rad, i samma ordning som datumen. Negativa belopp avser återbetalning. Vid flera datum krävs belopp för varje datum, utom Norges två lika lagstadgade delbetalningar.' },
];
const forecastNotice = (key,label,when) => check(key,label,{when,required:false,help:'Valfritt prognosantagande, inte en fastställd förfallodag. Faktiska angivna betalningsdatum gäller i första hand. Datumet behövs endast om årsavstämningen inte är noll.'});
const common = (propertyTypes,individualNotices=false) => [
  choice('propertyType', 'Bostadstyp enligt skattereglerna', propertyTypes, propertyTypes[0][0]),
  number('ownershipShare', 'Laglig ägarandel (för beloppsgränser)' , 1, { min: 0, exclusiveMin: true, max: 1, help: 'Belopp avser postens ägare; gemensamma belopp delas lika mellan de vuxna. Ägarandelen används för lagens beloppsgränser.' }),
  date('contractDate', 'Bindande köpekontrakt undertecknat', { when: hasSale, help: 'Lämna tomt för samma datum som Försäljning → Sälj vid. Likviddagen och kontraktsdagen kan vara olika.' }),
  ...noticeFields('paymentDueDates', 'Betalningsdatum enligt slutskattebesked', 'paymentAmounts', 'Betalningsbelopp enligt slutskattebesked', (data,context) => hasSale(data,context) && (!individualNotices || context?.propertyOwner !== 'joint')),
  ...(individualNotices ? [['Self','Ditt'],['Partner','Partnerns']].flatMap(([suffix,label]) => noticeFields(`paymentDueDates${suffix}`,`${label} betalningsdatum enligt slutskattebesked`,`paymentAmounts${suffix}`,`${label} betalningsbelopp enligt slutskattebesked`,(data,context) => hasSale(data,context) && context?.propertyOwner === 'joint')) : []),
];
const seFields = [
  ...common([['villa', 'Småhus / ägarlägenhet'], ['bostadsratt', 'Bostadsrätt']],true),
  forecastNotice('assumePaymentDate','Anta slutskattebetalning 12 november året efter försäljningens inkomstår',(data,context) => hasSale(data,context) && context?.propertyOwner !== 'joint'),
  ...[['Self','Din'],['Partner','Partnerns']].map(([suffix,label]) => forecastNotice(`assumePaymentDate${suffix}`,`${label} antagna slutskattebetalning 12 november året efter försäljningens inkomstår`,(data,context) => hasSale(data,context) && context?.propertyOwner === 'joint')),
  number('contractPrice', 'Avtalat försäljningspris', null, { money: true, unit: 'kr', exclusiveMin: true, when: (data, context) => hasSale(data, context) && !!data.contractDate && !!context?.plan?.from && data.contractDate < context.plan.from, help: 'Ange det nominella priset i det redan undertecknade kontraktet.' }),
  number('previousDeferral', 'Tidigare uppskjuten vinst (nominellt belopp)', 0, { money: true, unit: 'kr', when: (_data, context) => context?.propertyOwner !== 'joint', help: 'Uppskovet är uppskjuten vinst, inte skatten på vinsten. Ange det kvarvarande nominella beloppet.' }),
  number('previousDeferralSelf', 'Ditt tidigare uppskov', 0, { money: true, unit: 'kr', when: (_data, context) => context?.propertyOwner === 'joint', help: 'Ange ditt eget kvarvarande uppskovsbelopp på bostaden.' }),
  number('previousDeferralPartner', 'Partnerns tidigare uppskov', 0, { money: true, unit: 'kr', when: (_data, context) => context?.propertyOwner === 'joint', help: 'Ange partnerns eget kvarvarande uppskovsbelopp på bostaden.' }),
  choice('deferralStatus', 'Uppskov efter försäljningen', [['none', 'Inget nytt uppskov / återför tidigare uppskov'], ['final', 'Slutligt uppskov'], ['provisional', 'Preliminärt uppskov']], 'none', { when: (data,context) => context?.propertyOwner !== 'joint' && hasSale(data,context) }),
  choice('historicalProvisionalOutcome','Tidigare prövning av preliminärt uppskov',historicalOutcomes,'',{when:(data,context)=>context?.propertyOwner!=='joint' && historicalReconciliation(data,context),help:'Ange prövningens faktiska utfall.'}),
  check('requestMaximumDeferral', 'Begär högsta tillåtna uppskov', { default: true, when: (data, context) => context?.propertyOwner !== 'joint' && hasSale(data, context) && selectedDeferral(data), help: 'För ett kontrakt under föregående inkomstår: avmarkera och ange det faktiskt beviljade uppskovet.' }),
  check('deferralEligibilityConfirmed', 'Jag har verifierat villkoren för permanentbostad och ersättningsbostad i Sverige/EES', { help: 'Kontrollera faktisk bosättning: normalt minst ett sammanhängande år före kontraktet eller tre av de senaste fem åren. Vid tidigare köpt ersättningsbostad gäller en särskild prövning. Undantag för tvångsförsäljning och samhällsomvandling ingår inte.', when: (data, context) => context?.propertyOwner !== 'joint' && hasSale(data, context) && deferring(data), mustBeTrue: true }),
  number('requestedDeferral', 'Begärt eller beviljat uppskov (uppskjuten vinst)', 0, { unit: 'kr', when: (data, context) => context?.propertyOwner !== 'joint' && hasSale(data, context) && selectedDeferral(data) && !data.requestMaximumDeferral, help: 'Ange 0 för att avstå från ett nytt uppskov. För ett tidigare års kontrakt anges det faktiskt beviljade beloppet.' }),
  property('replacementHomeId', 'Ersättningsbostad i planen', { when: (data, context) => context?.propertyOwner !== 'joint' && hasSale(data, context) && deferring(data), requiredWhen: finalDeferral }),
  date('replacementPurchaseDate', 'Ersättningsbostadens bindande köpedatum', { when: (data, context) => context?.propertyOwner !== 'joint' && hasSale(data, context) && deferring(data), requiredWhen: finalDeferral }),
  date('replacementMoveInDate', 'Inflyttning i ersättningsbostaden', { when: (data, context) => context?.propertyOwner !== 'joint' && hasSale(data, context) && deferring(data), requiredWhen: finalDeferral }),
  ...noticeFields('reconciliationPaymentDueDates', 'Betalningsdatum efter prövning av preliminärt uppskov', 'reconciliationPaymentAmounts', 'Belopp efter prövning av preliminärt uppskov', (data, context) => context?.propertyOwner !== 'joint' && hasSale(data, context) && deferring(data) && data.deferralStatus === 'provisional'),
  forecastNotice('assumeReconciliationPaymentDate','Anta slutskattebetalning 12 november året efter uppskovets prövningsår',(data,context) => context?.propertyOwner !== 'joint' && hasSale(data,context) && deferring(data) && data.deferralStatus === 'provisional'),
  check('intentToReplace', 'Jag avser att skaffa en kvalificerad ersättningsbostad inom tidsfristen', { when: (data, context) => context?.propertyOwner !== 'joint' && hasSale(data, context) && deferring(data) && data.deferralStatus === 'provisional', mustBeTrue: true }),
  ...[['Self','Ditt'],['Partner','Partnerns']].flatMap(([suffix,label]) => {
    const key=name => `${name}${suffix}`;
    const feminine=suffix==='Self'?'Din':label, plural=suffix==='Self'?'Dina':label;
    const joint=(data,context) => context?.propertyOwner === 'joint' && hasSale(data,context);
    const selected=(data,context) => joint(data,context) && ['final','provisional'].includes(data[key('deferralStatus')]);
    const active=(data,context) => selected(data,context) && (data[key('requestMaximumDeferral')] !== false || data[key('requestedDeferral')] > 0);
    const final=(data,context) => active(data,context) && data[key('deferralStatus')]==='final';
    const provisional=(data,context) => active(data,context) && data[key('deferralStatus')]==='provisional';
    return [choice(key('deferralStatus'),`${label} uppskov efter försäljningen`,[['none','Inget nytt uppskov'],['final','Slutligt uppskov'],['provisional','Preliminärt uppskov']],'none',{when:joint}),
      choice(key('historicalProvisionalOutcome'),`${feminine} tidigare prövning av preliminärt uppskov`,historicalOutcomes,'',{when:(data,context)=>joint(data,context)&&historicalReconciliation(data,context),help:'Ange prövningens faktiska utfall.'}),
      check(key('requestMaximumDeferral'),`${label} högsta tillåtna uppskov`,{default:true,when:selected,help:'För ett kontrakt under föregående inkomstår: avmarkera och ange det faktiskt beviljade uppskovet.'}),
      check(key('deferralEligibilityConfirmed'),`${plural} villkor för uppskov är uppfyllda`,{when:active,mustBeTrue:true}),
      number(key('requestedDeferral'),`${label} begärda uppskov`,0,{unit:'kr',when:(data,context)=>selected(data,context)&&!data[key('requestMaximumDeferral')]}),
      property(key('replacementHomeId'),`${feminine} ersättningsbostad`,{when:active,requiredWhen:final}),
      date(key('replacementPurchaseDate'),`${label} köpedatum för ersättningsbostaden`,{when:active,requiredWhen:final}),
      date(key('replacementMoveInDate'),`${feminine} inflyttning i ersättningsbostaden`,{when:active,requiredWhen:final}),
      ...noticeFields(key('reconciliationPaymentDueDates'),`${label} betalningsdatum efter preliminärt uppskov`,key('reconciliationPaymentAmounts'),`${label} belopp efter preliminärt uppskov`,provisional),
      forecastNotice(key('assumeReconciliationPaymentDate'),`${feminine} antagna slutskattebetalning 12 november året efter uppskovets prövningsår`,provisional),
      check(key('intentToReplace'),`${feminine} avsikt att skaffa ersättningsbostad`,{when:provisional,mustBeTrue:true})];
  }),
  number('requestedReinstatement', 'Frivilligt återförd vinst (nominellt belopp)', 0, { unit: 'kr', when: (data, context) => context?.propertyOwner !== 'joint' && voluntary(data, context) }),
  date('reinstatementDate', 'Datum för frivillig återföring', { when: (data, context) => context?.propertyOwner !== 'joint' && voluntary(data, context), requiredWhen: data => data.requestedReinstatement > 0 }),
  ...noticeFields('reinstatementPaymentDueDates', 'Betalningsdatum för återföringens slutskatt', 'reinstatementPaymentAmounts', 'Belopp för återföringens slutskatt', (data, context) => context?.propertyOwner !== 'joint' && data.requestedReinstatement > 0),
  forecastNotice('assumeReinstatementPaymentDate','Anta slutskattebetalning 12 november året efter återföringens inkomstår',(data,context) => context?.propertyOwner !== 'joint' && data.requestedReinstatement > 0),
  ...[['Self', 'Ditt'], ['Partner', 'Partnerns']].flatMap(([suffix, possessive]) => {
    const amount=`requestedReinstatement${suffix}`, previous=`previousDeferral${suffix}`;
    const eligible=(data,context) => context?.propertyOwner === 'joint' && data[previous] > 0;
    const requested=(data,context) => eligible(data,context) && data[amount] > 0;
    return [number(amount, `${possessive} frivilligt återförda uppskov`, 0, {unit:'kr',when:eligible}),
      date(`reinstatementDate${suffix}`, `${possessive} datum för frivillig återföring`, {when:eligible,requiredWhen: data => data[amount] > 0}),
      ...noticeFields(`reinstatementPaymentDueDates${suffix}`, `${possessive} betalningsdatum för återföringens slutskatt`, `reinstatementPaymentAmounts${suffix}`, `${possessive} belopp för återföringens slutskatt`, requested),
      forecastNotice(`assumeReinstatementPaymentDate${suffix}`,`${suffix==='Self'?'Din':possessive} antagna slutskattebetalning 12 november året efter återföringens inkomstår`,requested)];
  }),
];
export function createSwedishPropertyTax(validateHistoricalSale) {
  return {
    fields: seFields,
    propertyTypeForHome: homeType => homeType,
    supportsHistoricalSales: true,
    usesOwnerSpecificDeferralInputs: true,
    validateHistoricalSale,
    help: 'Svensk privatbostad: kontraktsdatum styr försäljningsåret. Tillgångens anskaffningsvärde för skatt används som fullständigt avdragsgillt underlag. Lägg inte till samma kostnader en gång till.',
  };
}
