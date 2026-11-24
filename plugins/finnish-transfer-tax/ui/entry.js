const provider = 'cashle.finance.transfer-tax.fi';
const type = 'finnish-transfer-tax';
const dates = /^\d{4}-\d{2}-\d{2}$/;
const date = (key, extra = {}) => ({ key, label: 'field.' + key, kind: 'date', default: '', forecastEditable: true, ...extra });
const money = (key, extra = {}) => ({ key, label: 'field.' + key, kind: 'number', unit: 'EUR', min: 0, default: 0, ...extra });

export default function (context) {
  const t = context.translate;
  const fields = [
    { key: 'name', label: 'field.name', kind: 'text', default: t('label') },
    { key: 'property', label: 'field.property', kind: 'select', default: 'existing-shares-broker', options: [
      ['existing-shares-broker', 'kind.broker'], ['existing-shares-private', 'kind.private'],
      ['new-housing-shares', 'kind.new'], ['real-estate', 'kind.land'],
    ] },
    date('deedDate', { required: true }),
    date('ownershipDate', { when: data => data.property === 'new-housing-shares', required: true, preserveWhenInactive: true }),
    date('paymentDate', { when: data => data.property !== 'existing-shares-broker', preserveWhenInactive: true, help: 'help.payment' }),
    money('purchasePrice', { min: 0, exclusiveMin: true, help: 'help.purchase' }),
    money('companyDebt', { when: data => data.property !== 'real-estate', preserveWhenInactive: true, help: 'help.companyDebt' }),
    { key: 'buyerShare', label: 'field.buyerShare', kind: 'number', unit: '%', min: 0, exclusiveMin: true, max: 100, default: 100 },
  ];
  const module = context.schemaModule({
    id: type, category: 'expenses', financesTab: 'expenses', label: 'label', fields, sections: [], help: 'help.scope',
    validateData(data) {
      if (!dates.test(data.deedDate) || data.deedDate < '2024-01-01') return ['invalid.deed'];
      if (data.property === 'new-housing-shares' && (!dates.test(data.ownershipDate) || data.ownershipDate < data.deedDate))
        return ['invalid.ownership'];
      const reference = data.property === 'new-housing-shares' ? data.ownershipDate : data.deedDate;
      if (data.property !== 'existing-shares-broker' && data.paymentDate && (!dates.test(data.paymentDate) || data.paymentDate < reference))
        return ['invalid.payment'];
      return [];
    },
    engineInput(data) {
      return { input: { ...data, paymentDate: data.property === 'existing-shares-broker' ? '' : data.paymentDate } };
    },
    summarize: data => ({ title: data.name, detail: data.deedDate }),
  });
  return { modules: [{
    ...module, pluginId: provider, translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'finnish-transfer-tax.cashle' },
  }] };
}
