const pluginId = 'cashle.finance.es-ibi';
const label = 'Impuesto sobre Bienes Inmuebles (IBI)';
const fields = [
  { key: 'name', kind: 'text', label: 'Nombre', default: label },
  { key: 'assetId', kind: 'property-reference', label: 'Vivienda del plan', default: '', required: true },
  { key: 'annualNoticeShare', kind: 'number', label: 'Importe anual del recibo a cargo del hogar',
    default: 0, min: 0, unit: 'EUR' },
  { key: 'noticePaymentDate', kind: 'date', label: 'Fecha de pago del recibo municipal', default: '', required: true },
  { key: 'openingYearTaxpayer', kind: 'select', label: 'Sujeto pasivo el 1 de enero del primer año',
    default: 'automatic', options: [['automatic', 'Usar la fecha de adquisición de la vivienda'],
      ['liable', 'Este hogar debía pagar el IBI'], ['not-liable', 'Otro titular debía pagar el IBI']],
    help: 'Si la vivienda ya existía al inicio del plan y falta la fecha histórica de adquisición, indique quién debía pagar el IBI ese año.' },
];

export default context => {
  const module = context.schemaModule({
    id: 'spanish-ibi', label, pluginId, category: 'expenses', fields, sections: [],
    validateData: data => {
      const errors = [];
      if (!data.assetId) errors.push('Seleccione una vivienda del plan.');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.noticePaymentDate ?? '') || data.noticePaymentDate.endsWith('-01-01')) {
        errors.push('Indique la fecha del recibo posterior al 1 de enero.');
      }
      return errors;
    },
    summarize: (data, model) => ({
      title: data.name,
      amount: new Intl.NumberFormat(model?.locale ?? 'en', { style: 'currency', currency: 'EUR' }).format(data.annualNoticeShare),
      detail: context.translate('Importe anual del hogar'),
    }),
  });
  const translations = Object.fromEntries(Object.entries(context.translations).map(([locale, messages]) =>
    [locale, { label: messages[label] ?? label }]));
  return { modules: [{ ...module, translations, usageModel: 'identity',
    sourceModule: { language: 'groovy-cashle-plugin', provider: pluginId, source: 'spanish-ibi.cashle' },
  }] };
};
