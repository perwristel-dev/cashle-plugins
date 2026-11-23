const pluginId = 'cashle.finance.loan-repayment.straight';
const label = 'Rak amortering';

export function definition(ui, translate) {
  return ui.createEditor({
    id: 'repayment-straight', label, pluginId,
    fields: ui.termFields(),
    monthlyAmortization: (data, debt) => Number(debt?.balance) / ui.termMonths(data),
    sectionSummary: () => translate(label),
    amountSummary: ui.termSummary, validate: ui.validateTerm,
  });
}

export default context => {
  const module = context.schemaModule(definition(context.repaymentUi(), context.translate));
  const translations = Object.fromEntries(Object.entries(context.translations).map(([locale, messages]) => [locale, { label: messages[label] ?? label }]));
  return { modules: [{
    ...module,
    editor: { ...module.editor, detailedSections: module.editor.detailedSections.map(section => ({ ...section, translateTitle: context.translate })) },
    translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider: pluginId, source: 'straight.cashle' },
    usageModel: 'identity',
  }] };
};
