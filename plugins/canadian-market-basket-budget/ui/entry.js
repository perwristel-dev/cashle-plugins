import regions from './regions.js';
const provider = 'cashle.finance.budget.ca';
const type = 'canadian-market-basket-budget';
const categories = ['food', 'clothing', 'transport', 'communications', 'other', 'inuusiqattiarniq'];

export default function (context) {
  const t = context.translate;
  const fields = [
    { key: 'name', label: 'field.name', kind: 'text', default: t('label') },
    { key: 'region', label: 'field.region', kind: 'select', default: '', options: [['', 'select.region'], ...regions] },
    { key: 'householdSize', label: 'field.householdSize', kind: 'number', default: 4, min: 1, max: 20, integer: true },
  ];
  const included = categories.map(key => ({
    key: 'include_' + key, label: 'component.' + key, kind: 'check', default: true,
    ...(key === 'inuusiqattiarniq' ? { when: data => regions.some(([id, name]) => id === data.region && name.startsWith('Nunavut,')),
      preserveWhenInactive: true } : {}),
  }));
  const module = context.schemaModule({
    id: type, category: 'expenses', financesTab: 'expenses', label: 'label', fields, help: 'help.budget',
    sections: [{ id: 'components', title: t('section.components'), fields: included }],
    validateData: data => regions.some(([id]) => id === data.region) ? [] : ['invalid.region'],
    validateLinks: model => model.modules.filter(row => row.type === `cashlab.${type}` && row.enabled !== false).length > 1
      ? ['invalid.duplicate'] : [],
    engineInput: data => ({ input: data }),
    summarize: data => ({ title: data.name, detail: regions.find(([id]) => id === data.region)?.[1] || t('select.region') }),
  });
  return { modules: [{
    ...module, pluginId: provider, translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'canadian-market-basket-budget.cashle' },
  }] };
}
