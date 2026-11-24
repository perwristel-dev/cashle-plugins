const provider = 'cashle.finance.property.is.stamp-duty';
const type = 'cashlab.icelandic-home-stamp-duty';

export default function createPlugin(context) {
  const { translate: t, casePlan, resolveTimeDate } = context;
  const homes = model => (model?.modules ?? []).filter(entry => {
    if (entry.enabled === false || entry.type !== 'cashlab.house') return false;
    const purchase = entry.data.purchaseDate;
    if (!purchase || ['before', 'never'].includes(purchase.reference)) return false;
    const plan = casePlan(model);
    const date = resolveTimeDate(purchase, { plan, profile: model?.profile });
    return !date || !plan?.from || date >= plan.from;
  });
  const fields = [
    { key: 'name', label: 'field.name', kind: 'text', default: 'Icelandic stamp duty' },
    { key: 'assetId', label: 'field.asset', kind: 'select', default: '', required: true, options: [['', 'option.asset']],
      optionsFor: (_data, model) => [['', 'option.asset'], ...homes(model).map(entry => [entry.id, entry.data.name])] },
    { key: 'valuation', label: 'field.valuation', kind: 'number', default: null, min: 1, required: true,
      unit: 'ISK', help: 'help.valuation', forecastEditable: true },
    { key: 'firstBuyerShare', label: 'field.firstBuyerShare', kind: 'number', default: 0, min: 0, max: 100,
      unit: '%', help: 'help.firstBuyerShare', forecastEditable: true },
  ];
  const module = context.schemaModule({
    id: 'icelandic-home-stamp-duty', category: 'expenses', label: 'label', fields, sections: [],
    availability: model => homes(model).length ? [] : [t('invalid.asset')],
    deleteWithModuleIds: data => data.assetId ? [data.assetId] : [],
    validateData(data, model) { return homes(model).some(entry => entry.id === data.assetId) ? [] : ['invalid.asset']; },
    validateLinks(model) {
      const ids = model.modules.filter(entry => entry.type === type && entry.enabled !== false).map(entry => entry.data.assetId);
      return new Set(ids).size < ids.length ? ['invalid.duplicate'] : [];
    },
    summarize(data, model) { return { title: data.name, detail: homes(model).find(entry => entry.id === data.assetId)?.data.name }; },
  });
  return { modules: [{ ...module, pluginId: provider, usageModel: 'identity', translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'icelandic-home-stamp-duty.cashle' },
  }] };
}
