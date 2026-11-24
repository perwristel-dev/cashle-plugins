const provider = 'cashle.finance.budget.de';
const type = 'cashlab.german-regelbedarf';
const integer = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;

export default function createPlugin(context) {
  const { translate: t, savingsFundingFields, savingsFundingSummary } = context;
  const module = context.schemaModule({
    id: 'german-regelbedarf', category: 'expenses', label: 'label',
    fields: [{ key: 'name', label: 'field.name', kind: 'text', default: 'label' }],
    sections: [{ id: 'funding', title: 'funding', fields: savingsFundingFields('minimum'),
      summary: data => savingsFundingSummary(data, 'minimum') }],
    validateData(data, model) {
      const profile = model?.profile;
      const mode = profile?.mode ?? 'individual';
      const people = profile?.people ?? [];
      const household = profile?.household;
      const hasPartner = mode === 'couple' || (mode === 'household' && household?.hasPartner === true);
      if (!['individual', 'couple', 'household'].includes(mode) || !people.some(person => person.id === 'self') ||
          (hasPartner && !people.some(person => person.id === 'partner'))) return ['invalid.household'];
      const children = mode === 'household' ? household?.children : [];
      if (!Array.isArray(children) || children.some(child => !integer(child?.birthYear, 1900, 9998) ||
          !integer(child.birthMonth ?? 1, 1, 12) || !['full', 'half'].includes(child.residence)))
        return ['invalid.children'];
      return [];
    },
    validateLinks(model) {
      return model.modules.filter(entry => entry.type === type && entry.enabled !== false).length > 1
        ? ['invalid.duplicate'] : [];
    },
    engineInput(data, { model } = {}) {
      const timeReferences = (model?.plan?.milestones ?? [])
        .filter(row => row.builtin === 'life' && ['self', 'partner'].includes(row.personId))
        .map(row => ({ reference: 'life', personId: row.personId }));
      return { input: data, timeReferences };
    },
    summarize(data) {
      return { title: data.name, detail: t('summary.detail') };
    },
  });
  return { modules: [{ ...module, pluginId: provider, usageModel: 'identity', translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'german-regelbedarf.cashle' } }] };
}
