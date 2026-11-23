export function createPensionEditors({
  language, pensionText, wageDescriptor, tags, premiumReturnSchema, validatePremiumReturn, moneyFrequencies, SchemaFields,
  lockControls, fieldAccess, normalizeTime, agreementOptions, pensionAgreement, number, text, select, check, note,
  owner, account, pensionPlugins, pensionAssumptions, pensionDefaults, ongoingPublicStatement,
  ongoingLifetimeDcStatement, additionalSalaryCandidates, pensionSalaryCandidates, assumedEmploymentStart, schemaFromValue,
  enumSchema, objectSchema, timeSchema, sharedText, en,
}) {
  class HistoricalWages extends HTMLElement {
    #rows=[]; #context={modules:[]}; #statementDate='';
    #labels=[];
    #refresh=()=>{for(const [node,key,attribute] of this.#labels){if(attribute)node.setAttribute(attribute,pensionText(key));else node.textContent=pensionText(key);}};
    #label(node,key,attribute){this.#labels.push([node,key,attribute]);if(attribute)node.setAttribute(attribute,pensionText(key));else node.textContent=pensionText(key);}
    constructor(){super();this.attachShadow({mode:'open'});}
    connectedCallback(){this.#render();language.events.addEventListener('change',this.#refresh);}
    disconnectedCallback(){language.events.removeEventListener('change',this.#refresh);}
    set caseContext(value){this.#context=value??{modules:[]};if(this.isConnected)this.#render();}
    set statementDate(value){if(this.#statementDate!==value){this.#statementDate=value;if(this.isConnected)this.#render();}}
    set value(value){const next=Array.isArray(value)?structuredClone(value):[];if(JSON.stringify(next)!==JSON.stringify(this.#rows)){this.#rows=next;if(this.isConnected)this.#render();}}
    get value(){return structuredClone(this.#rows);}
    #emit(){this.dispatchEvent(new Event('input',{bubbles:true,composed:true}));this.dispatchEvent(new Event('change',{bubbles:true,composed:true}));}
    #render(){
      const root=this.shadowRoot;root.replaceChildren();this.#labels=[];
      const style=document.createElement('style');style.textContent=':host{display:block;font:inherit}fieldset{border:1px solid #cbd5e1;border-radius:12px;padding:12px;margin:8px 0}label{display:block;margin:8px 0;font-size:.9em}input,select,button{display:block;box-sizing:border-box;margin-top:4px;padding:8px;border:1px solid #94a3b8;border-radius:7px;width:100%;background:transparent;color:inherit;font:inherit}button{width:auto;cursor:pointer}';root.append(style);
      const heading=document.createElement('strong');this.#label(heading,'Avstämning av löner i pensionsbeskedet');root.append(heading);
      const incomes=(this.#context.modules??[]).flatMap(entry=>{
        const wage=entry.enabled===false ? null : wageDescriptor(entry,this.#context);
        return wage ? [{entry,wage}] : [];
      });
      this.#rows.forEach((row,index)=>{
        const group=document.createElement('fieldset');root.append(group);
        const add=(label,key,control)=>{const wrap=document.createElement('label');const title=document.createElement('span');this.#label(title,label);wrap.append(title);this.#label(control,label,'aria-label');wrap.append(control);group.append(wrap);control.addEventListener('input',event=>{event.stopPropagation();row[key]=['openingEventIncluded','statementDayIncluded'].includes(key)?(control.value==='true'?true:control.value==='false'?false:null):control.value;if(key==='incomeId')this.#render();this.#emit();});control.addEventListener('change',event=>event.stopPropagation());};
        const income=document.createElement('select'),placeholder=new Option('','');this.#label(placeholder,'Välj inkomst');income.add(placeholder);for(const {entry} of incomes)income.add(new Option(entry.data?.name??entry.type,entry.id));
        if(row.incomeId&&!incomes.some(item=>item.entry.id===row.incomeId))income.add(new Option(row.incomeId,row.incomeId));income.value=row.incomeId??'';add('Inkomst','incomeId',income);
        const selected=incomes.find(item=>item.entry.id===row.incomeId),once=selected?.wage.kind!=='hourly' && selected?.wage.data.frequency==='once',earlier=this.#statementDate!==this.#context.plan?.from;
        if(earlier && !once) for(const [label,key] of [['Tidigare utbetalningsdag','paymentAnchor'],['Sista historiska dag att räkna','lastReplayDate']]){const field=document.createElement('input');field.type='date';field.value=row[key]??'';add(label,key,field);}
        for(const [label,key] of [...(earlier?[['Ingår en eventuell utbetalning på beskedsdagen redan i beskedet?','statementDayIncluded']]:[]),...(!earlier || !once?[['Ingår startperiodens premie redan i beskedet?','openingEventIncluded']]:[])]){const included=document.createElement('select');for(const [key,value] of [['Välj ja eller nej',''],['Ja','true'],['Nej','false']]){const option=new Option('',value);this.#label(option,key);included.add(option);}included.value=typeof row[key]==='boolean'?String(row[key]):'';add(label,key,included);}
        const remove=document.createElement('button');remove.type='button';this.#label(remove,'Ta bort');remove.addEventListener('click',()=>{this.#rows.splice(index,1);this.#render();this.#emit();});group.append(remove);
      });
      const addButton=document.createElement('button');addButton.type='button';this.#label(addButton,'Lägg till inkomst');addButton.addEventListener('click',()=>{this.#rows.push({incomeId:'',paymentAnchor:'',lastReplayDate:'',statementDayIncluded:null,openingEventIncluded:null});this.#render();this.#emit();});root.append(addButton);
    }
  }
  customElements.define(tags.wages, HistoricalWages);

  const translate = text => Object.hasOwn(en, text) ? pensionText(text) : sharedText(text);
  const only = (kind) => (d) => d.kind === kind;
  function linkedPensionBasis(data, context) {
    if (data.linkedInputMode !== 'statement') return 'estimate';
    const dateEntered = data.statementDate && data.statementDate !== context?.plan?.from
      && data.statementDate !== pensionDefaults(data.kind).statementDate;
    const statementEntered = data.kind === 'db'
      ? Number.isFinite(data.annualBenefit) || data.serviceYears > 0
      : Number.isFinite(data.capital) || Number.isFinite(data.ongoingDcMonthly) || data.priorSalaryConfirmed
        || data.openingPendingAkapPremium > 0 || data.historicalWageEvents?.some(row => row.incomeId);
    return dateEntered || statementEntered ? 'statement' : 'estimate';
  }

  function pensionFields(salaries = [], context = () => undefined) {
    return [
      text('name', 'Pensionens namn'),
      owner(),
      check('includeIncomePensionInNetWorth', 'Visa inkomstpension i nettoförmögenhet', false, { when: only('public'), help: 'Påverkar redovisningen av nettoförmögenhet, inte pensionsutbetalningen eller arv.' }),
      check('includePremiumPensionInNetWorth', 'Visa premiepension i nettoförmögenhet', true, { when: only('public'), help: 'Påverkar redovisningen av nettoförmögenhet, inte pensionsutbetalningen eller arv.' }),
      check('includeOccupationalPensionInNetWorth', 'Visa tjänstepensionskapital i nettoförmögenhet', true, { when: only('dc'), help: 'Påverkar redovisningen av nettoförmögenhet, inte pensionsutbetalningen eller arv.' }),
      select('salaryId', 'Kopplad lön för intjänande', [
        ['', 'Fribrev – ange eget besked'],
        ...salaries.map((e) => [e.id, e.data.name]),
      ], '', { when: d => d.kind !== 'public', optionsFor: (d, context) => [['', 'Fribrev – ange eget besked'], ...pensionSalaryCandidates(context).map(e => [e.id, e.data.name])], relatedCreate: {
        type: 'cashlab.salary', label: 'Lägg till lön…',
        defaultsFor: data => ({ owner: data.owner }),
        parentPatch: data => ({ inputMode: linkedPensionBasis(data, context()) }),
      } }),
      { key: 'additionalSalaryIds', kind: 'references', label: 'Ytterligare pensionsgrundande löneposter från samma anställning', default: [], types: [], wide: true, preserveWhenInactive: true, referenceOptions: additionalSalaryCandidates, when: (d, context) => additionalSalaryCandidates(d, context).length > 0, help: 'Välj bara löneposter som hör till samma anställning, till exempel pensionsgrundande bonus. Löner från andra anställningar ska ha egna pensionsavtal.' },
      note('Allmän pension använder automatiskt personens samtliga aktiva pensionsgrundande inkomster före skatt, inklusive arbetsinkomst och aktiv näringsinkomst. Kapitalinkomst och redan utbetald pension ger inget nytt intjänande.', { when: only('public') }),
      select(
        'scheme',
        'Pensionsavtal',
        agreementOptions(),
        agreementOptions('dc')[0]?.[0] ?? '',
        { when: d => d.kind !== 'public', optionsFor: (d, model) => agreementOptions(d.kind, model) },
      ),
      {
        key: 'employmentStartDate',
        kind: 'date',
        label: 'Anställningsdatum för AKAP-KR',
        default: '',
        when: (d, model) => pensionAgreement(d, model)?.needsEmploymentStart === true,
        help: 'Avtalsanslutning förutsätter att anställningen började före 69 års ålder.',
      },
      select('inputMode', 'Underlag', [
        ['estimate', 'Schablon (uppskattning)'],
        ['statement', 'Eget daterat pensionsbesked'],
      ], 'estimate', { preserveWhenInactive: true, when: d => d.kind === 'public' || Boolean(d.salaryId) }),
      {
        key: 'statementDate',
        label: 'Värderingsdatum / schablonens datum',
        kind: 'date',
        when: d => d.inputMode === 'statement',
        default: new Date().toISOString().slice(0, 10),
        help: 'Nominella belopp på datumet, senast planstart. Vid pågående allmän pension ange aktuella månadsbelopp och kvarvarande rättigheter.',
      },
      {
        key: 'historicalWageEvents', kind: 'custom', controlElement: tags.wages, default: [], wide: true,
        updateControl(control, { model, data }) {
          control.caseContext = model;
          control.statementDate = data.statementDate;
        },
        label: 'Avstämning av löner i pensionsbeskedet',
        when: d => d.inputMode === 'statement' && d.kind !== 'db',
        help: 'Ange om inkomst som infaller på beskedsdagen redan ingår i beskedet. För äldre besked anges även tidigare utbetalningsdag, hur långt historiken ska räknas och om startperiodens premie ingår.',
      },
      check(
        'priorSalaryConfirmed',
        'Jag känner pensionsgrundande bruttolön före beskedet i samma intjänandeperiod',
        false,
        { when: (d) => d.inputMode === 'statement' && d.kind !== 'db' },
      ),
      number(
        'priorSalary',
        'Pensionsgrundande bruttolön före beskedsdatum i samma period',
        0,
        {
          unit: 'kr',
          when: (d) =>
            d.inputMode === 'statement' &&
            d.kind !== 'db' &&
            d.priorSalaryConfirmed,
          help: 'Kalenderåret före beskedsdatum för allmän pension; pågående halvår för AKAP-KR; pågående månad för övrig tjänstepension. Beloppet krediteras inte som nya pensionsrätter.',
        },
      ),
      number('incomeCapital', 'Inkomstpensionens pensionsbehållning', 0, {
        when: (d) => d.inputMode === 'statement' && d.kind === 'public',
        unit: 'kr',
        help: 'Vid pågående uttag: ange enbart inkomstpensionsrätter som ännu inte har tagits ut.',
      }),
      number('premiumCapital', 'Premiepensionskapital', 0, {
        when: (d) => d.inputMode === 'statement' && d.kind === 'public',
        unit: 'kr',
      }),
      note('Ange rättigheter som tjänats in före beskedsdatum men ännu inte ingår i utbetalningen. Ange varje inkomstår separat. Premiebeloppet är det faktiska eller antagna belopp som krediteras, inklusive eventuell ränta före placering.', { when: d => d.inputMode==='statement' && d.kind==='public' }),
      ...[1,2].flatMap(row => [
        number(`openingPendingYear${row}`, row===1?'Inkomstår för ingående rätt 1':'Inkomstår för ingående rätt 2', 0, { when: d => d.inputMode==='statement' && d.kind==='public', min: 0, max: 9997, help: 'Ange rättigheter som tjänats in före beskedsdatum men ännu inte ingår i utbetalningen. Ange 0 om ingen rätt anges. Premiebeloppet är det faktiska eller antagna belopp som krediteras, inklusive eventuell ränta före placering. Om premien ännu inte krediterats antar prognosen placering den 31 december året efter inkomståret.' }),
        number(`openingPendingIncome${row}`, row===1?'Inkomstpensionsrätt 1':'Inkomstpensionsrätt 2', 0, { when: d => d.inputMode==='statement' && d.kind==='public' && d[`openingPendingYear${row}`]>=1800, unit: 'kr', min: 0 }),
        number(`openingPendingPremium${row}`, row===1?'Premiepensionsrätt 1':'Premiepensionsrätt 2', 0, { when: d => d.inputMode==='statement' && d.kind==='public' && d[`openingPendingYear${row}`]>=1800, unit: 'kr', min: 0 }),
        check(`openingPendingPremiumCredited${row}`, row===1?'Premiepensionsrätt 1 ingår redan i kapitalet':'Premiepensionsrätt 2 ingår redan i kapitalet', false, { when: d => d.inputMode==='statement' && d.kind==='public' && d[`openingPendingPremium${row}`]>0, help: 'Markera bara om beloppet redan ingår i premiepensionskapitalet enligt beskedet men ännu inte i utbetalningen.' }),
      ]),
      number('unclaimedPremiumCapital', 'Premiepensionskapital som ännu inte tas ut', null, {
        when: ongoingPublicStatement, unit: 'kr', preserveWhenInactive: true,
        help: 'Ange den del av det totala premiepensionskapitalet som inte ingår i pågående uttag. Ange 0 vid fullt uttag.',
      }),
      number('ongoingIncomeMonthly', 'Pågående inkomstpension före skatt', null, {
        when: ongoingPublicStatement, unit: 'kr/mån', preserveWhenInactive: true,
        help: 'Aktuellt månadsbelopp enligt beslutet. Ange 0 om ingen inkomstpension betalas ut. Därefter följsamhetsindexeras beloppet med antagen inkomstindexförändring och normen 1,6 procent.',
      }),
      number('ongoingPremiumMonthly', 'Pågående premiepension före skatt', null, {
        when: ongoingPublicStatement, unit: 'kr/mån', preserveWhenInactive: true,
        help: 'Aktuellt månadsbelopp enligt beslutet. Ange 0 om ingen premiepension betalas ut.',
      }),
      number('ongoingDcMonthly', 'Pågående tjänstepension före skatt', null, {
        when: ongoingLifetimeDcStatement, unit: 'kr/mån', preserveWhenInactive: true,
        help: 'Ange aktuellt livsvarigt månadsbelopp enligt försäkringsbolagets besked. Prognosen använder beloppet direkt och beräknar inte om det från pensionskapitalet.',
      }),
      number('ongoingDcPaymentGrowth', 'Antagen årlig förändring av tjänstepensionen', 0, {
        when: ongoingLifetimeDcStatement, min: -99.99, max: 100, unit: '%/år', preserveWhenInactive: true,
        help: 'Ett eget antagande för framtida utbetalningar; 0 betyder oförändrat belopp. Bolagets garantier, återbäring och ändrade livslängdsantaganden beräknas inte.',
      }),
      number('premiumDivisionYears', 'Premiepensionens individuella delningstal', 0, {
        when: only('public'), min: 0, unit: 'år', preserveWhenInactive: true,
        help: 'Ange delningstalet från Pensionsmyndigheten. För pension som inte startat betyder 0 att den gemensamma delningstiden används. Prognosen använder samma tal även kommande år; åldersberoende ändringar, arvsvinster och traditionell försäkrings garanti ingår inte.',
      }),
      number('capital', 'Pensionskapital enligt besked', null, {
        when: (d) => d.inputMode === 'statement' && d.kind === 'dc',
        unit: 'kr',
        help: 'Ange kvarvarande kapital på beskedsdatumet. Vid pågående tidsbestämt uttag beräknas framtida utbetalningar över återstående tid som en prognos.',
      }),
      number('openingPendingAkapPremium', 'Intjänad ännu obetald AKAP-KR-premie', 0, {
        when: (d, model) => d.inputMode === 'statement' && pensionAgreement(d, model)?.pendingPremiumKey === 'openingPendingAkapPremium',
        unit: 'kr', min: 0, preserveWhenInactive: true,
        help: 'Ange intjänad premie som inte ingår i beskedets kapital. Prognosen redovisar den separat och antar att den betalas in vid kvartalets slut.',
      }),
      number(
        'annualBenefit',
        'Redan intjänad ITP2-förmån vid beskedsdatum',
        null,
        {
          when: (d) => d.inputMode === 'statement' && d.kind === 'db',
          unit: 'kr',
          frequencyKey: 'annualBenefitFrequency',
          help: 'Ange intjänad rätt i vald tidsenhet eller aktuell förmån vid pågående uttag, inte en framtida prognos. ITPK läggs till separat som premiebestämd pension.',
        },
      ),
      select('annualBenefitFrequency', 'Förmånens tidsenhet', moneyFrequencies.filter(([id]) => ['monthly', 'yearly'].includes(id)), 'monthly', { when: d => d.inputMode === 'statement' && d.kind === 'db' }),
      number('serviceYears', 'Tidigare ITP2-tjänstetid vid besked', 0, {
        when: (d) => d.kind === 'db' && d.inputMode === 'statement',
        max: 30,
        unit: 'år',
      }),
      number('payoutAge', 'Ålder då uttag börjar', 65, {
        integer: true,
        min: 0,
        max: 125,
        when: only('db'),
      }),
      { key: 'payoutStart', kind: 'time', label: 'Uttaget börjar', default: { reference: 'age', age: 67, offset: 0, personId: 'self' }, choices: ['age', 'now', 'date', 'retirement', 'life', 'independence', 'end'], when: d => d.kind !== 'db', wide: false },
      select(
        'payoutFraction',
        'Ordinarie uttagsandel',
        [
          [25, '25 %'],
          [50, '50 %'],
          [75, '75 %'],
          [100, '100 %'],
        ],
        100,
        { when: only('public') },
      ),
      select(
        'duration',
        'Utbetalningstid',
        [
          [0, 'Livsvarigt'],
          [5, '5 år'],
          [10, '10 år'],
          [15, '15 år'],
          [20, '20 år'],
        ],
        0,
        { when: d => ['dc', 'db'].includes(d.kind), resets: ['continuePremiums','continueAfterPayout'] },
      ),
      check('continuePremiums', 'Fortsätt tjäna in till pensionen under uttag', false, {
        when: d => d.kind === 'dc' && Boolean(d.salaryId),
        resets: ['continueAfterPayout'],
        help: 'Välj endast om din försäkring tillåter fortsatta premier under uttag. Vid tidsbestämt uttag fördelas premier över återstående utbetalningstid. Vid livsvarigt uttag omvandlas varje premie med den gemensamma antagna delningstiden.',
      }),
      check('continueAfterPayout','Fortsätt tjäna in efter utbetalningstidens slut',false,{when:d=>d.kind==='dc' && d.duration>0 && Boolean(d.salaryId) && d.continuePremiums===true,help:'Välj endast om premier faktiskt fortsätter enligt avtalet. De blir outbetalat pensionskapital; någon ny utbetalning startas inte automatiskt.'}),
      check('continueAfter69','Medgivande till fortsatt PA 16-intjänande efter 69 år',false,{when:(d, model)=>pensionAgreement(d, model)?.continueAfter69 === true && Boolean(d.salaryId),help:'Välj endast om arbetsgivaren har medgett fortsatt pensionsrätt efter 69 år. Intjänande under ett pågående uttag kräver även det separata valet för fortsatt intjänande under uttag.'}),
      { key: 'premiumYield', kind: 'yield', label: 'Premiepensionens avkastning', default: pensionDefaults('public').premiumYield, wide: true, hidePassiveIncome: true, assumptionHelp: 'Avkastningen stannar i pensionskapitalet. Ange samma slags avkastningsantagande som för värdepapper.', compact: true, when: only('public') },
      number('growthRate', 'Antagen nominell avkastning', 3, {
        fixedYield: true,
        min: -99,
        max: 100,
        unit: '%/år',
        when: only('dc'),
      }),
      number('incomeIndex', 'Antagen förändring av inkomst- eller balansindex', 2, {
        min: -99,
        max: 100,
        unit: '%/år',
        when: only('public'),
        help: 'Ange antagen förändring av det index som ska tillämpas. Automatisk balansering modelleras inte; vid balansering anger du själv antagen förändring av balansindex.',
      }),
      note(
        'Allmän pension består av inkomstpension och premiepension. Tjänstepension kommer från jobbet. ITP1 fördelas här 50/50 mellan traditionell och valbar del, med en enda total premie. ITP2 är förmånsdelen; lägg ITPK separat. PA16 Avdelning I/II omfattar valbar del, Kåpan Tjänste och Kåpan Flex; PA16-II:s förmånsdel ingår inte. PA16:s gemensamma uttag använder minst 63 år och minst 10 års utbetalning; enskilda delar kan ha tidigare eller kortare villkor.',
      ),
      note(
        'Pensionskapitalet är bundet och kan inte betala räkningar eller överföringar.',
      ),
      note(pensionAssumptions),
      { key: 'notes', kind: 'notes', label: 'Anteckningar', default: '' },
    ];
  }
  const publicExcluded = new Set(['salaryId', 'additionalSalaryIds', 'scheme', 'payoutAge', 'duration', 'continuePremiums', 'continueAfterPayout', 'continueAfter69', 'growthRate', 'baseGrowth', 'divisor', 'destinationMode', 'destinationAccount', 'capital', 'annualBenefit', 'annualBenefitFrequency', 'serviceYears', 'employmentStartDate', 'ongoingDcMonthly', 'ongoingDcPaymentGrowth']);
  const payoutKeys = new Set(['payoutStart', 'payoutFraction', 'duration']);
  const payoutStatementKeys = new Set(['unclaimedPremiumCapital', 'ongoingIncomeMonthly', 'ongoingPremiumMonthly', 'premiumDivisionYears', 'ongoingDcMonthly', 'ongoingDcPaymentGrowth']);
  function pensionEditorFields(kind, salaries = [], context) {
    const fields = pensionFields(salaries, context).filter(field => !['message', 'note'].includes(field.kind)).map(field => ({ ...field, help: field.key === 'statementDate' && kind === 'public' ? 'Ange ett besked med fastställda rättigheter. Ange tidigare intjänade rättigheter som ännu inte ingår i utbetalningen separat.' : field.key?.startsWith('openingPending') || ['additionalSalaryIds', 'historicalWageEvents', 'incomeCapital', 'incomeIndex', 'unclaimedPremiumCapital', 'ongoingIncomeMonthly', 'ongoingPremiumMonthly', 'premiumDivisionYears', 'ongoingDcMonthly', 'ongoingDcPaymentGrowth', 'continuePremiums', 'continueAfterPayout', 'continueAfter69'].includes(field.key) ? field.help : undefined }));
    if (kind === 'public') return fields.filter(field => !publicExcluded.has(field.key));
    if (kind === 'dc') return fields.filter(field => !['payoutAge', 'incomeCapital', 'premiumCapital', 'premiumYield', 'incomeIndex', 'payoutFraction', 'annualBenefit', 'annualBenefitFrequency', 'serviceYears'].includes(field.key));
    if (kind === 'db') return fields.filter(field => !['additionalSalaryIds', 'capital', 'incomeCapital', 'premiumCapital', 'premiumYield', 'incomeIndex', 'growthRate', 'payoutStart', 'payoutFraction', 'priorSalary', 'priorSalaryConfirmed', 'employmentStartDate', 'continuePremiums', 'continueAfterPayout', 'continueAfter69'].includes(field.key));
    return fields;
  }
  class PensionFields extends SchemaFields {
    #inline; #details; #payout; #context; #kind; #steps; #periodsEdited = false; #access; #base; #invalidSalaryNotice; #salaryId = ''; #linkedBasis; #automaticEmployment = false; #lastEmployment = '';
    constructor(inline = false, details = false, payout = false) { super(); this.#inline = inline; this.#details = details; this.#payout = payout; this.addEventListener('editor-input', () => this.#syncInvalidSalaries()); for (const type of ['input', 'change']) this.shadowRoot.addEventListener(type, event => this.#chooseInitialBasis(event), true); }
    #chooseInitialBasis(event) {
      if (this.#payout || !['dc', 'db'].includes(this.#kind) || !this.#base) return;
      const label = event.target.getAttribute('aria-label');
      if (label === translate('Anställningsdatum för AKAP-KR')) { this.#automaticEmployment = false; return; }
      if (event.target.tagName !== 'SELECT') return;
      if (this.#kind === 'dc' && this.#automaticEmployment && [translate('Person / ägare'), translate('Pensionsavtal')].includes(label)) {
        const draft = super.readDraft(this.#base);
        if (pensionAgreement(draft, this.#context)?.needsEmploymentStart) {
          const date = [...this.shadowRoot.querySelectorAll('input')].find(input => input.getAttribute('aria-label') === translate('Anställningsdatum för AKAP-KR'));
          if (date) date.value = this.#lastEmployment = assumedEmploymentStart(draft.owner, this.#context);
        }
      }
      if (label === translate('Underlag')) { this.#linkedBasis = event.target.value; return; }
      if (label !== translate('Kopplad lön för intjänande') || event.target.value === '__related_create__') return;
      if (this.#salaryId === event.target.value) return;
      this.#salaryId = event.target.value;
      const mode = this.shadowRoot.querySelector('[data-field-key="inputMode"] select');
      if (mode) mode.value = this.#salaryId ? linkedPensionBasis(this.readDraft(this.#base), this.#context) : 'statement';
    }
    #configure(kind) {
      this.#kind = kind;
      let fields=pensionEditorFields(kind, pensionSalaryCandidates(this.#context), () => this.#context);
      if (this.#payout) {
        fields = fields.filter(field => this.#details
          ? field.key === 'payoutFraction'
          : field.key !== 'payoutFraction' && (field.key === 'name' || payoutKeys.has(field.key) || payoutStatementKeys.has(field.key)));
        fields = fields.map(field => field.key === 'premiumDivisionYears'
          ? { ...field, when: ongoingPublicStatement }
          : field);
        this.configuration = { fields, translate };
        super.caseContext = this.#context;
        return;
      }
      if (kind !== 'db') fields = fields.filter(field => !payoutKeys.has(field.key));
      const fullFields = fields;
      if (this.#inline || this.#details) {
        const basic = new Set(['name', 'owner', 'salaryId', 'scheme', 'employmentStartDate', 'inputMode', 'payoutAge', 'payoutStart', 'payoutFraction', 'duration']);
        const statement = new Set(['statementDate', 'historicalWageEvents', 'priorSalaryConfirmed', 'priorSalary', 'incomeCapital', 'premiumCapital', 'openingPendingYear1', 'openingPendingIncome1', 'openingPendingPremium1', 'openingPendingPremiumCredited1', 'openingPendingYear2', 'openingPendingIncome2', 'openingPendingPremium2', 'openingPendingPremiumCredited2', 'unclaimedPremiumCapital', 'ongoingIncomeMonthly', 'ongoingPremiumMonthly', 'ongoingDcMonthly', 'ongoingDcPaymentGrowth', 'capital', 'openingPendingAkapPremium', 'annualBenefit', 'annualBenefitFrequency', 'serviceYears']);
        fields = fields.filter(field => basic.has(field.key) || statement.has(field.key) || ['growthRate', 'incomeIndex', 'premiumYield', 'premiumDivisionYears', 'continuePremiums', 'continueAfterPayout', 'continueAfter69'].includes(field.key));
        fields = fields.map(field => {
          const when = field.when;
          if (statement.has(field.key)) return { ...field, when: (data, context) => data.inputMode === 'statement' && (!when || when(data, context)) };
          if (['growthRate', 'incomeIndex'].includes(field.key)) return { ...field, when: (data, context) => (!Number.isFinite(data[field.key]) || data[field.key] <= -100 || data[field.key] > 100) && (!when || when(data, context)) };
          if (field.key === 'premiumYield') return { ...field, when: data => validatePremiumReturn(data.premiumYield).length > 0 };
          if (field.key === 'premiumDivisionYears') return { ...field, when: data => data.kind === 'public' && ((!Number.isFinite(data.premiumDivisionYears) || data.premiumDivisionYears < 0) || (ongoingPublicStatement(data) && data.ongoingPremiumMonthly > 0 && data.premiumDivisionYears <= 0)) };
          if (field.key === 'continuePremiums') return { ...field, when: data => data.continuePremiums === true && !data.salaryId };
          if (field.key === 'continueAfterPayout') return { ...field, when: data => data.continueAfterPayout === true && (!data.salaryId || data.continuePremiums !== true || data.duration <= 0) };
          if (field.key === 'continueAfter69') return { ...field, when: (data, model) => data.continueAfter69 === true && (!data.salaryId || !pensionAgreement(data, model)?.continueAfter69) };
          return field;
        });
      }
      if (this.#details) {
        const basicKeys = new Set(fields.filter(field => field.key).map(field => field.key));
        const detailedKeys = new Set(['growthRate','incomeIndex','premiumYield','premiumDivisionYears','continuePremiums','continueAfterPayout','continueAfter69']);
        fields = fullFields.filter(field => !basicKeys.has(field.key) || detailedKeys.has(field.key));
      }
      this.configuration = { fields: fields.map(field => field.key !== 'payoutAge' ? field : {
        ...field, kind: 'time', choices: ['age'], allowMilestones: false, hideOffset: true, wide: false,
        information: 'Det här är en önskad uttagsålder. I prognosen håller sig uttagsåldern inom det intervall som gäller för avtalet. För ITP2 innebär det 65 år.',
      }), translate };
      super.caseContext = this.#context;
    }
    set caseContext(model) {
      const draft = this.#base ? this.readDraft(this.#base) : null;
      this.#context = model; super.caseContext = model;
      if (draft) super.draftContext = draft;
    }
    set data(value) {
      this.#configure(value.kind);
      this.#linkedBasis = value.linkedInputMode ?? (value.salaryId && value.inputMode === 'statement' ? 'statement' : undefined);
      if (this.#inline && value.kind !== 'public' && !value.salaryId && value.inputMode === 'estimate') value = { ...value, inputMode: 'statement' };
      if (value.payoutStart?.reference === 'age') value = { ...value, payoutStart: { ...value.payoutStart, personId: value.owner } };
      this.#automaticEmployment = value.kind === 'dc' && !value.pensionId && (!value.employmentStartDate || (this.#automaticEmployment && value.employmentStartDate === this.#lastEmployment));
      if (this.#automaticEmployment && pensionAgreement(value, this.#context)?.needsEmploymentStart) value = { ...value, employmentStartDate: this.#lastEmployment = assumedEmploymentStart(value.owner, this.#context) };
      this.#base = structuredClone(value); this.#salaryId = value.salaryId ?? ''; super.data = this.#editorData(value);
      if (this.#payout && this.#details) this.#renderSteps(value.payoutPeriods ?? []);
      else if (!this.#payout) this.#renderInvalidSalaries();
    }
    #editorData(data) {
      if (this.#kind !== 'db' || data.payoutAge?.reference === 'age') return data;
      const payoutAge = normalizeTime({ reference: 'age', year: 0, month: 1, offset: 0, personId: data.owner, age: data.payoutAge });
      return { ...data, payoutAge };
    }
    applyNormalizedData(data) { super.applyNormalizedData(this.#editorData(data)); }
    applyEditAccess(access) {
      super.applyEditAccess(access);
      this.#access = access;
      if (this.#steps) { const policy = fieldAccess({key:'payoutPeriods'}, access); this.#steps.hidden = policy.hidden; lockControls(this.#steps, policy.locked); }
      this.#syncInvalidSalaries();
    }
    refreshDynamicLanguage() {
      super.refreshDynamicLanguage();
      for (const node of this.shadowRoot.querySelectorAll('[data-pension-text]')) node.textContent = translate(node.dataset.pensionText);
    }
    #label(node, text) {
      node.dataset.pensionText = text; node.textContent = translate(text);
    }
    #renderInvalidSalaries() {
      this.#invalidSalaryNotice = null;
      if (this.#kind !== 'dc') return;
      const section = document.createElement('div'); section.className = 'col-span-full space-y-2'; section.setAttribute('role', 'alert');
      const message = document.createElement('p'); message.className = 'text-sm text-danger'; this.#label(message, 'En sparad ytterligare lönekoppling är inte längre giltig. Rensa ogiltiga kopplingar för att fortsätta.');
      const clear = document.createElement('button'); clear.type = 'button'; clear.className = 'rounded-xl border border-outline px-3 py-2 text-sm'; this.#label(clear, 'Rensa ogiltiga lönekopplingar');
      clear.addEventListener('click', () => this.removeUnavailableReferences('additionalSalaryIds'));
      section.append(message, clear); this.find('#fields').append(section); this.#invalidSalaryNotice = section; this.#syncInvalidSalaries();
    }
    #syncInvalidSalaries() {
      if (!this.#invalidSalaryNotice || !this.#base) return;
      const data = this.readDraft(this.#base), allowed = new Set(additionalSalaryCandidates(data, this.#context).map(entry => entry.id));
      const policy = this.#access ? fieldAccess({key:'additionalSalaryIds'}, this.#access) : {};
      this.#invalidSalaryNotice.hidden = policy.hidden || !(data.additionalSalaryIds ?? []).some(id => !allowed.has(id));
      lockControls(this.#invalidSalaryNotice, !!policy.locked);
    }
    #renderSteps(periods) {
      this.#steps = null;
      this.#periodsEdited = false;
      if (this.#kind !== 'public') return;
      const section = document.createElement('div');
      section.className = 'col-span-full space-y-3';
      const heading = document.createElement('p'); heading.className = 'text-sm font-semibold text-ink'; this.#label(heading, 'Uttagsperioder'); section.append(heading);
      const help = document.createElement('p'); help.className = 'text-xs text-muted'; this.#label(help, 'Efter perioderna gäller ordinarie uttagsandel.'); section.append(help);
      const changed = () => { this.#periodsEdited = true; this.emit('editor-input'); this.emit('editor-change'); };
      section.addEventListener('input', () => { this.#periodsEdited = true; });
      section.addEventListener('change', () => { this.#periodsEdited = true; });
      const rows = document.createElement('div'); rows.className = 'space-y-2'; section.append(rows);
      const addRow = period => {
        const row = document.createElement('div'); row.className = 'flex flex-wrap items-end gap-3';
        const yearsLabel = document.createElement('label'); yearsLabel.className = 'text-sm'; const yearsTitle=document.createElement('span');this.#label(yearsTitle,'Antal år');yearsLabel.append(yearsTitle);
        const years = document.createElement('input'); years.type = 'number'; years.min = '1'; years.max = '100'; years.step = '1'; years.value = period.years; years.dataset.payoutYears = ''; years.className = 'ml-2 w-20 rounded-xl border border-outline bg-canvas p-2'; yearsLabel.append(years);
        const fractionLabel = document.createElement('label'); fractionLabel.className = 'text-sm'; const fractionTitle=document.createElement('span');this.#label(fractionTitle,'Uttagsandel');fractionLabel.append(fractionTitle);
        const fraction = document.createElement('select'); fraction.dataset.payoutFraction = ''; fraction.className = 'ml-2 rounded-xl border border-outline bg-canvas p-2';
        for (const value of [0, 25, 50, 75, 100]) { const option = document.createElement('option'); option.value = value; option.textContent = `${value} %`; fraction.append(option); }
        fraction.value = period.fraction; fractionLabel.append(fraction);
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'rounded-xl border border-outline px-3 py-2 text-sm'; this.#label(remove, 'Ta bort'); remove.addEventListener('click', () => { row.remove(); changed(); });
        row.append(yearsLabel, fractionLabel, remove); rows.append(row);
      };
      for (const period of periods) addRow(period);
      const add = document.createElement('button'); add.type = 'button'; add.className = 'rounded-xl border border-outline px-3 py-2 text-sm'; this.#label(add, 'Lägg till uttagsperiod');
      add.addEventListener('click', () => { addRow({years: 1, fraction: 100}); changed(); });
      section.append(add); this.find('#fields').append(section); this.#steps = section;
      if (this.#access) this.applyEditAccess(this.#access);
    }
    readDraft(base) {
      const data = super.readDraft(base);
      if (this.#kind === 'db' && data.payoutAge?.reference === 'age') data.payoutAge = data.payoutAge.age;
      if (this.#payout && this.#kind === 'dc' && data.duration !== this.#base?.duration) {
        data.continuePremiums = false;
        data.continueAfterPayout = false;
      }
      if (!this.#payout && !this.#details && ['dc','db'].includes(data.kind)) {
        if (this.#linkedBasis) data.linkedInputMode = this.#linkedBasis;
        if (!data.salaryId) data.inputMode = 'statement';
      }
      if (data.payoutStart?.reference === 'age') data.payoutStart.personId = data.owner;
      if (this.#steps && (this.#periodsEdited || this.#base?.payoutPeriods?.length)) {
        data.payoutPeriods = [...this.#steps.querySelectorAll('[data-payout-years]')].map(years => ({
          years: years.valueAsNumber, fraction: Number(years.parentElement.parentElement.querySelector('[data-payout-fraction]').value),
        }));
        if (this.#periodsEdited) data.payoutChanges = [];
      }
      return data;
    }
  }
  customElements.define(tags.details, class extends PensionFields { constructor() { super(false, true); } });
  customElements.define(tags.inline, class extends PensionFields { constructor() { super(true); } });
  customElements.define(tags.payout, class extends PensionFields { constructor() { super(false, false, true); } });
  customElements.define(tags.partial, class extends PensionFields { constructor() { super(false, true, true); } });
  for (const plugin of pensionPlugins) {
    const validate = plugin.validate;
    if (validate) plugin.validate = (...args) => validate(...args).map(message => translate(message));
    const availability = plugin.availability;
    if (availability) plugin.availability = (...args) => availability(...args).map(message => translate(message));
    const validateLinks = plugin.validateLinks;
    if (validateLinks) plugin.validateLinks = (...args) => validateLinks(...args).map(message => translate(message));
    const schema = schemaFromValue(
      pensionDefaults(
        plugin.type.includes('-db-')
          ? 'db'
          : plugin.type.includes('-dc-')
            ? 'dc'
            : 'public',
      ),
    );
    schema.properties.premiumYield = premiumReturnSchema({ objectSchema, enumSchema });
    schema.properties.inputMode = enumSchema(['estimate', 'statement']);
    if (schema.properties.payoutStart) { const time = timeSchema(); time.properties.reference = enumSchema(['age', 'now', 'date', 'retirement', 'life', 'independence', 'milestone', 'end']); time.properties.age = { type: 'number', integer: true, min: 0, max: 125 }; schema.properties.payoutStart = time; }
    delete schema.properties.pensionId;
    delete schema.properties.kind;
    delete schema.properties.divisor;
    delete schema.properties.baseGrowth;
    delete schema.properties.destinationMode;
    delete schema.properties.destinationAccount;
    schema.properties.annualBenefitFrequency = enumSchema(['monthly', 'yearly']);
    schema.properties.statementDate = { type: 'string', format: 'date' };
    schema.properties.historicalWageEvents = { type: 'array', items: { type: 'object', additionalProperties: false, required: ['incomeId'], properties: { incomeId:{type:'string'},paymentAnchor:{type:'string',format:'date'},lastReplayDate:{type:'string',format:'date'},statementDayIncluded:{type:'boolean'},openingEventIncluded:{type:'boolean'} } } };
    if (schema.properties.additionalSalaryIds) schema.properties.additionalSalaryIds = { type: 'array', items: { type: 'string' }, uniqueItems: true };
    schema.properties.payoutPeriods = { type: 'array', items: { type: 'object', properties: { years: { type: 'integer', minimum: 1, maximum: 100 }, fraction: { type: 'number', enum: [0, 25, 50, 75, 100] } }, required: ['years', 'fraction'], additionalProperties: false } };
    const advisorFor = (data, model) => {
      const kind = data?.kind ?? (plugin.type.includes('-dc-') ? 'dc' : plugin.type.includes('-db-') ? 'db' : 'public');
      const fields = pensionEditorFields(kind);
      const allowed = new Set(fields.map(field => field.key).filter(Boolean));
      if (kind === 'public') allowed.add('payoutPeriods');
      const selected = structuredClone(schema);
      selected.properties = Object.fromEntries(Object.entries(selected.properties).filter(([key]) => allowed.has(key)));
      if (selected.properties.statementDate) selected.properties.statementDate.condition = 'inputMode = statement';
      if (selected.properties.scheme) selected.properties.scheme = enumSchema(agreementOptions(kind, model).map(([id]) => id));
      return { help: pensionAssumptions + ' Allmän pension använder automatiskt alla aktiva pensionsgrundande arbets- och näringsinkomster. Bara tjänstepension kopplas till en lön. Svenska fonderade pensionsutbetalningar går till kassan. Delningstid och basbeloppsökning anges gemensamt under Generella antaganden.', schema: selected, fields };
    };
    plugin.advisorFor = advisorFor;
    plugin.advisor = advisorFor();
  }
  return pensionPlugins;
}
