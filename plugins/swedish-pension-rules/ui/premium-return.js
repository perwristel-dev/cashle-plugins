export function createPremiumReturnRules(returnProfiles) {
  const modes = ['none', 'fixed', 'advanced', ...returnProfiles.map(([id]) => `profile-${id}`)];
  const bases = ['nominal', 'real'];

  function validatePremiumReturn(rate) {
    const errors = [];
    const deviation = rate?.standardDeviation;
    if (['fixed', 'advanced'].includes(rate?.mode) && deviation !== undefined
        && (!Number.isFinite(deviation) || deviation < 0 || deviation > 100)) {
      errors.push('Osäkerhet i långsiktig årsavkastning måste vara 0–100 procentenheter.');
    }
    if (!modes.includes(rate?.mode)) errors.push('Välj ett giltigt avkastningsläge.');
    if (rate?.mode === 'fixed' && (!Number.isFinite(rate.rate) || rate.rate <= -100)) {
      errors.push('Avkastningen måste vara större än −100 %.');
    }
    if (!bases.includes(rate?.basis)) errors.push('Välj en avkastningsbas.');
    if (rate?.mode === 'advanced') {
      const points = rate.points;
      if (!Array.isArray(points) || points.length < 2 || points.some((point, i) =>
        !Number.isInteger(point?.year) || point.year < 1 || point.year > 200
        || !Number.isFinite(point.rate) || point.rate <= -100 || (i > 0 && point.year <= points[i - 1]?.year))) {
        errors.push('Kurvan behöver minst två punkter med unika stigande år (1–200) och avkastning över −100 %.');
      }
    }
    if (typeof rate?.passiveIncome !== 'boolean') errors.push('Välj om avkastningen räknas som passiv inkomst.');
    return errors;
  }

  function premiumReturnSchema({ objectSchema, enumSchema }) {
    return objectSchema({
      mode: enumSchema(modes),
      rate: { type: 'number', unit: 'percent per year', condition: 'mode = fixed; större än −100 %' },
      standardDeviation: {
        type: 'number', min: 0, max: 100, unit: 'percentage points', condition: 'mode = fixed or advanced',
        description: 'Osäkerhet i långsiktig årsavkastning. En gemensam dragning för hela simuleringen; inte årlig börsvolatilitet. Utelämnat värde och explicit 0 betyder ingen osäkerhet.',
      },
      passiveIncome: { type: 'boolean' },
      basis: enumSchema(bases),
      points: {
        type: 'array', condition: 'mode = advanced; minst två punkter med unika, stigande år',
        items: objectSchema({
          year: { type: 'number', integer: true, min: 1, max: 200 },
          rate: { type: 'number', unit: 'percent per year; greater than -100' },
        }),
      },
    });
  }

  return { validatePremiumReturn, premiumReturnSchema };
}
