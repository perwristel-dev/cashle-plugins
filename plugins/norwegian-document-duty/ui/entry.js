const provider = 'cashle.finance.document-duty.no';
const transferTypes = ['realProperty', 'cooperative'];
const applies = data => data.transferType === 'realProperty';
const validDate = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const validValue = value => Number.isFinite(value) && value >= 0;
const duty = value => Math.max(250, Math.floor(Math.floor(value / 1000) * 2.5) * 10);
const projectedPayment = data => {
  if (data.paymentDate) return validDate(data.paymentDate) ? data.paymentDate : null;
  if (!validDate(data.registrationDate)) return null;
  const date = new Date(data.registrationDate + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + 14);
  return date.toISOString().split('T')[0];
};

export default function createPlugin(context) {
  const { translate: t, savingsFundingFields, savingsFundingSummary } = context;
  const module = context.schemaModule({
    id: 'norwegian-document-duty', category: 'expenses', label: 'label',
    fields: [
      { key: 'name', label: 'field.name', kind: 'text', default: 'label' },
      { key: 'transferType', label: 'field.transfer', kind: 'select', default: 'realProperty',
        options: transferTypes.map(type => [type, 'option.' + type]), forecastEditable: true },
      { key: 'marketValueNok', label: 'field.marketValue', kind: 'number', default: null, min: 0,
        unit: 'unit.nok', help: 'help.marketValue', when: applies, preserveWhenInactive: true, forecastEditable: true },
      { key: 'registrationDate', label: 'field.registration', kind: 'date', default: '',
        when: applies, preserveWhenInactive: true, forecastEditable: true },
      { key: 'paymentDate', label: 'field.payment', kind: 'date', default: '', help: 'help.payment',
        when: applies, preserveWhenInactive: true, forecastEditable: true },
    ],
    sections: [{ id: 'funding', title: 'funding', fields: savingsFundingFields('documentDuty'),
      summary: data => savingsFundingSummary(data, 'documentDuty'), when: applies }],
    validateData(data) {
      if (!transferTypes.includes(data.transferType)) return ['invalid.transfer'];
      if (!applies(data)) return [];
      const errors = [];
      if (!validValue(data.marketValueNok)) errors.push('invalid.amount');
      if (!validDate(data.registrationDate) || data.registrationDate < '2026-01-01') errors.push('invalid.registration');
      if (data.paymentDate && (!validDate(data.paymentDate) || data.paymentDate < data.registrationDate))
        errors.push('invalid.payment');
      return errors;
    },
    engineInput(data) {
      const { marketValueNok, ...input } = data;
      input.paymentDate ??= '';
      if (validValue(marketValueNok)) input.marketValueNok = marketValueNok;
      return { input };
    },
    summarize(data) {
      if (data.transferType === 'cooperative') return { title: data.name, detail: t('summary.cooperative') };
      const date = projectedPayment(data);
      const value = validValue(data.marketValueNok) ? duty(data.marketValueNok) : null;
      const amount = value === null ? undefined : t('summary.amount',
        { amount: new Intl.NumberFormat(context.language).format(value) });
      return { title: data.name, amount, detail: date ? t('summary.payment', { date }) : undefined };
    },
  });
  return { modules: [{ ...module, pluginId: provider, usageModel: 'identity', translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'norwegian-document-duty.cashle' } }] };
}
