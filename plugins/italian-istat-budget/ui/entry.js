import { regions, households } from './choices.js';

const provider = 'cashle.finance.budget.it.istat';
const regionOptions = [['', 'choose'], ...regions.map(([code, label]) => [code, label])];
const municipalitiesFor = region => regions.find(([code]) => code === region)?.[2] ?? [];

export default function (context) {
  const t = context.translate;
  const module = context.schemaModule({
    id: 'italian-istat-budget', pluginId: provider, category: 'expenses', label: 'label',
    taxCountries: ['IT'], help: 'help',
    fields: [
      { key: 'name', kind: 'text', label: 'name', default: t('label') },
      { key: 'region', kind: 'select', label: 'region', default: '', options: regionOptions },
      { key: 'municipality', kind: 'select', label: 'municipality', default: '',
        options: [['', 'choose']], when: data => Boolean(data.region),
        optionsFor: data => [['', t('choose')], ...municipalitiesFor(data.region).map(size => [size, t(size)])] },
      { key: 'householdType', kind: 'select', label: 'household', default: '',
        options: [['', 'choose'], ...households], help: 'householdHelp' },
    ],
    sections: [{
      id: 'financing', title: 'financing', fields: context.savingsFundingFields('basket'),
      summary: data => context.savingsFundingSummary(data, 'basket'),
    }],
    validateData(data) {
      return municipalitiesFor(data.region).includes(data.municipality) &&
        households.some(([code]) => code === data.householdType) ? [] : ['invalid'];
    },
    engineInput: data => ({ input: data }),
    summarize: data => ({ title: data.name, detail: t('summary') }),
  });
  return { modules: [{
    ...module, translations: context.translations, usageModel: 'identity',
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'italian-istat-budget.cashle' },
  }] };
}
