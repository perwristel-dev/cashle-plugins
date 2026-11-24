const provider = 'cashle.finance.pension.public.nl';
const label = 'label';
const dateField = { key: 'officialStart', kind: 'date', label: 'start', help: 'startHelp', default: '', required: false, forecastEditable: true };
const incomeFields = [{ kind: 'message', label: 'fixed' }, dateField];
const rightsFields = [
  { key: 'name', kind: 'text', label: 'name', default: label },
  { key: 'owner', kind: 'owner', label: 'owner', default: 'self' },
  { key: 'insurancePercent', kind: 'number', label: 'coverage', help: 'coverageHelp', unit: '%', default: 100, min: 0, max: 100 },
  { key: 'living', kind: 'select', label: 'living', default: 'alone', options: [['alone', 'alone'], ['together', 'together']] },
];

export default function createPlugin(context) {
  const { translate } = context;
  const income = context.schemaModule({ id: 'dutch-aow-pension-receipt', category: 'income', label: 'income', fields: incomeFields, sections: [] });
  const savings = context.schemaModule({
    id: 'dutch-aow-pension', label, category: 'accounts', financesTab: 'savings', fields: [...rightsFields, ...incomeFields], inlineFields: rightsFields, sections: [],
    creationData: () => ({ name: translate(label) }),
    creationConstraints: { finances: { individualOwners: true }, projections: { individualOwners: true } },
    engineInput: input => ({ input, timeReferences: [{ reference: 'life', personId: input.owner }] }),
    summarize: data => ({ title: data.name, amount: `${data.insurancePercent}%`, detail: translate('right') }),
  });
  return { modules: [{
    ...savings, pluginId: provider, usageModel: 'identity', translations: context.translations, acceptsDeposits: false, acceptsRemainder: false,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'dutch-aow-pension.cashle' },
    secondaryView: { category: 'income', label: () => translate('income'), editor: income.editor,
      summarize: data => ({ title: data.name, amount: data.officialStart || translate('statutory'), detail: translate('lifetime') }) },
  }] };
}
