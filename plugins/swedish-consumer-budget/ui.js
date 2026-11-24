const PROVIDER = 'cashle.finance.budget.se';
const sourceModule = { language: 'groovy-cashle-plugin', provider: PROVIDER, source: 'consumer-budget.cashle' };

const check = (key, label, value, options) => ({ key, label, kind: 'check', default: value, ...options });
const text = (key, label, value) => ({ key, label, kind: 'text', default: value });
const number = (key, label, value, options) => ({ key, label, kind: 'number', default: value, ...options });
const section = (id, title, fields, summary, options) => ({ id, title, fields, summary, ...options });

export const consumerBudgetCategoryLabels = [
  ['food', 'Mat'], ['clothing', 'Kläder och skor'], ['leisure', 'Fritid'],
  ['personal_hygiene', 'Personlig hygien'], ['mobile_phone', 'Mobiltelefon'],
  ['child_insurance', 'Barnförsäkring'], ['child_equipment', 'Barnutrustning'],
  ['consumables', 'Förbrukningsvaror'], ['home_equipment', 'Hemutrustning'],
  ['internet_subscription', 'Internet och mobilabonnemang'], ['media', 'Medietjänster'],
  ['electricity', 'Hushållsel'], ['water_sewer', 'Vatten och avlopp'], ['home_insurance', 'Hemförsäkring'],
];

export function budgetInput(data) {
  const input = { ...data };
  delete input.baseNecessary;
  delete input.childEvents;
  delete input.selfDeathDate;
  delete input.partnerDeathDate;
  delete input.partnerSeparationDate;
  for (const [category] of consumerBudgetCategoryLabels) delete input[`category_${category}Necessary`];
  return input;
}

const lifeReferences = plan => (plan?.milestones ?? [])
  .filter(row => row.builtin === 'life' && ['self', 'partner'].includes(row.personId))
  .map(row => ({ reference: 'life', personId: row.personId }));

export function consumerBudgetEngineInput(data, context) {
  return { input: budgetInput(data), timeReferences: lifeReferences(context?.model?.plan) };
}

/** Submit entered household facts and resolved residence dates to the selected engine provider. */
export function consumerBudgetReferenceInput(model, context) {
  const plan = context.casePlan(model);
  const changes = context.sourceResidenceChanges(model);
  const dates = { plan, profile: model.profile };
  const lifeEnds = Object.fromEntries(lifeReferences(plan).map(time =>
    [time.personId, context.resolveTimeDate(time, dates)]));
  return { profile: structuredClone(model.profile), date: plan.from, language: context.language, lifeEnds,
    residenceChanges: changes.map(change => ({ ...change,
      date: context.resolveTimeDate(change.at, dates) })) };
}

export function consumerBudgetDefinition(context) {
  const { sourceResidenceChanges, savingsFundingFields, savingsFundingSummary, translate: expenseText } = context;
  const hasSwedishConsumerBudgetResidence = model => model?.profile?.tax?.country === 'SE' || sourceResidenceChanges(model).some(change => (!change.owner || change.owner === 'joint' || change.owner === 'self') && change.settings?.country === 'SE');
  const budgetPolicySection = (prefix, title, when) => {
    const overspending = prefix === 'extra';
    const fields = savingsFundingFields(prefix);
    if (overspending) fields.unshift(check('extraNecessary', 'Nödvändig kostnad', false, { preserveWhenInactive: true, compactCostLabel: title }));
    return section(`budget-${prefix}`, title, fields, data => {
      const funding = savingsFundingSummary(data, prefix);
      return overspending ? `${expenseText(data.extraNecessary ? 'Nödvändig' : 'Valfri')} · ${funding}` : funding;
    }, { when, titleFor: () => expenseText(title) });
  };
  const consumerBudget = {
    engineReferences:[{key:'consumerBudgetReference',provider:PROVIDER,operation:'reference',input: model => consumerBudgetReferenceInput(model, context)}],
    id: 'consumer-budget', label: 'Budget enligt Konsumentverket', category: 'expenses', taxCountries: ['SE'],
    capabilities: { consumerBudget: true },
    availability: model => hasSwedishConsumerBudgetResidence(model) ? [] : [expenseText('Budget enligt Konsumentverket kräver svensk skattehemvist.')],
    normalizeData: data => ({ splitCategories: false, ...budgetInput(data) }),
    validateData: (data, context) => {
      if (typeof data.splitCategories !== 'boolean') return [expenseText('Välj hur grundbudgeten ska redovisas.')];
      const profile = context?.profile;
      if (profile) {
        if (!hasSwedishConsumerBudgetResidence(context)) return [expenseText('Budget enligt Konsumentverket kräver svensk skattehemvist under någon del av planen.')];
        const withPartner = profile.mode === 'couple' || (profile.mode === 'household' && profile.household?.hasPartner);
        const people = (profile.people ?? []).filter(person => person.id === 'self' || (withPartner && person.id === 'partner'));
        if (!people.some(person => person.id === 'self') || (withPartner && !people.some(person => person.id === 'partner')) || people.some(person => !Number.isInteger(person.birthYear) || !Number.isInteger(person.birthMonth) || person.birthMonth < 1 || person.birthMonth > 12)) return [expenseText('Ange födelseår och födelsemånad i hushållsprofilen för vuxna i budgeten.')];
      }
      return [];
    },
    fields: [
      text('name', 'Namn', 'Budget enligt Konsumentverket'),
      number('extraPercent', 'Avvikelse från Konsumentverkets budget', 0, { min: -100, unit: '%' }),
      check('splitCategories', 'Redovisa grundbudgeten per kategori', false),
    ],
    sections: [section('included-categories', 'Kostnader som ingår', consumerBudgetCategoryLabels.map(([key, label]) => check(`include_${key}`, label, true, { preserveWhenInactive: true })), () => expenseText('Välj vilka kostnader budgeten ska omfatta')),
    budgetPolicySection('base', 'Grundbudget', data => !data.splitCategories),
    ...consumerBudgetCategoryLabels.map(([key, label]) => budgetPolicySection(`category_${key}`, label, data => data.splitCategories)),
    budgetPolicySection('extra', 'Överkonsumtion', data => data.extraPercent > 0)],
    engineInput: (data, inputContext) => consumerBudgetEngineInput(data, inputContext),
    summarize: data => ({ title: data.name, amount: expenseText('{percent} % extra', { percent: data.extraPercent }), detail: expenseText('Månadsvis · Konsumentverkets budget') }),
  };
  consumerBudget.inlineFields = [
    ...consumerBudget.fields,
    ...consumerBudget.sections.filter(item => item.id.startsWith('budget-') && item.id !== 'budget-info').flatMap(item =>
      item.fields.map(field => ({ ...field, label: field.label, translate: key => key === field.label
          ? expenseText('{section}: {field}', { section: expenseText(item.title), field: expenseText(field.label) }) : expenseText(key),
        when: (data, context) => (!item.when || item.when(data, context)) && (!field.when || field.when(data, context)) }))),
  ];
  return consumerBudget;
}

export function createBudgetPlugin(context) {
  const module = context.schemaModule(consumerBudgetDefinition(context));
  return { ...module, pluginId: PROVIDER, sourceModule, usageModel: 'identity', translations: context.translations };
}

export default function (context) {
  return { modules: [createBudgetPlugin(context)] };
}
