const provider = 'cashle.finance.property.gb.acquisition-tax';
const type = 'cashlab.uk-home-purchase-tax';
const england = data => data.jurisdiction === 'england-ni';
const treatments = [['standard', 'option.standard'], ['first-time', 'option.firstTime'], ['higher', 'option.higher']];

export default function createPlugin(context) {
  const { translate: t, casePlan, resolveTimeDate } = context;
  const homes = model => (model?.modules ?? []).filter(entry => {
    if (entry.enabled === false || entry.type !== 'cashlab.house') return false;
    const purchase = entry.data.purchaseDate;
    if (!purchase || purchase.reference === 'before' || purchase.reference === 'never') return false;
    const plan = casePlan(model);
    const date = resolveTimeDate(purchase, { plan, profile: model?.profile });
    return !date || (date >= '2025-04-01' && (!plan?.from || date >= plan.from));
  });
  const fields = [
    { key: 'name', label: 'field.name', kind: 'text', default: 'UK home purchase tax' },
    { key: 'assetId', label: 'field.asset', kind: 'select', default: '', required: true, options: [['', 'option.asset']],
      optionsFor: (_data, model) => [['', 'option.asset'], ...homes(model).map(entry => [entry.id, entry.data.name])] },
    { key: 'jurisdiction', label: 'field.jurisdiction', kind: 'select', default: 'england-ni', options: [
      ['england-ni', 'option.englandNi'], ['scotland', 'option.scotland'], ['wales', 'option.wales'],
    ] },
    { key: 'treatment', label: 'field.treatment', kind: 'select', default: 'standard', options: treatments,
      optionsFor: data => data.jurisdiction === 'wales' ? treatments.filter(([id]) => id !== 'first-time') : treatments,
      help: 'help.treatment', forecastEditable: true },
    { key: 'price', label: 'field.price', kind: 'number', default: null, min: 0.01, required: true,
      unit: 'GBP', help: 'help.price', forecastEditable: true },
    { key: 'nonResidentSurcharge', label: 'field.nonResident', kind: 'check', default: false, when: england,
      help: 'help.nonResident', forecastEditable: true },
  ];
  const module = context.schemaModule({
    id: 'uk-home-purchase-tax', category: 'expenses', label: 'label', fields, sections: [],
    availability: model => homes(model).length ? [] : [t('invalid.asset')],
    deleteWithModuleIds: data => data.assetId ? [data.assetId] : [],
    validateData(data, model) {
      const errors = [];
      if (!homes(model).some(entry => entry.id === data.assetId)) errors.push('invalid.asset');
      if (data.jurisdiction === 'wales' && data.treatment === 'first-time') errors.push('invalid.treatment');
      if (Number.isFinite(data.price) && Math.abs(data.price * 100 - Math.round(data.price * 100)) > 1e-7) errors.push('invalid.price');
      return errors;
    },
    validateLinks(model) {
      const ids = model.modules.filter(entry => entry.type === type && entry.enabled !== false).map(entry => entry.data.assetId);
      return new Set(ids).size < ids.length ? ['invalid.duplicate'] : [];
    },
    engineInput(data) { return { input: { ...data, nonResidentSurcharge: england(data) && data.nonResidentSurcharge === true } }; },
    summarize(data, model) {
      return { title: data.name, detail: homes(model).find(entry => entry.id === data.assetId)?.data.name };
    },
  });
  return { modules: [{ ...module, pluginId: provider, usageModel: 'identity', translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'home-purchase-tax.cashle' },
  }] };
}
