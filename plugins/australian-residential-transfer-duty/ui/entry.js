const provider = 'cashle.finance.residential-transfer-duty.au';
const type = 'australian-residential-transfer-duty';
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const availableHomes = model => (model?.modules ?? []).filter(entry => entry.type === 'cashlab.house' && entry.enabled !== false &&
  ['now', 'date'].includes(entry.data?.purchaseDate?.reference) && (entry.data?.usage ?? 'primary') === 'primary' && !entry.data?.cancellationEnabled);
const findHouse = (data, model) => availableHomes(model).find(entry => entry.id === data.propertyId)?.data;
const date = (key, extra = {}) => ({ key, label: 'field.' + key, kind: 'date', default: '', forecastEditable: true, ...extra });

export default function (context) {
  const t = context.translate;
  const settlement = (data, model) => {
    if (!data.propertyId) return data.settlementDate;
    const home = findHouse(data, model);
    if (!home) return null;
    return context.resolveTimeDate(home.purchaseDate, { plan: context.casePlan(model), profile: model?.profile });
  };
  const fields = [
    { key: 'name', label: 'field.name', kind: 'text', default: t('label') },
    { key: 'jurisdiction', label: 'field.jurisdiction', kind: 'select', default: 'NSW',
      options: [['NSW', 'jurisdiction.nsw'], ['VIC', 'jurisdiction.victoria']] },
    { key: 'propertyId', label: 'field.propertyId', kind: 'select', default: '',
      options: [['', 'property.manual']], optionsFor: (_data, model) => [
        ['', 'property.manual'], ...availableHomes(model).map(entry => [entry.id, entry.data.name || entry.id]),
      ], help: 'help.property' },
    date('contractDate', { required: true }),
    date('settlementDate', { when: data => !data.propertyId, preserveWhenInactive: true, required: true }),
    { key: 'dutiableValueAud', label: 'field.value', kind: 'number', unit: 'AUD', min: 0, default: 0, help: 'help.value' },
    { key: 'victorianPrincipalResidence', label: 'field.victorianPrincipalResidence', kind: 'check', default: false,
      when: data => data.jurisdiction === 'VIC', preserveWhenInactive: true, help: 'help.victorianPrincipalResidence' },
    { key: 'standardPurchaseConfirmed', label: 'field.standardPurchaseConfirmed', kind: 'check', default: false, help: 'help.standard' },
  ];
  const module = context.schemaModule({
    id: type, category: 'expenses', financesTab: 'expenses', label: 'label', fields, sections: [],
    validateData(data, model) {
      const errors = [];
      if (!data.standardPurchaseConfirmed) errors.push('invalid.profile');
      const earliest = data.jurisdiction === 'NSW' ? '2025-07-01' : '2021-07-01';
      if (!validDate(data.contractDate) || data.contractDate < earliest) errors.push('invalid.contract');
      const close = settlement(data, model);
      if (!validDate(close) || close < data.contractDate) errors.push('invalid.settlement');
      const home = findHouse(data, model);
      if (data.propertyId && (!home || close < context.casePlan(model).from)) errors.push('invalid.property');
      if (data.propertyId ? !(Number.isFinite(home?.purchasePrice) && home.purchasePrice > 0) : data.dutiableValueAud <= 0)
        errors.push('invalid.amount');
      return errors;
    },
    validateLinks(model) {
      const duties = (model?.modules ?? []).filter(row => row.type === `cashlab.${type}` && row.enabled !== false && row.data.propertyId);
      return new Set(duties.map(row => row.data.propertyId)).size < duties.length ? ['invalid.duplicate'] : [];
    },
    engineInput(data, { model }) {
      const home = findHouse(data, model);
      return { input: { ...data, settlementDate: settlement(data, model) ?? '', linkedPurchasePrice: home?.purchasePrice ?? 0,
        linkedPurchaseBasis: home?.purchaseBasis === 'real' ? 'real' : 'nominal',
        victorianPrincipalResidence: data.jurisdiction === 'VIC' && data.victorianPrincipalResidence } };
    },
    summarize: data => ({ title: data.name, detail: t(data.jurisdiction === 'VIC' ? 'jurisdiction.victoria' : 'jurisdiction.nsw') }),
  });
  return { modules: [{
    ...module, pluginId: provider, translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'australian-residential-transfer-duty.cashle' },
  }] };
}
