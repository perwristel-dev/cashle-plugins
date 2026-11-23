const pluginId = 'cashle.finance.loan-repayment.annuity';
const label = 'Annuitet';

export function definition(ui, translate) {
  const { note } = ui.fields;
  const projectionNotice = 'Annuitet kräver att lånet stöder prognos av upplupen ränta för ränteberäkning.';
  const duplicateNotice = 'Lånet kan bara ha ett aktivt annuitetsflöde.';
  const projectionMissing = (data, model) => {
    const support = ui.scheduleSupport(data, model);
    return support !== null && support.annuityProjection !== true;
  };
  const anotherAnnuity = (data, model) => {
    const id = model?.editingEntry?.id;
    if (!id || !data.loanId || model.modules?.find(entry => entry.id === id)?.enabled === false) return false;
    return (model.modules ?? []).some(entry => {
      if (entry.enabled === false || entry.id === id) return false;
      const descriptor = ui.descriptorFor(model, entry.type, entry.version);
      return descriptor?.capabilities?.exclusiveAnnuity === true && descriptor.deleteWithModuleIds?.(entry.data, model)?.includes(data.loanId);
    });
  };
  return ui.createEditor({
    id: 'repayment-annuity', label, pluginId,
    fields: ui.termFields(), capabilities: { exclusiveAnnuity: true }, inheritFrequencyOnly: true,
    frequencyNotice: 'Annuitet kräver att lånet anger sin betalningsfrekvens.',
    notices: [
      note('Annuiteten betalas vid lånets ränteperiodslut och använder samma betalningsfrekvens som räntan.'),
      note(projectionNotice, { when: projectionMissing }),
      note(duplicateNotice, { when: anotherAnnuity }),
    ],
    monthlyAmortization: (data, debt) => Number(debt?.balance) / ui.termMonths(data),
    sectionSummary: () => translate(label),
    amountSummary: ui.termSummary,
    validate: (data, model) => [
      ...(projectionMissing(data, model) ? [projectionNotice] : []),
      ...(anotherAnnuity(data, model) ? [duplicateNotice] : []),
      ...ui.validateTerm(data, model),
    ],
  });
}

export default context => {
  const module = context.schemaModule(definition(context.repaymentUi(), context.translate));
  const translations = Object.fromEntries(Object.entries(context.translations).map(([locale, messages]) => [locale, { label: messages[label] ?? label }]));
  return { modules: [{
    ...module,
    editor: { ...module.editor, detailedSections: module.editor.detailedSections.map(section => ({ ...section, translateTitle: context.translate })) },
    translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider: pluginId, source: 'annuity.cashle' },
    usageModel: 'identity',
  }] };
};
