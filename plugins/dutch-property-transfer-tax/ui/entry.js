const provider = 'cashle.finance.property.nl.transfer-tax';
const type = 'cashlab.dutch-property-transfer-tax';
const ownerOccupied = data => data.use === 'owner-occupied';
const hasExemptBuyers = data => ownerOccupied(data) && data.starterExemptShare > 0;

export default function createPlugin(context) {
  const { translate: t, casePlan, resolveTimeDate } = context;
  const eligibleHomes = model => (model?.modules ?? []).filter(entry => {
    const time = entry.data.purchaseDate;
    if (entry.type !== 'cashlab.house' || entry.enabled === false || !time || ['before', 'never'].includes(time.reference)) return false;
    const plan = casePlan(model);
    const day = resolveTimeDate(time, { plan, profile: model?.profile });
    return !day || (day >= '2026-01-01' && day >= plan.from);
  });
  const module = context.schemaModule({
    id: 'dutch-property-transfer-tax', category: 'expenses', label: 'label',
    availability: model => eligibleHomes(model).length ? [] : [t('invalid.asset')],
    capabilities: { requiredExpense: true }, fields: [
      { key: 'name', kind: 'text', label: 'field.name', default: t('label') },
      { key: 'assetId', kind: 'select', label: 'field.asset', default: '', options: [['', 'option.selectAsset']],
        optionsFor: (_data, model) => [['', 'option.selectAsset'], ...eligibleHomes(model).map(home => [home.id, home.data.name])] },
      { key: 'taxableValueEur', kind: 'number', label: 'field.value', default: 0, min: 0, unit: 'EUR',
        forecastEditable: true, help: 'help.value' },
      { key: 'use', kind: 'select', label: 'field.use', default: 'owner-occupied', forecastEditable: true,
        options: [['owner-occupied', 'option.main'], ['other-residential', 'option.other']] },
      { key: 'starterExemptShare', kind: 'number', label: 'field.starter', default: 0, min: 0, max: 100, unit: '%',
        when: ownerOccupied, preserveWhenInactive: true, forecastEditable: true, help: 'help.starter' },
      { key: 'starterConfirmed', kind: 'check', label: 'field.verified', default: false, when: hasExemptBuyers,
        preserveWhenInactive: true, forecastEditable: true },
    ], sections: [],
    deleteWithModuleIds: data => data.assetId ? [data.assetId] : [],
    validateData(data, model) {
      const errors = [];
      if (!eligibleHomes(model).some(home => home.id === data.assetId)) errors.push('invalid.asset');
      if (!(data.taxableValueEur > 0)) errors.push('invalid.value');
      if (hasExemptBuyers(data) && data.starterConfirmed !== true) errors.push('invalid.starter');
      return errors;
    },
    validateLinks(model) {
      const assets = model.modules.filter(entry => entry.type === type && entry.enabled !== false).map(entry => entry.data.assetId);
      return new Set(assets).size < assets.length ? ['invalid.duplicate'] : [];
    },
    engineInput(data) {
      return { input: ownerOccupied(data) ? data : { ...data, starterExemptShare: 0 } };
    },
    summarize(data, model) {
      const taxableFraction = hasExemptBuyers(data) && data.starterConfirmed === true && data.taxableValueEur <= 555000
        ? 1 - data.starterExemptShare / 100 : 1;
      const amount = new Intl.NumberFormat(context.language, { style: 'currency', currency: 'EUR' })
        .format(data.taxableValueEur * taxableFraction * (ownerOccupied(data) ? .02 : .08));
      const home = model?.modules?.find(entry => entry.id === data.assetId);
      return { title: data.name, amount, detail: home?.data.name };
    },
  });
  return { modules: [{ ...module, pluginId: provider, translations: context.translations, usageModel: 'identity',
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'dutch-property-transfer-tax.cashle' },
  }] };
}
