export function createPensionModel({
  createPensionWithdrawal, pensionAssumptionsFor, validateRate, FINANCIAL_RATES, createAccountReturnPreset,
  normalizeRate, pensionableIncomes, wageDescriptor, moneyFrequencies, sourceDate, sourceResidenceChanges,
  sourceRegistryFor, getPlan, en, sv, pensionText, timeSummary, activePeople, agreementOptions, pensionAgreement, tags,
}) {
  const pensionAssumptions =
    'Schablon: dagens lön antas ha gällt sedan arbetsstart; historisk lön och avkastning är förenklade. 2026 års avtalsregler fryses och basbelopp indexeras med angiven basbeloppsökning. Livsvariga belopp använder antagen delningstid, ingen individuell försäkringsoffert. Allmän pension omfattar inte garantipension, tilläggspension eller bostadstillägg.';
  const personFields = [
    {
      key: 'notStartedWorking',
      label: 'Har ännu inte börjat arbeta',
      kind: 'check',
      placements: ['current'],
      translate: pensionText,
      schema: { type: 'boolean' },
      validate: (p) =>
        p.notStartedWorking !== undefined &&
        typeof p.notStartedWorking !== 'boolean'
          ? [pensionText('Ange om personen har börjat arbeta.')]
          : [],
    },
    {
      key: 'workStartAge',
      normalizeValue: value => Number.isFinite(value) ? value : null,
      label: 'Ålder då du började arbeta',
      kind: 'number',
      min: 0,
      max: 100,
      placements: ['current'],
      translate: pensionText,
      schema: { type: ['number', 'null'], integer: true, min: 0, max: 100 },
      when: (p) => !p.notStartedWorking,
      validate: (p) =>
        p.workStartAge != null &&
        (!Number.isInteger(p.workStartAge) ||
          p.workStartAge < 0 ||
          p.workStartAge > 100 ||
          (p.birthYear != null &&
            p.workStartAge > new Date().getFullYear() - p.birthYear))
          ? [pensionText('Ange en giltig ålder då personen började arbeta.')]
          : [],
    },
  ];
  const pensionType = (kind) =>
    `cashlab.swedish-${kind === 'public' ? 'public' : kind === 'dc' ? 'dc' : 'db'}-pension`;

  /** Match the pension engine's work-start assumption: age in the birth month. */
  function assumedEmploymentStart(owner, model) {
    const person = model?.profile?.people?.find(row => row.id === owner);
    if (!person || person.notStartedWorking || !Number.isInteger(person.workStartAge) || person.workStartAge < 0 || person.workStartAge > 100
        || !Number.isInteger(person.birthYear) || !Number.isInteger(person.birthMonth) || person.birthMonth < 1 || person.birthMonth > 12) return '';
    return sourceDate({ reference: 'age', personId: owner, age: person.workStartAge, offset: 0 }, model) ?? '';
  }

  /** Additional wages must be available to this pension, not another agreement. */
  function pensionSalaryCandidates(model) {
    return (model?.modules ?? []).filter(entry => ['salary', 'hourly'].includes(wageDescriptor(entry, model)?.kind));
  }

  function newPensionData(kind, model) {
    const data = pensionDefaults(kind, model);
    if (kind !== 'dc' || !model?.profile?.people) return data;

    const owners = new Set(activePeople(model.profile).map(person => person.id));
    for (const entry of pensionSalaryCandidates(model)) {
      if (entry.enabled === false) continue;
      const wage = wageDescriptor(entry, model);
      const owner = wage.data.owner;
      if (wage.data.taxTreatment === 'taxable' && owners.has(owner)) {
        return { ...data, owner, salaryId: entry.id, payoutStart: { ...data.payoutStart, personId: owner } };
      }
    }
    return data;
  }
  function additionalSalaryCandidates(data, model) {
    if (data?.kind !== 'dc' || !data.salaryId) return [];
    const modules = model?.modules ?? [], used = new Set([data.salaryId]);
    for (const entry of modules) {
      if (data.pensionId && entry.id === data.pensionId) continue;
      for (const id of sourceRegistryFor(model)?.get(entry.type, entry.version)?.linkedSalaryIds?.(entry.data, model) ?? []) used.add(id);
    }
    return pensionSalaryCandidates(model).filter(entry => {
      const wage = wageDescriptor(entry, model);
      return !used.has(entry.id) && wage.data.owner === data.owner
        && (entry.enabled === false || wage.data.taxTreatment === 'taxable');
    });
  }
  function pensionDefaults(kind, model) {
    return {
      kind,
      name:
        kind === 'public'
          ? 'Allmän pension'
          : kind === 'db'
            ? 'Pensionsinkomst, prognos förmånsbest.'
            : 'Tjänstepension',
      owner: 'self',
      pensionId: '',
      ...(kind === 'public' ? {} : { salaryId: '' }),
      ...(kind === 'dc' ? { additionalSalaryIds: [] } : {}),
      employmentStartDate: '',
      priorSalary: 0,
      priorSalaryConfirmed: false,
      openingPendingAkapPremium: 0,
      historicalWageEvents: [],
      ...(kind === 'public' ? {} : { scheme: agreementOptions(kind, model)[0]?.[0] ?? '' }),
      inputMode: 'estimate',
      statementDate: new Date().toISOString().slice(0, 10),
      capital: kind === 'dc' ? null : 0,
      incomeCapital: 0,
      premiumCapital: 0,
      includeIncomePensionInNetWorth: false,
      includePremiumPensionInNetWorth: true,
      includeOccupationalPensionInNetWorth: true,
      openingPendingYear1: 0, openingPendingIncome1: 0, openingPendingPremium1: 0, openingPendingPremiumCredited1: false,
      openingPendingYear2: 0, openingPendingIncome2: 0, openingPendingPremium2: 0, openingPendingPremiumCredited2: false,
      ongoingIncomeMonthly: null,
      ongoingPremiumMonthly: null,
      ongoingDcMonthly: null,
      ongoingDcPaymentGrowth: 0,
      unclaimedPremiumCapital: null,
      premiumDivisionYears: 0,
      annualBenefit: kind === 'db' ? null : 0,
      annualBenefitFrequency: 'monthly',
      ...(kind === 'db' ? { payoutAge: 65 } : { payoutStart: { reference: 'age', age: 67, offset: 0, personId: 'self' } }),
      payoutFraction: 100,
      ...(kind === 'public' ? { payoutChanges: [], payoutPeriods: [] } : {}),
      duration: 0,
      ...(kind === 'dc' ? { continuePremiums: false, continueAfterPayout: false, continueAfter69: false } : {}),
      divisor: 20,
      growthRate: FINANCIAL_RATES.occupationalPension,
      premiumYield: createAccountReturnPreset('securities'),
      incomeIndex: 2,
      baseGrowth: 2,
      serviceYears: 0,
      destinationMode: 'automatic',
      destinationAccount: '',
      notes: '',
    };
  }
  const validDate = (value) =>
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
  function ongoingPublicStatement(data, model) {
    if(data.kind!=='public' || data.inputMode!=='statement' || !validDate(data.statementDate))return false;
    const start=effectivePensionStart(data,model);
    return start !== null && data.statementDate>start;
  }
  function ongoingLifetimeDcStatement(data, model) {
    if(data.kind!=='dc' || data.duration!==0 || data.inputMode!=='statement' || !validDate(data.statementDate))return false;
    const start=effectivePensionStart(data,model);
    return start !== null && data.statementDate>start;
  }
  function publicMinimumAge(year) {
    return year <= 1958
      ? 61
      : year <= 1960
        ? 62
        : year <= 1962
          ? 63
          : year <= 1969
            ? 64
            : year <= 1984
              ? 65
              : year <= 2000
                ? 66
                : 67;
  }
  /** Contract limits shared by validation and withdrawal planning. */
  function pensionWithdrawalRules(data, person, model) {
    const agreement = pensionAgreement(data, model);
    const minimumAge = data?.kind === 'public'
      ? (Number.isInteger(person?.birthYear) ? publicMinimumAge(person.birthYear) : null)
      : agreement?.minimumAge ?? 55;
    return { minimumAge, maximumAge: 100, fixedAge: agreement?.fixedAge ?? null,
      minimumDuration: agreement?.minimumDuration ?? 5, maximumDuration: 40, lifetimeOnly: data?.kind === 'public' };
  }

  const relativePensionReferences = new Set(['retirement', 'life', 'independence', 'milestone']);
  const dayBefore = value => new Date(Date.parse(`${value}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);

  /** Resolve the actual contractual start without changing the saved relative reference. */
  function effectivePensionStart(data, model, {desiredDate = sourceDate(data?.payoutStart, model), anchorDate} = {}) {
    const person = model?.profile?.people?.find(row => row.id === data?.owner), rules = pensionWithdrawalRules(data, person, model);
    if (rules.fixedAge !== null) return sourceDate({ reference: 'age', age: rules.fixedAge, personId: data.owner, offset: 0 }, model);
    if (data?.kind === 'db') return sourceDate({ reference: 'age', age: data.payoutAge, personId: data.owner, offset: 0 }, model);
    if (!validDate(desiredDate)) return null;
    if (!relativePensionReferences.has(data?.payoutStart?.reference)) return desiredDate;
    if (!Number.isInteger(person?.birthYear) || !Number.isInteger(person?.birthMonth) || !Number.isInteger(rules.minimumAge)) return null;
    const atAge = age => `${String(person.birthYear + age).padStart(4, '0')}-${String(person.birthMonth).padStart(2, '0')}-01`;
    const minimum = atAge(rules.minimumAge), afterMaximum = atAge(rules.maximumAge + 1);
    if (!validDate(minimum) || !validDate(afterMaximum)) return null;
    let lower = validDate(anchorDate) && anchorDate > minimum ? anchorDate : minimum, upper = dayBefore(afterMaximum);
    const firstStep = data.kind === 'public' && Array.isArray(data.payoutChanges) ? data.payoutChanges[0] : null;
    if (Number.isInteger(firstStep?.age)) {
      const step = atAge(firstStep.age);
      if (validDate(step)) { const last = dayBefore(step); if (last < upper) upper = last; }
    }
    if (lower > upper) return null;
    return desiredDate < lower ? lower : desiredDate > upper ? upper : desiredDate;
  }
  function validatePension(data, model = {}) {
    const d = { ...data, ...pensionAssumptionsFor(model), ...(data.inputMode === 'estimate' ? { statementDate: model.plan?.from ?? new Date().toISOString().slice(0, 10) } : {}) },
      errors = [],
      person = model.profile?.people?.find((p) => p.id === d.owner);
    const agreement = pensionAgreement(d, model);
    if (!person || d.owner === 'joint')
      errors.push('Pensionen måste tillhöra en enskild person.');
    for (const key of ['includeIncomePensionInNetWorth', 'includePremiumPensionInNetWorth', 'includeOccupationalPensionInNetWorth'])
      if (d[key] !== undefined && typeof d[key] !== 'boolean') errors.push('Välj om pensionen ska ingå i nettoförmögenheten.');
    if (model.profile?.tax?.country !== 'SE')
      errors.push(
        'Svensk pension kräver svensk skattehemvist. Sparade rättigheter bevaras.',
      );
    if (model.profile?.currency !== 'SEK')
      errors.push('Svenska pensioner beräknas i SEK; välj SEK i profilen.');
    if (
      !['public', 'dc', 'db'].includes(d.kind) ||
      !['estimate', 'statement'].includes(d.inputMode)
    )
      errors.push('Välj pensionstyp och schablon eller besked.');
    if (!d.name?.trim() || d.name.length > 80)
      errors.push('Pensionens namn ska ha 1–80 tecken.');
    if (
      person &&
      (!Number.isInteger(person.birthYear) ||
        !Number.isInteger(person.birthMonth))
    )
      errors.push('Ange personens födelseår och månad.');
    if (
      d.kind === 'public' &&
      model.modules?.some(
        (e) =>
          e.type === pensionType('public') &&
          e.data?.owner === d.owner &&
          (!d.pensionId || e.data.pensionId !== d.pensionId),
      )
    )
      errors.push('Det får bara finnas en allmän pension per person.');
    if (
      person?.birthYear < agreement?.minBirthYear || person?.birthYear > agreement?.maxBirthYear
    )
      errors.push(
        'PA16-schablonen stöder Avdelning I från 1988 och Avdelning II 1966–1987; äldre kohort kräver separat individuellt underlag.',
      );
    if (d.kind === 'public' && person?.birthYear < 1954)
      errors.push(
        'Allmän pension före födelseår 1954 behöver äldre tilläggspension; använd manuellt pensionsbesked som inkomst.',
      );
    if (d.kind !== 'public' && !agreement)
      errors.push('Välj ett stött pensionsavtal.');
    const salary = d.kind === 'public' ? undefined : model.modules?.find((e) => e.id === d.salaryId);
    const extraIds = d.additionalSalaryIds ?? [];
    const extraSalaries = Array.isArray(extraIds) ? extraIds.map(id => model.modules?.find(entry => entry.id === id)) : [];
    if (!Array.isArray(extraIds) || extraIds.some(id => typeof id !== 'string' || !id) || new Set(extraIds).size !== extraIds.length || extraIds.includes(d.salaryId))
      errors.push('Varje pensionslön får bara väljas en gång.');
    if (Array.isArray(extraIds) && extraIds.length && (d.kind !== 'dc' || !salary || extraSalaries.some(entry => !entry)))
      errors.push('Ytterligare pensionslöner kräver en kopplad premiebestämd anställning och befintliga löneposter.');
    if (extraSalaries.some(entry => {
      if (!entry) return false;
      const wage = wageDescriptor(entry, model);
      return !['salary', 'hourly'].includes(wage?.kind) || wage.data.owner !== d.owner || entry.enabled !== false && wage.data.taxTreatment !== 'taxable';
    }))
      errors.push('Ytterligare pensionslöner måste vara skattepliktiga löner för samma person.');
    if (Array.isArray(extraIds) && extraIds.some(id => (model.modules ?? []).some(entry =>
      !(d.pensionId && entry.id === d.pensionId)
        && (sourceRegistryFor(model)?.get(entry.type, entry.version)?.linkedSalaryIds?.(entry.data, model) ?? []).includes(id))))
      errors.push('En ytterligare pensionslön kan inte vara kopplad till ett annat pensionsavtal.');
    const publicEarnings = d.kind === 'public' ? pensionableIncomes(model, d.owner) : [];
    if (d.inputMode === 'statement' && d.kind !== 'db' && validDate(d.statementDate) && model.plan?.from && d.statementDate <= model.plan.from) {
      const historical = d.kind === 'public' ? publicEarnings : [salary, ...extraSalaries].flatMap(entry => {
        const wage = wageDescriptor(entry, model);
        return entry && entry.enabled !== false && wage ? [{ ...entry, data: wage.data, wageKind: wage.kind }] : [];
      });
      for (const entry of historical) {
        const once = entry.wageKind !== 'hourly' && entry.data.frequency === 'once';
        const start=sourceDate(entry.data.start,model);
        const end=once?null:sourceDate(entry.data.end,model);
        if(end!=null && end<=d.statementDate) continue;
        const started=entry.data.start?.reference==='before' || (entry.data.start?.reference!=='now' && start != null && start<model.plan.from);
        const rows=Array.isArray(d.historicalWageEvents)?d.historicalWageEvents.filter(e=>e?.incomeId===entry.id):[];
        if(d.statementDate===model.plan.from) {
          const due=entry.data.start?.reference==='before' || start!=null && (once ? start===model.plan.from : start<=model.plan.from);
          if(due && (rows.length!==1 || typeof rows[0].openingEventIncluded!=='boolean')) errors.push(pensionText('Ange om startperiodens premie för {name} ingår i pensionsbeskedet.', { name: entry.data.name || pensionText('inkomsten') }));
          continue;
        }
        if(once) {
          if(start===d.statementDate && (rows.length!==1 || typeof rows[0].statementDayIncluded!=='boolean')) errors.push(pensionText('Ange om utbetalningen på beskedsdagen för {name} ingår i pensionsbeskedet.', { name: entry.data.name || pensionText('inkomsten') }));
          continue;
        }
        if(!started) continue;
        const row=rows[0], beforeStatement=new Date(`${d.statementDate}T00:00:00Z`);beforeStatement.setUTCDate(beforeStatement.getUTCDate()-1);
        const existedAtStatement=entry.data.start?.reference==='before' || start!=null && start<=d.statementDate;
        if (rows.length!==1 || !validDate(row?.paymentAnchor) || row.paymentAnchor>=model.plan.from || existedAtStatement && row.paymentAnchor>d.statementDate || !validDate(row?.lastReplayDate) || row.lastReplayDate<beforeStatement.toISOString().slice(0,10) || row.lastReplayDate>=model.plan.from || typeof row?.openingEventIncluded!=='boolean' || typeof row?.statementDayIncluded!=='boolean')
          errors.push(pensionText('Ange historiskt utbetalningsdatum, sista återspelade dag och startperiodens utfall för {name}.', { name: entry.data.name || pensionText('inkomsten') }));
      }
    }
    if (
      salary &&
      (!['salary', 'hourly'].includes(wageDescriptor(salary, model)?.kind) ||
        wageDescriptor(salary, model)?.data.owner !== d.owner)
    )
      errors.push('Kopplad lön måste ha samma person som ägare.');
    if (
      salary?.enabled !== false &&
      wageDescriptor(salary, model)?.data.taxTreatment !== 'taxable' &&
      salary
    )
      errors.push('Kopplad pensionslön måste anges före skatt (skattepliktig).');
    if (
      agreement?.needsEmploymentStart &&
      salary?.enabled !== false &&
      salary &&
      (!validDate(d.employmentStartDate) ||
        d.employmentStartDate > new Date().toISOString().slice(0, 10))
    )
      errors.push(
        'AKAP-KR behöver ett giltigt anställningsdatum för prövning av LAS-åldern.',
      );
    if (
      d.kind !== 'public' && d.salarySnapshot &&
      (!['salary', 'hourly'].includes(wageDescriptor(d.salarySnapshot, model)?.kind) ||
        wageDescriptor(d.salarySnapshot, model)?.data.owner !== d.owner ||
        !Number.isFinite(wageDescriptor(d.salarySnapshot, model)?.data.amount) ||
        wageDescriptor(d.salarySnapshot, model)?.data.amount < 0)
    )
      errors.push(
        'Pensionens sparade löneunderlag måste ha samma ägare och ett giltigt lönebelopp.',
      );
    if (
      d.inputMode === 'estimate' &&
      !person?.notStartedWorking &&
      person?.workStartAge == null
    )
      errors.push(
        'Ange arbetsstart i personens Nuläge eller välj ett daterat besked.',
      );
    if (
      d.kind !== 'public' && d.inputMode === 'estimate' &&
      !person?.notStartedWorking &&
      !salary
    )
      errors.push(
        'Fribrev kräver ett eget besked med intjänat kapital eller förmånsbelopp.',
      );
    if (
      !validDate(d.statementDate) ||
      (!(d.inputMode === 'estimate') && d.statementDate > new Date().toISOString().slice(0, 10))
    )
      errors.push(
        'Beskedets datum måste vara ett giltigt datum som inte ligger i framtiden.',
      );
    if (d.kind === 'public') errors.push(...validateRate(d.premiumYield).map(error => `Premiepensionens avkastning: ${error}`));
    if (d.kind === 'public' && d.inputMode === 'statement' && validDate(d.statementDate)) {
      const seen=new Set();let credited=0;
      for(const row of [1,2]) {
        const year=d[`openingPendingYear${row}`],income=d[`openingPendingIncome${row}`]??0,premium=d[`openingPendingPremium${row}`]??0,included=d[`openingPendingPremiumCredited${row}`]??false;
        if(!Number.isFinite(income)||income<0||!Number.isFinite(premium)||premium<0||typeof included!=='boolean') {errors.push('Ange giltiga belopp och status för ingående pensionsrätter.');continue;}
        if((year==null || year===0) && income===0 && premium===0 && !included)continue;
        if(!Number.isInteger(year)||year<1800||year>Number(d.statementDate.slice(0,4))) {errors.push('Ange inkomstår för varje ingående pensionsrätt i ett allmänt pensionsbesked.');continue;}
        const payout=`${year+2}-01-01`,premiumDate=`${year+1}-12-31`;
        if(payout<d.statementDate || premium>0 && (included && d.statementDate<premiumDate || !included && d.statementDate>premiumDate)) errors.push('Pensionsrättens datum och premiepensionens krediteringsstatus stämmer inte med beskedsdatumet.');
        if(seen.has(year%2))errors.push('Ange högst en ingående pensionsrätt per inkomstår och undvik överlappande år.');seen.add(year%2);
        if(included)credited+=premium;
      }
      if(credited>d.premiumCapital+1e-7)errors.push('Redan krediterad premiepension kan inte överstiga premiepensionskapitalet i beskedet.');
    }
    if (d.annualBenefitFrequency !== undefined && !moneyFrequencies.some(([id]) => id === d.annualBenefitFrequency)) errors.push('Välj en giltig tidsenhet för pensionsförmånen.');
    const pendingPremium = d[agreement?.pendingPremiumKey];
    if (agreement?.pendingPremiumKey && d.inputMode === 'statement' && pendingPremium !== undefined && (!Number.isFinite(pendingPremium) || pendingPremium < 0))
      errors.push('Ange giltig obetald ingående AKAP-KR-premie.');
    for (const key of [
      'priorSalary',
      'capital',
      'incomeCapital',
      'premiumCapital',
      'annualBenefit',
      'divisor',
      'growthRate',
      'incomeIndex',
      'baseGrowth',
      'serviceYears',
    ])
      if (['capital', 'annualBenefit'].includes(key) && !(d.inputMode === 'statement' && (key === 'capital' ? d.kind === 'dc' : d.kind === 'db'))) continue;
      else if (
        !Number.isFinite(d[key]) ||
        (['growthRate', 'incomeIndex', 'baseGrowth'].includes(key)
          ? d[key] <= -100 || d[key] > 100
          : d[key] < 0)
      )
        errors.push(pensionText('{field}: ange ett giltigt tal.', { field: pensionText({ capital: 'Pensionskapital enligt besked', incomeCapital: 'Inkomstpensionens pensionsbehållning', premiumCapital: 'Premiepensionskapital', annualBenefit: 'Redan intjänad ITP2-förmån vid beskedsdatum', divisor: 'Delningstid för livslång pension', growthRate: 'Värdeutveckling', incomeIndex: 'Antagen förändring av inkomst- eller balansindex', baseGrowth: 'Årlig ökning av basbelopp', serviceYears: 'Tidigare ITP2-tjänstetid vid besked' }[key]) }));
    if (!(d.divisor >= 1 && d.divisor <= 60) || d.serviceYears > 30)
      errors.push(
        'Delningstid ska vara 1–60 år och tidigare tjänstetid högst 30 år.',
      );
    const assessmentMonths = d.kind === 'public' ? 12 : agreement?.assessmentMonths ?? 1;
    const statementInPeriod = validDate(d.statementDate) &&
      (d.statementDate.slice(8) !== '01' || (Number(d.statementDate.slice(5, 7)) - 1) % assessmentMonths !== 0);
    const activeWages =
      d.kind === 'public'
        ? publicEarnings.length > 0
        : [salary, ...extraSalaries].some(entry => entry && entry.enabled !== false);
    if (
      d.inputMode === 'statement' &&
      d.kind !== 'db' &&
      activeWages &&
      statementInPeriod &&
      d.priorSalaryConfirmed !== true
    )
      errors.push(
        'Besked mitt i en intjänandeperiod behöver bekräftad pensionsgrundande bruttolön före beskedsdatum: kalenderår för allmän pension, halvår för AKAP-KR, månad för övriga avtal.',
      );
    if (typeof d.priorSalaryConfirmed !== 'boolean')
      errors.push('Bekräfta tidigare pensionsgrundande lön med ett ja/nej-val.');
    const rules = pensionWithdrawalRules(d, person, model), minimum = rules.minimumAge ?? publicMinimumAge(person?.birthYear);
    const payoutStart = d.kind === 'db' ? null : d.payoutStart;
    const requestedStart = d.kind === 'db' ? null : sourceDate(payoutStart, model);
    const startDate = d.kind === 'db' ? null : effectivePensionStart(d, model);
    const relativeStart = relativePensionReferences.has(payoutStart?.reference);
    const validStart = payoutStart && ['age', 'now', 'date', 'retirement', 'life', 'independence', 'milestone', 'end'].includes(payoutStart.reference)
      && Number.isInteger(payoutStart.offset ?? 0)
      && (payoutStart.reference !== 'age' || (Number.isInteger(payoutStart.age) && payoutStart.age >= 0 && payoutStart.age <= 125 && payoutStart.personId === d.owner))
      && (payoutStart.reference !== 'date' || (Number.isInteger(payoutStart.year) && payoutStart.year >= 1900 && payoutStart.year <= 2300 && Number.isInteger(payoutStart.month) && payoutStart.month >= 1 && payoutStart.month <= 12))
      && (!['retirement', 'life', 'independence'].includes(payoutStart.reference) || (getPlan(model).milestones ?? []).some(row => row.id === `${payoutStart.reference}:${payoutStart.personId ?? 'self'}`))
      && (payoutStart.reference !== 'milestone' || (getPlan(model).milestones ?? []).some(row => row.id === payoutStart.milestoneId));
    if (d.kind !== 'db' && !validStart) errors.push('Välj en giltig starttidpunkt för pensionsuttaget.');
    const earliest = person?.birthYear && person?.birthMonth ? `${person.birthYear+minimum}-${String(person.birthMonth).padStart(2,'0')}-01` : null;
    const latest = person?.birthYear && person?.birthMonth ? `${person.birthYear+101}-${String(person.birthMonth).padStart(2,'0')}-01` : null;
    if (d.kind === 'db' && (!Number.isInteger(d.payoutAge) || d.payoutAge < 0 || d.payoutAge > 125))
      errors.push('Välj en giltig starttidpunkt för pensionsuttaget.');
    if (d.kind !== 'db' && !relativeStart && startDate && earliest && (startDate < earliest || startDate >= latest))
      errors.push(
        pensionText('Uttag får börja tidigast vid {minimum} år. Yngre allmänna pensionskohorter använder publicerad prognos.', { minimum }),
      );
    if (
      !(d.kind === 'public' ? [25, 50, 75, 100] : [100]).includes(
        d.payoutFraction,
      )
    )
      errors.push('Välj en tillåten uttagsandel.');
    if (d.kind === 'public') {
      const periods = d.payoutPeriods ?? [];
      if (!Array.isArray(periods) || periods.some(period => !Number.isInteger(period?.years) || period.years < 1 || period.years > 100
        || ![0, 25, 50, 75, 100].includes(period.fraction)))
        errors.push('Varje uttagsperiod behöver en giltig uttagsandel och 1–100 hela år.');
      if (periods.length && d.payoutChanges?.length) errors.push('Välj uttagsperioder eller daterade uttagssteg.');
      const changes = d.payoutChanges ?? [];
      const firstAge = Array.isArray(changes) ? changes[0]?.age : null;
      const firstStep = person?.birthYear && person?.birthMonth && Number.isInteger(firstAge) ? `${person.birthYear+firstAge}-${String(person.birthMonth).padStart(2,'0')}-01` : null;
      if (relativeStart && ((earliest && firstStep && firstStep <= earliest) || (earliest && latest && requestedStart && !startDate)))
        errors.push('Uttagssteg medger ingen giltig tidpunkt för pensionsuttaget.');
      let previous = -1;
      if (!Array.isArray(changes)) errors.push('Uttagssteg måste anges i stigande åldersordning med giltiga andelar.');
      else for (const change of changes) {
        const changeDate = person?.birthYear && person?.birthMonth && Number.isInteger(change?.age) ? `${person.birthYear+change.age}-${String(person.birthMonth).padStart(2,'0')}-01` : null;
        if (!change || !Number.isInteger(change.age) || change.age <= previous || change.age > 100 || (startDate && changeDate && changeDate <= startDate) || ![0, 25, 50, 75, 100].includes(change.fraction)) {
          errors.push('Uttagssteg måste anges i stigande åldersordning med giltiga andelar.');
          break;
        }
        previous = change.age;
      }
    } else if (d.payoutChanges?.length || d.payoutPeriods?.length) errors.push('Uttagssteg stöds bara för allmän pension.');
    if (
      !Number.isInteger(d.duration) ||
      d.duration < 0 ||
      d.duration > 40 ||
      (d.duration > 0 &&
        (d.kind === 'public' ||
          d.duration < rules.minimumDuration))
    )
      errors.push('Välj livsvarigt uttag eller avtalets minsta utbetalningstid.');
    if (d.continuePremiums !== undefined && typeof d.continuePremiums !== 'boolean')
      errors.push('Välj ja eller nej för fortsatt intjänande under uttag.');
    if (d.continuePremiums === true && (d.kind !== 'dc' || !d.salaryId))
      errors.push('Fortsatt intjänande under uttag kräver premiebestämd pension och en kopplad lön.');
    if(d.continueAfterPayout !== undefined && typeof d.continueAfterPayout !== 'boolean')errors.push('Välj ja eller nej för fortsatt intjänande efter utbetalningstidens slut.');
    if(d.continueAfterPayout===true && (d.kind!=='dc' || !d.salaryId || d.continuePremiums!==true || d.duration<=0))errors.push('Fortsatt intjänande efter utbetalningstidens slut kräver ett tidsbestämt uttag och valt fortsatt intjänande.');
    if(d.continueAfter69 !== undefined && typeof d.continueAfter69 !== 'boolean')errors.push('Medgivande till intjänande efter 69 år måste vara ja eller nej.');
    if (d.continueAfter69 === true && (!agreement?.continueAfter69 || !d.salaryId)) errors.push('Medgivande till intjänande efter 69 år kräver premiebestämd PA 16 och en kopplad lön.');
    const residenceModel = model.moduleActivity ? {
      ...model,
      modules: (model.modules ?? []).map(entry => ({ ...entry, enabled: entry.enabled !== false && model.moduleActivity[entry.id] !== false })),
    } : model;
    if (
      sourceResidenceChanges(residenceModel,sourceRegistryFor(model)).some(
        (change) =>
          (!change.owner ||
            change.owner === 'joint' ||
            change.owner === d.owner) &&
          change.settings?.country !== 'SE',
      )
    )
      errors.push(
        'Gränsöverskridande svensk pension stöds inte. Bevara rättigheten och gör en separat plan med svensk hemvist.',
      );
    if (
      d.inputMode === 'statement' &&
      validDate(d.statementDate) &&
      model.plan?.from &&
      d.statementDate > model.plan.from
    )
      errors.push(
        'Beskedets datum ligger efter planstart; flytta planstart till beskedets datum eller senare.',
      );
    if (ongoingPublicStatement(d, model)) {
      if (![d.ongoingIncomeMonthly, d.ongoingPremiumMonthly].every(value => Number.isFinite(value) && value >= 0))
        errors.push('Ange aktuella pågående månadsbelopp före skatt för både inkomst- och premiepension; ange 0 om en del inte betalas ut.');
      if (!Number.isFinite(d.unclaimedPremiumCapital) || d.unclaimedPremiumCapital < 0 || d.unclaimedPremiumCapital > d.premiumCapital)
        errors.push('Ange den del av premiepensionskapitalet som ännu inte tas ut, högst det totala premiepensionskapitalet.');
      if (d.ongoingPremiumMonthly > 0 && d.unclaimedPremiumCapital >= d.premiumCapital)
        errors.push('Pågående premiepension kräver ett positivt uttaget premiepensionskapital.');
      if (d.ongoingPremiumMonthly > 0 && (!Number.isFinite(d.premiumDivisionYears) || d.premiumDivisionYears <= 0))
        errors.push('Ange premiepensionens individuella delningstal för årsberäkningen.');
    }
    if (ongoingLifetimeDcStatement(d,model)) {
      if (!Number.isFinite(d.ongoingDcMonthly) || d.ongoingDcMonthly < 0)
        errors.push('Ange aktuellt månadsbelopp för den livsvariga tjänstepensionen före skatt.');
      if (!Number.isFinite(d.ongoingDcPaymentGrowth) || d.ongoingDcPaymentGrowth <= -100 || d.ongoingDcPaymentGrowth > 100)
        errors.push('Ange giltig antagen årlig förändring av tjänstepensionens utbetalning.');
    }
    if (d.kind === 'public' && (!Number.isFinite(d.premiumDivisionYears) || d.premiumDivisionYears < 0))
      errors.push('Ange ett icke-negativt individuellt delningstal för premiepensionen.');
    return errors;
  }
  function validatePensionLinks(model) {
    const errors = [];
    const publicOwners = model.modules
      .filter((e) => e.type === pensionType('public'))
      .map((e) => e.data.owner);
    if (new Set(publicOwners).size !== publicOwners.length)
      errors.push('Det får bara finnas en allmän pension per person.');
    return [...new Set(errors)];
  }
  const labels = {
    public: 'Allmän pension',
    dc: 'Premiebestämd tjänstepension',
    db: 'Pensionsinkomst, prognos förmånsbest.',
  };
  const payoutLabels = {
    public: 'Utbetalning från allmän pension',
    dc: 'Utbetalning från premiebestämd tjänstepension',
  };

  function payoutSummary(data, model) {
    const start = data.payoutStart;
    const detail = start?.reference === 'age'
      ? pensionText('Uttag från {age} år', { age: start.age })
      : timeSummary(start, model);
    const amount = data.kind === 'public' ? `${data.payoutFraction} %`
      : data.duration ? pensionText('{years} år', { years: data.duration }) : pensionText('Livsvarigt');
    return { title: data.name, amount, detail };
  }
  // Refresh on financial edits as well as load, so a saved estimate cannot change on reopening.
  function refreshSalarySnapshot(data, model) {
    if (data.kind === 'public') {
      const { salaryId, salarySnapshot, ...automatic } = data;
      return automatic;
    }
    const salary = model?.modules?.find((entry) => entry.id === data.salaryId);
    return salary
      ? {
          ...data,
          salarySnapshot: {
            type: salary.type,
            version: salary.version,
            data: structuredClone(salary.data),
          },
        }
      : data;
  }
  /** Scenario output is owned by the pension provider and leaves acquired rights unchanged. */
  function pensionScenario(data, { id, moduleId }) {
    if (data.pensionId !== moduleId) return null;
    if (id === 'pension-half' || id === 'pension-none') return { scenario: { pensionIncome: { [moduleId]: { factor: id === 'pension-half' ? .5 : 0 } } } };
    if (id === 'retirement-income-up') return { scenario: { pensionIncome: { [moduleId]: { annualAddition: 6000 } } } };
    return null;
  }

  const pensionPlugins = ['public', 'dc', 'db'].map((kind) => ({
    type: pensionType(kind),
    label: labels[kind],
    translations: { en: { label: en[kind] }, sv: { label: sv[kind] } },
    category: kind === 'db' ? 'income' : 'accounts',
    version: 1,
    taxCountries: ['SE'],
    availability: (model) =>
      model?.profile?.tax?.country === 'SE'
        ? []
        : [
            'Svensk pension kräver aktuell svensk skattehemvist. Sparade rättigheter bevaras.',
          ],
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    financesTab: kind === 'public' || kind === 'dc' ? 'savings' : 'income',
    identityKey: 'pensionId',
    internalKeys: ['salarySnapshot'],
    validateLinks: validatePensionLinks,
    capabilities: kind === 'public' || kind === 'dc' ? { balance: true } : {},
    scenarioTransform: pensionScenario,
    withdrawal: createPensionWithdrawal(pensionWithdrawalRules, effectivePensionStart),
    ...(kind === 'public' ? {} : { linkedSalaryIds: data => [data.salaryId, ...(data.additionalSalaryIds ?? [])].filter(Boolean) }),
    acceptsDeposits: false,
    acceptsRemainder: false,
    createData: model => newPensionData(kind, model),
    validate: (data, model) => [
      ...(data.kind !== kind
        ? ['Pensionstypen får inte ändras till ett annat avtal.']
        : []),
      ...validatePension(data, model),
    ],
    refreshReferences: refreshSalarySnapshot,
    engineInput(data, context) {
      const { preliminaryMethod, preliminaryRate, preliminaryPayer, ...input } = data;
      if (kind === 'db') {
        input.payoutAge = pensionWithdrawalRules(data, undefined, context.model).fixedAge ?? input.payoutAge;
        delete input.payoutStart;
      }
      return { input, facts: { pensionData: this.normalize(structuredClone(input), context.model) } };
    },
    normalize: (data, model) => {
      const normalized = {
        ...pensionDefaults(kind, model), ...refreshSalarySnapshot(data, model),
        annualBenefitFrequency: data.annualBenefitFrequency,
        premiumYield: data.premiumYield === undefined ? undefined : { ...normalizeRate(data.premiumYield), passiveIncome: false },
        ...pensionAssumptionsFor(model),
      };
      if (normalized.payoutStart?.reference === 'age') normalized.payoutStart = { ...normalized.payoutStart, personId: normalized.owner };
      const linked = model?.modules?.find(entry => entry.id === normalized.salaryId);
      if (normalized.kind !== 'public' && !linked) {
        if (normalized.inputMode !== 'statement') {
          if (normalized.kind === 'dc') normalized.capital = null;
          else normalized.annualBenefit = null;
        }
        normalized.inputMode = 'statement';
      }
      if (normalized.inputMode === 'estimate') normalized.statementDate = model?.plan?.from ?? new Date().toISOString().slice(0, 10);
      return normalized;
    },
    editor: {
      currentKeys: [
        'name',
        'owner',
        'kind',
        'pensionId',
        'inputMode',
        'linkedInputMode',
        'statementDate',
        'historicalWageEvents',
        'capital',
        'openingPendingAkapPremium',
        'incomeCapital',
        'premiumCapital',
        'includeIncomePensionInNetWorth',
        'includePremiumPensionInNetWorth',
        'includeOccupationalPensionInNetWorth',
        'openingPendingYear1', 'openingPendingIncome1', 'openingPendingPremium1', 'openingPendingPremiumCredited1',
        'openingPendingYear2', 'openingPendingIncome2', 'openingPendingPremium2', 'openingPendingPremiumCredited2',
        'ongoingIncomeMonthly',
        'ongoingPremiumMonthly',
        'ongoingDcMonthly',
        'ongoingDcPaymentGrowth',
        'unclaimedPremiumCapital',
        'premiumDivisionYears',
        'annualBenefit',
        'annualBenefitFrequency',
        'serviceYears',
        'priorSalary',
        'priorSalaryConfirmed',
        'salarySnapshot',
        'additionalSalaryIds',
      ],
      basicComponent: tags.inline,
      detailedSections: [{ id: 'details', title: 'Fler inställningar', element: tags.details }],
    },
    ...(kind === 'db' ? {} : { secondaryView: {
      category: 'income',
      label: () => pensionText(payoutLabels[kind]),
      editor: {
        basicComponent: tags.payout,
        detailedSections: kind === 'public'
          ? [{ id: 'partial-withdrawal', title: 'Partiellt uttag', translateTitle: pensionText, element: tags.partial }]
          : [],
      },
      summarize: payoutSummary,
    } }),
    summarize: (d, context) => ({
      title: d.name,
      amount: pensionText(d.inputMode === 'statement' ? 'Eget besked' : 'Schablon'),
      detail: pensionText('Bundna pensionsrättigheter · regelstyrt uttag'),
    }),
    totals: (d, model) => ({
      assets:
        d.kind === 'db' || d.inputMode !== 'statement'
          ? 0
          : d.kind === 'public'
            ? (d.includeIncomePensionInNetWorth === true ? d.incomeCapital : 0) + (d.includePremiumPensionInNetWorth !== false ? d.premiumCapital : 0)
            : d.includeOccupationalPensionInNetWorth !== false ? d.capital + (d[pensionAgreement(d, model)?.pendingPremiumKey] ?? 0) : 0,
      liabilities: 0,
    }),
  }));
  return { pensionPlugins, personFields, pensionAssumptions, pensionDefaults, ongoingPublicStatement, ongoingLifetimeDcStatement, additionalSalaryCandidates, pensionSalaryCandidates, assumedEmploymentStart };
}
