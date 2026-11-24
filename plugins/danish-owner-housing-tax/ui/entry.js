const provider = 'cashle.finance.property-tax.dk';
const month = value => typeof value === 'string' &&
  (value === '' || (/^[2-9]\d{3}-(?:0[1-9]|1[0-2])$/.test(value) && value >= '2024-01'));

export default function createPlugin(context) {
  const { translate: t, savingsFundingFields, savingsFundingSummary } = context;
  const yearlyAmount = (key, label) => ({
    key, label, kind: 'number', default: 0, min: 0, unit: 'unit.dkk', help: 'help.notice', forecastEditable: true,
  });
  const paymentMonth = (key, label) => ({ key, label, kind: 'text', default: '', forecastEditable: true });
  const module = context.schemaModule({
    id: 'danish-owner-housing-tax', category: 'expenses', label: 'label',
    fields: [
      { key: 'name', label: 'field.name', kind: 'text', default: 'label' },
      yearlyAmount('annualPropertyValueTaxDkk', 'field.propertyValue'),
      yearlyAmount('annualLandTaxDkk', 'field.land'),
      paymentMonth('firstMonth', 'field.firstMonth'),
      paymentMonth('lastMonth', 'field.lastMonth'),
    ],
    sections: [{ id: 'funding', title: 'funding', fields: savingsFundingFields('housingTax'),
      summary: data => savingsFundingSummary(data, 'housingTax') }],
    validateData(data) {
      const { annualPropertyValueTaxDkk, annualLandTaxDkk, firstMonth, lastMonth } = data;
      const errors = [];
      if (![annualPropertyValueTaxDkk, annualLandTaxDkk].every(amount => Number.isFinite(amount) && amount >= 0))
        errors.push('invalid.amount');
      if (!month(firstMonth) || !month(lastMonth) || (firstMonth && lastMonth && lastMonth < firstMonth))
        errors.push('invalid.period');
      return errors;
    },
    summarize(data) {
      const monthly = (data.annualPropertyValueTaxDkk + data.annualLandTaxDkk) / 12;
      const amount = new Intl.NumberFormat(context.language, { maximumFractionDigits: 2 }).format(monthly);
      return { title: data.name, amount: t('summary.amount', { amount }), detail: t('summary.detail') };
    },
  });
  return { modules: [{ ...module, pluginId: provider, usageModel: 'identity', translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'danish-owner-housing-tax.cashle' } }] };
}
