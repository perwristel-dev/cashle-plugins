const pluginId = 'cashle.finance.fr-reference-budget';
const label = 'Budget de référence du CNLE hors logement';
const archetypes = [
  ['working-single', 'Actif seul'],
  ['working-couple', 'Couple d’actifs sans enfant'],
  ['working-couple-children', 'Couple d’actifs avec deux enfants de 11 à 17 ans'],
  ['retired-single', 'Retraité seul'],
  ['retired-couple', 'Couple de retraités'],
];
const territories = [['rural', 'Milieu rural'], ['town', 'Ville moyenne'], ['paris', 'Métropole du Grand Paris']];
const fields = [
  { key: 'name', kind: 'text', label: 'Nom', default: label },
  { key: 'archetype', kind: 'select', label: 'Ménage de référence', default: 'working-single', options: archetypes, forecastEditable: true },
  { key: 'territory', kind: 'select', label: 'Territoire', default: 'town', options: territories, forecastEditable: true },
  { kind: 'message', label: 'Paniers du CNLE de 2018 revalorisés aux prix de 2025.' },
];

export default context => {
  const module = context.schemaModule({
    id: 'french-reference-budget', label, pluginId, category: 'expenses', fields, sections: [],
    summarize: data => ({ title: data.name, detail: context.translate(territories.find(([id]) => id === data.territory)?.[1] ?? label) }),
  });
  const translations = Object.fromEntries(Object.entries(context.translations).map(([locale, messages]) => [locale, { label: messages[label] ?? label }]));
  return { modules: [{ ...module, translations, usageModel: 'identity',
    sourceModule: { language: 'groovy-cashle-plugin', provider: pluginId, source: 'french-reference-budget.cashle' },
  }] };
};
