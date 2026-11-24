const provider = 'cashle.finance.expense.it.imu';

export default function (context) {
  const t = context.translate;
  const module = context.schemaModule({
    id: 'italian-imu', pluginId: provider, category: 'expenses', label: 'label',
    fields: [
      { key: 'name', kind: 'text', label: 'name', default: t('label') },
      { key: 'taxYear', kind: 'number', label: 'year', default: 2026, min: 2020, max: 9800, integer: true },
      { key: 'advance', kind: 'number', label: 'advance', default: 0, min: 0, unit: 'EUR', help: 'notice' },
      { key: 'balance', kind: 'number', label: 'balance', default: 0, min: 0, unit: 'EUR', help: 'balanceHelp' },
      { key: 'repeatThrough', kind: 'number', label: 'repeat', default: 0, min: 0, max: 9800, integer: true,
        help: 'repeatHelp', forecastEditable: true },
    ],
    sections: [{
      id: 'financing', title: 'financing', fields: context.savingsFundingFields('imu'),
      summary: data => context.savingsFundingSummary(data, 'imu'),
    }],
    validateData: data => data.repeatThrough !== 0 && data.repeatThrough < data.taxYear ? ['invalidYears'] : [],
    engineInput: data => ({ input: data }),
    summarize(data, model) {
      const amount = new Intl.NumberFormat(model?.profile?.locale ?? context.language, {
        currency: 'EUR', style: 'currency',
      }).format(data.advance + data.balance);
      return { title: data.name, amount, detail: t('summary', { year: data.taxYear }) };
    },
  });
  return { modules: [{
    ...module, translations: context.translations, usageModel: 'identity',
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'italian-imu.cashle' },
  }] };
}
