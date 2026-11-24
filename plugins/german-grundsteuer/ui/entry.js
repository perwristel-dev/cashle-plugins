const provider = 'cashle.finance.property-tax.de';
const schedules = ['quarterly', 'halfYearly', 'august', 'july'];
const amount = data => data.assessmentBaseEur * data.municipalMultiplierPercent / 100;
const year = value => Number.isInteger(value) && value >= 2025 && value <= 9998;

export default function createPlugin(context) {
  const { translate: t, savingsFundingFields, savingsFundingSummary } = context;
  const fields = [
    { key: 'name', label: 'field.name', kind: 'text', default: 'label' },
    { key: 'assessmentBaseEur', label: 'field.assessmentBase', kind: 'number',
      default: 0, min: 0, unit: 'unit.eur', help: 'help.assessmentBase' },
    { key: 'municipalMultiplierPercent', label: 'field.multiplier', kind: 'number',
      default: 0, min: 0, unit: 'unit.percent', help: 'help.multiplier' },
    { key: 'cadence', label: 'field.cadence', kind: 'select', default: 'quarterly',
      options: schedules.map(mode => [mode, 'option.' + mode]), forecastEditable: true },
    { key: 'firstTaxYear', label: 'field.firstYear', kind: 'number', default: 2025, min: 2025, max: 9998 },
    { key: 'lastTaxYear', label: 'field.lastYear', kind: 'number', default: 0, min: 0, max: 9998, forecastEditable: true },
  ];
  const module = context.schemaModule({
    id: 'german-grundsteuer', category: 'expenses', label: 'label', fields,
    sections: [{ id: 'funding', title: 'funding', fields: savingsFundingFields('propertyTax'),
      summary: data => savingsFundingSummary(data, 'propertyTax') }],
    validateData(data) {
      const errors = [];
      const annual = Math.round(amount(data) * 100) / 100;
      if (![data.assessmentBaseEur, data.municipalMultiplierPercent].every(x => Number.isFinite(x) && x >= 0) ||
          !Number.isFinite(annual) || annual > 90_000_000_000) errors.push('invalid.amount');
      if (!year(data.firstTaxYear) || (data.lastTaxYear !== 0 &&
          (!year(data.lastTaxYear) || data.lastTaxYear < data.firstTaxYear))) errors.push('invalid.years');
      if (!schedules.includes(data.cadence) || (data.cadence === 'halfYearly' && annual > 30) ||
          (data.cadence === 'august' && annual > 15)) errors.push('invalid.cadence');
      return errors;
    },
    summarize(data) {
      const formatted = new Intl.NumberFormat(context.language, { maximumFractionDigits: 2 }).format(amount(data));
      return { title: data.name, amount: t('summary.amount', { amount: formatted }), detail: t('option.' + data.cadence) };
    },
  });
  return { modules: [{ ...module, pluginId: provider, usageModel: 'identity', translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'german-grundsteuer.cashle' } }] };
}
