export function createPensionServices({ sourceRegistryFor, pensionText }) {
  /** Provider-owned withdrawal rules exposed through the selected descriptor. */
  function createPensionWithdrawal(rulesFor, effectiveStart) {
    return {
      start(data) {
        return data.kind !== 'db' && data.payoutStart
          ? { key: "payoutStart", time: data.payoutStart }
          : Number.isInteger(data.payoutAge)
            ? {
                key: "payoutAge",
                time: {
                  reference: "age",
                  personId: data.owner,
                  age: data.payoutAge,
                  offset: 0,
                },
              }
            : null;
      },
      limits(data, { model, addMonths }) {
        const person = model?.profile?.people?.find(
            (row) => row.id === data.owner,
          ),
          rules = rulesFor(data, person, model);
        const birth =
          Number.isInteger(person?.birthYear) &&
          Number.isInteger(person?.birthMonth)
            ? `${String(person.birthYear).padStart(4, "0")}-${String(person.birthMonth).padStart(2, "0")}-01`
            : null;
        const earliest = rules.fixedAge ?? rules.minimumAge,
          latest = rules.fixedAge ?? rules.maximumAge;
        let maxStart =
          birth && latest !== null
            ? addMonths(
                birth,
                rules.fixedAge !== null ? latest * 12 : (latest + 1) * 12 - 1,
              )
            : null;
        if (
          data.kind === "public" &&
          data.payoutStart &&
          Array.isArray(data.payoutChanges) &&
          birth
        )
          for (const change of data.payoutChanges)
            if (Number.isInteger(change?.age)) {
              const last = addMonths(birth, change.age * 12 - 1);
              if (last && (!maxStart || last < maxStart)) maxStart = last;
            }
        return {
          minStart:
            birth && earliest !== null ? addMonths(birth, earliest * 12) : null,
          maxStart,
          minDuration: rules.minimumDuration,
          maxDuration: rules.maximumDuration,
          durationStep: 1,
          startLocked: rules.fixedAge !== null,
          lifetimeOnly: rules.lifetimeOnly,
        };
      },
      resolveStart(data, { model, desiredDate, anchorDate }) {
        return (data.payoutStart || rulesFor(data, undefined, model).fixedAge !== null)
          ? effectiveStart(data, model, { desiredDate, anchorDate })
          : desiredDate;
      },
      startPatch(data, time) {
        return data.payoutStart ? { payoutStart: time } : { payoutAge: time.age };
      },
      duration(data) {
        return data.duration;
      },
      durationPatch(data, duration) {
        return {
          duration,
          ...(data.kind === "dc" && duration !== data.duration
            ? { continuePremiums: false, continueAfterPayout: false }
            : {}),
        };
      },
    };
  }

  // Providers describe their own input; an unrelated registry or another version
  // must never be consulted to interpret a saved module.
  function wageDescriptor(entry, model) {
    if (!entry) return null;
    const describe = sourceRegistryFor(model)?.get(entry.type, entry.version)?.wageDescriptor;
    if (typeof describe !== 'function') return null;
    const result = describe(entry.data, model);
    return result && ['salary', 'hourly', 'other'].includes(result.kind) && typeof result.taxBasis === 'string'
      && result.data && typeof result.data === 'object' && !Array.isArray(result.data) ? result : null;
  }

  // The supported Swedish public scheme accrues employment and active-business
  // income. Capital returns, pension receipts and net/exempt amounts do not earn PGI.
  const countryBases = { SE: new Set(['salary', 'employment', 'businessIncome']) };
  function pensionableIncomes(model, owner) {
    const eligible = countryBases[model?.profile?.tax?.country];
    if (!eligible) return [];
    return (model.modules ?? []).flatMap(entry => {
      const wage = wageDescriptor(entry, model);
      return entry.enabled !== false && wage?.data.owner === owner && wage.data.taxTreatment === 'taxable' && eligible.has(wage.taxBasis)
        ? [{ ...entry, data: wage.data, wageKind: wage.kind }] : [];
    });
  }

  function agreementsFor(model) {
    return sourceRegistryFor(model)?.pensionAgreements?.() ?? [];
  }

  function pensionAgreement(data, model) {
    return agreementsFor(model).find(agreement => agreement.kind === data?.kind && agreement.id === data.scheme);
  }

  function agreementOptions(kind, model) {
    return agreementsFor(model).filter(agreement => agreement.selectable !== false && (!kind || agreement.kind === kind))
      .sort((left, right) => (left.order ?? 1000) - (right.order ?? 1000) || left.id.localeCompare(right.id))
      .map(agreement => [agreement.id, agreement.label ?? agreement.id]);
  }

  /** Swedish pension assumptions are shared across accounts and pension types. */
  const swedishPensionAssumptions = {
    id: 'swedish-pension', group: 'Generella antaganden', label: 'Svensk pension',
    translate: pensionText,
    defaults: { baseAmountIncrease: 2, lifelongDivisionYears: 20, historicalIncomeBaseAmounts: 4 },
    appliesTo: model => model?.profile?.tax?.country === 'SE'
      || (model?.modules ?? []).some(entry => /^cashlab\.swedish-(public|dc|db|income)-pension$/.test(entry.type)),
    fields: [
      { key: 'historicalIncomeBaseAmounts', kind: 'number', label: 'Löneschablon, inkomstbasbelopp', required: true, min: 0, max: 100, help: 'Appens historiska löneantagande när aktuell inkomst saknas. Förval 4 inkomstbasbelopp; endast tidigare arbetsår. Ingen genomsnittslön eller lagstadgad ersättning.' },
      { key: 'baseAmountIncrease', kind: 'number', label: 'Årlig ökning av basbelopp', unit: '%', required: true, min: -100, max: 100, help: 'Gemensamt prognosantagande för svenska pensioner. 2 betyder 2 % per år.' },
      { key: 'lifelongDivisionYears', kind: 'number', label: 'Delningstid för livslång pension', unit: 'år', required: true, min: 1, max: 60, integer: true, help: 'Gemensam schablon för svenska pensionsutbetalningar. Förval: 20 år.' },
    ],
    schema: { type: 'object', properties: {
      historicalIncomeBaseAmounts: { type: 'number', min: 0, max: 100 },
      baseAmountIncrease: { type: 'number', min: -100, exclusiveMin: true, max: 100, unit: 'percent per year' },
      lifelongDivisionYears: { type: 'number', min: 1, max: 60, integer: true, unit: 'years' },
    }, additionalProperties: false },
    validate: values => values.baseAmountIncrease <= -100 ? [pensionText('Basbeloppens ökning måste vara större än −100 %.')] : [],
  };

  function pensionAssumptionsFor(model) {
    const values = { ...swedishPensionAssumptions.defaults, ...model?.plan?.generalAssumptions?.[swedishPensionAssumptions.id] };
    return { baseGrowth: values.baseAmountIncrease, divisor: values.lifelongDivisionYears, historicalIncomeBaseAmounts: values.historicalIncomeBaseAmounts };
  }
  return { createPensionWithdrawal, pensionableIncomes, wageDescriptor, agreementOptions, pensionAgreement, swedishPensionAssumptions, pensionAssumptionsFor };
}
