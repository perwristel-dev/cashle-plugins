export default async function (context) {
  const [emigration, property, links, municipalities] = await Promise.all([
    context.importModule('ui/emigration.js'),
    context.importModule('ui/property-fields.js'),
    context.importModule('ui/property-links.js'),
    context.importModule('ui/municipalities-2025.js'),
  ]);
  return { taxes: [createSwedishTax(context, { emigration, property, links, municipalities })] };
}

export function createSwedishTax(context, { emigration, property, links, municipalities }) {
  const { createEmigrationSourceSettings, swedishForeignTaxCreditValidation } = emigration;
  const { createSwedishPropertyTax } = property;
  const { validateHistoricalHomeSale } = links;
  const { municipalities2025, municipalitySource } = municipalities;
  const { translations } = context;
  const taxText = (key, parameters = {}) => {
    const translated = locale => translations[locale] && Object.hasOwn(translations[locale], key)
      ? translations[locale][key]
      : undefined;
    const message = translated(context.language) ?? translated(context.language?.split('-', 1)[0])
      ?? translated('en') ?? key;
    return message.replace(/\{([^{}]+)\}/g, (match, name) =>
      Object.hasOwn(parameters, name) ? String(parameters[name]) : match);
  };

  const number = (key, label, extra = {}) => ({ key, label, kind: 'number', ...extra });
  const choice = (key, label, options, extra = {}) => ({ key, label, kind: 'select', options, ...extra });
  const range = (options, key, max, errors, label = key) => { if (!Number.isFinite(options[key]) || options[key] < 0 || options[key] > max) errors.push(taxText('{label}: ange ett värde mellan 0 och {max} %.', { label: taxText(label), max: max * 100 })); };
  const common = (options, profile, year) => {
    const errors = [];
    if (options?.ruleYear !== year) errors.push(taxText('Välj den stödda regelutgåvan {year}.', { year }));
    return errors;
  };
  const nativeOptions = options => Object.fromEntries(Object.entries(options).filter(([, value]) => value !== null && value !== undefined && value !== ''));
  // Skatteverket, Begravningsavgift, inkomstår 2025:
  // https://www.skatteverket.se/privat/skatter/arbeteochinkomst/askattsedelochskattetabeller/begravningsavgift.4.1ee2ea81054cf37b1c800030.html
  const burialFee2025 = municipality => ({ '0180': .0007, '0687': .00275 })[municipality] ?? .00293;
  // SCB's tax-base-weighted national average, total municipal and regional tax in 2025:
  // https://www.scb.se/pressmeddelande/skatten-hojs-i-35-kommuner-2025/
  const swedishAverageRate2025 = .3241;
  const selectSwedishMunicipality = (options, id) => ({ ...options, municipality: id, municipalRate: id === '' ? swedishAverageRate2025 : municipalities2025.find(([code]) => code === id)?.[2] ?? null, burialFeeRate: burialFee2025(id) });

  const swedishTax = {
    preliminaryTable: {
      key: 'preliminaryTableNumber',
      label: 'Skattetabell för preliminärskatt',
      help: 'Automatiskt val beräknas från kommunalskatt, begravningsavgift och eventuell församlingsavgift. Välj en annan tabell om ditt besked anger det.',
      numeric: true,
      translate: taxText,
      choices(options) {
        const rate = options.municipalRate + (options.burialFeeRate ?? 0) + (options.communityMember ? options.communityFeeRate ?? 0 : 0);
        const table = options.municipalRate == null || !Number.isFinite(rate) ? null : Math.ceil(Math.round(rate * 1e10) / 1e8 - .5);
        const auto = table >= 29 && table <= 42 ? taxText('Automatiskt (tabell {table})', { table }) : taxText('Automatiskt');
        return [['', auto], ...Array.from({ length: 14 }, (_, index) => [index + 29, String(index + 29)])];
      },
    },
    departureFields: [{
      key: 'afterEmigrationLiability', kind: 'select', required: true,
      label: 'Skattskyldighet i Sverige efter flytten',
      options: [['limited', 'Begränsad skattskyldighet'], ['unlimited', 'Fortsatt obegränsad skattskyldighet']],
      help: 'Begränsad skattskyldighet är förvalt vid utflyttning. Välj fortsatt obegränsad skattskyldighet om exempelvis väsentlig anknytning finns kvar.',
      translate: taxText,
    }],
    sourceSettings: createEmigrationSourceSettings(taxText, context.sourceResidenceChanges), supportsPersonOptions: true,
    propertyTax: createSwedishPropertyTax(input => validateHistoricalHomeSale(input, taxText)),
    translate: taxText,
    translations,
    sourceTax: { language: 'groovy-cashle-plugin', provider: 'cashle.tax.se', source: 'swedish-tax.cashle' },
    id: 'SE', supportedBases: ['salary', 'pension', 'capitalIncome', 'interestExpenses', 'businessIncome', 'privateHomeGain'], label: 'Sverige', currency: 'SEK', ruleYear: 2025,
    description: 'Svenska inkomstskatteregler 2025. Kommunalskatten inkluderar regionen. Begravningsavgift och eventuell församlingsavgift anges separat för 2025. Samma val gäller planens vuxna. När inget annat betalningsdatum gäller för en årsavstämning antar prognosen 1 maj året efter inkomståret. Det faktiska datumet beror på skattebeskedet. Datum för bostadsförsäljningens skattebesked anges separat vid bostaden.',
    source: municipalitySource,
    defaultOptions: { foreignTaxCreditYear:2026, foreignTaxPaidAmount:0, foreignTaxAttributableOrdinaryTax:0, afterEmigrationLiability: 'limited', ruleYear: 2025, municipality: '', municipalRate: swedishAverageRate2025, residentMonths: 12, burialFeeRate: .00293, communityMember: false, communityFeeRate: 0 },
    fields: [choice('afterEmigrationLiability', 'Skattskyldighet efter utflyttning', [['limited', 'Begränsad skattskyldighet (förvalt)'], ['unlimited', 'Fortsatt obegränsad skattskyldighet']], { moveOnly: true, help: 'Prognosantagande efter utflyttning från Sverige, exempelvis vid väsentlig anknytning. Nationella regler används; skatteavtal kan ändra beskattningen.' }), choice('ruleYear', 'Regelår', [['2025', '2025']], { numeric: true }), choice('municipality', 'Kommun', [['', 'Riksgenomsnitt 2025 (32,41 %)'], ...municipalities2025.map(([id, name]) => [id, name])], { update: selectSwedishMunicipality, help: 'Om du inte väljer kommun används SCB:s riksgenomsnitt för 2025, 32,41 %. Det är en uppskattning.' }), number('municipalRate', 'Kommun och region', { percent: true, readonly: true }), number('residentMonths', 'Antal månader bosatt i Sverige', { integer: true }), number('burialFeeRate', 'Begravningsavgift', { percent: true, help: 'Förvald enligt Skatteverket 2025: 0,293 % i övriga kommuner, 0,070 % i Stockholm och 0,275 % i Tranås. Uppdateras när du byter kommun och kan ändras manuellt.' }), { key: 'communityMember', kind: 'check', label: 'Medlem i församling eller trossamfund' }, number('communityFeeRate', 'Församlingsavgift', { percent: true, when: options => options.communityMember, help: 'Ange din församlings eller ditt trossamfunds faktiska avgift för 2025.' })],
    selectMunicipality: selectSwedishMunicipality,
    validate(options, profile) {
      const errors = [...common(options, profile, 2025), ...swedishForeignTaxCreditValidation(options, taxText)], row = municipalities2025.find(([id]) => id === options.municipality);
      if (options.afterEmigrationLiability !== undefined && !['limited','unlimited'].includes(options.afterEmigrationLiability)) errors.push(taxText('Välj begränsad eller fortsatt obegränsad skattskyldighet efter utflyttning.'));
      if (options.municipality ? !row || row[2] !== options.municipalRate : options.municipalRate != null && options.municipalRate !== swedishAverageRate2025) errors.push(taxText('Välj en kommun med publicerad kommunalskatt för 2025.'));
      if (!Number.isInteger(options.residentMonths) || options.residentMonths < 1 || options.residentMonths > 12) errors.push(taxText('Ange 1–12 månader bosatt i Sverige.'));
      range(options, 'burialFeeRate', 1, errors, 'Begravningsavgift');
      if (typeof options.communityMember !== 'boolean') errors.push(taxText('Ange medlemskap i församling.'));
      if (options.communityMember) range(options, 'communityFeeRate', 1, errors, 'Församlingsavgift');
      if (options.preliminaryTableNumber != null && (!Number.isInteger(options.preliminaryTableNumber) || options.preliminaryTableNumber < 29 || options.preliminaryTableNumber > 42)) errors.push(taxText('Välj skattetabell 29–42 eller automatiskt val.'));
      return errors;
    },
    assessmentOptions(options) {
      // Strip retired checkbox keys from saved plans; entered amounts now suffice.
      const { municipality, ruleYear, preliminaryTableNumber, foreignTaxCreditEnabled, foreignTaxCreditYear, foreignTaxPaidAmount, foreignTaxAttributableOrdinaryTax, foreignTaxCreditConfirmed, ...rules } = nativeOptions(options);
      return {
        rules: { ...rules, ...(!options.municipality && options.municipalRate == null ? { municipalRate: swedishAverageRate2025 } : {}), communityFeeRate: options.communityMember ? options.communityFeeRate : 0 },
        ...(preliminaryTableNumber == null ? {} : { preliminaryTableNumber }),
        ...(foreignTaxPaidAmount > 0 && foreignTaxAttributableOrdinaryTax > 0 ? {
          foreignTaxCredit: { taxYear: foreignTaxCreditYear, paidAmount: foreignTaxPaidAmount, attributableOrdinaryTax: foreignTaxAttributableOrdinaryTax, entitlementConfirmed: true },
        } : {}),
      };
    },
  };

  return swedishTax;
}
