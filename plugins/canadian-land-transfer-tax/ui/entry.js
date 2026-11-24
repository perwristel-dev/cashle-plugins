const provider = 'cashle.finance.land-transfer-tax.ca';
const type = 'canadian-land-transfer-tax';
const canadaMoney = (key, extra = {}) => ({ key, label: 'field.' + key, kind: 'number', unit: 'CAD', min: 0, default: 0, ...extra });
const rebate = (key, when) => ({ key, label: 'field.' + key, kind: 'number', unit: '%', min: 0, max: 100, default: 0, when,
  preserveWhenInactive: true, help: 'help.refund' });
const ordinary = data => data.jurisdiction !== 'AB';
const toronto = data => data.jurisdiction === 'Toronto';

export default function (context) {
  const t = context.translate;
  const fields = [
    { key: 'name', label: 'field.name', kind: 'text', default: t('label') },
    { key: 'jurisdiction', label: 'field.jurisdiction', kind: 'select', default: 'ON',
      options: [['ON', 'region.ontario'], ['Toronto', 'region.toronto'], ['AB', 'region.alberta']] },
    { key: 'closingDate', label: 'field.closingDate', kind: 'date', default: '', required: true, forecastEditable: true },
    canadaMoney('consideration', { min: 0.01, help: 'help.consideration' }),
    { key: 'oneOrTwoHomes', label: 'field.oneOrTwoHomes', kind: 'check', default: true, when: ordinary },
    rebate('provinceRefundShare', ordinary), rebate('torontoRefundShare', toronto),
    canadaMoney('mortgagePrincipal', { when: data => !ordinary(data), preserveWhenInactive: true, help: 'help.mortgage' }),
  ];
  const module = context.schemaModule({
    id: type, category: 'expenses', financesTab: 'expenses', label: 'label', fields, sections: [], help: 'help.scope',
    validateData(data) {
      const minimum = { AB: '2024-10-20', Toronto: '2026-04-01', ON: '2017-01-01' }[data.jurisdiction];
      return /^\d{4}-\d{2}-\d{2}$/.test(data.closingDate) && data.closingDate >= minimum ? [] : ['invalid.date'];
    },
    engineInput: data => ({ input: data }),
    summarize: data => ({ title: data.name, detail: data.closingDate }),
  });
  return { modules: [{
    ...module, pluginId: provider, translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'canadian-land-transfer-tax.cashle' },
  }] };
}
