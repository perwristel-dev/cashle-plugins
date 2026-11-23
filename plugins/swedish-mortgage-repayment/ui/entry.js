const pluginId = 'cashle.finance.loan-repayment.se';
const label = 'Svenskt amorteringskrav';
const type = 'cashlab.repayment-se';
const hasBasis = data => data.useBasisValue || data.useBasisDebt;
const isDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value;
};

export default context => {
  const { fields: { number, select, note } } = context.repaymentUi();
  const loans = (home, model) => context.relationTargetIds(model, home.id, 'asset-loan');
  const homes = (model, loanId) => (model?.modules ?? []).filter(entry => entry.category === 'real-assets' && entry.enabled !== false &&
    context.hasModuleCapability(model, entry.id, 'dwelling') &&
    (loanId ? loans(entry, model).includes(loanId) : loans(entry, model).length > 0));
  const editorLoan = model => model?.relatedEditor?.key === 'amortizationFlows' ? model.relatedEditor.parentId : undefined;
  const fields = [
    { key: 'name', kind: 'text', label: 'Namn', default: label },
    select('homeId', 'Bostad', [['', 'Välj bostad']], '', {
      optionsFor: (_data, model) => [['', 'Välj bostad'], ...homes(model, editorLoan(model)).map(entry => [entry.id, entry.data.name])],
    }),
    { key: 'autoDecrease', kind: 'check', label: 'Sänk amorteringen automatiskt när det går', default: false },
    { key: 'useBasisValue', kind: 'check', label: 'Ange amorteringsgrundande värde', default: false },
    number('basisValue', 'Amorteringsgrundande värde', 0, { unit: 'kr', exclusiveMin: true, when: data => data.useBasisValue }),
    { key: 'useBasisDebt', kind: 'check', label: 'Ange amorteringsgrundande skuld', default: false },
    number('basisDebt', 'Amorteringsgrundande skuld', 0, { unit: 'kr', when: data => data.useBasisDebt }),
    { key: 'basisDate', kind: 'text', label: 'Underlagets värderingsdatum (ÅÅÅÅ-MM-DD)', default: '', when: hasBasis },
    note('När underlaget saknas börjar prognosen med bostadens värde och de kopplade lånen.'),
  ];
  const descriptor = context.schemaModule({
    id: 'repayment-se', label, pluginId, category: 'flows', fields, sections: [],
    capabilities: { fundingGoal: true, amortizationFlow: true },
    availability: model => homes(model).length ? [] : [context.translate('Lägg först till en bostad med kopplade lån.')],
    amortizationDefaults: (loan, model) => ({ homeId: homes(model, loan.id)[0]?.id ?? '' }),
    relatedOwnerIds: (data, model) => context.relationTargetIds(model, data.homeId, 'asset-loan'),
    deleteWithModuleIds: data => data.homeId ? [data.homeId] : [],
    validateData: (data, model) => [
      ...(!data.homeId || !homes(model, editorLoan(model)).some(entry => entry.id === data.homeId)
        ? ['Välj en bostad med kopplade lån.'] : []),
      ...(hasBasis(data) && (!isDate(data.basisDate) || data.basisDate > context.casePlan(model).from)
        ? ['Ange värderingsdatumet senast vid planstart.'] : []),
      ...(model?.editingEntry?.id && (model.modules ?? []).some(entry => entry.enabled !== false && entry.type === type &&
        entry.id !== model.editingEntry?.id && entry.data.homeId === data.homeId)
        ? ['Bostaden har redan en plan för svenskt amorteringskrav.'] : []),
    ],
    engineInput: data => ({ input: {
      name: data.name, homeId: data.homeId, autoDecrease: data.autoDecrease,
      ...(data.useBasisValue ? { basisValue: data.basisValue } : {}),
      ...(data.useBasisDebt ? { basisDebt: data.basisDebt } : {}),
      ...(hasBasis(data) ? { basisDate: data.basisDate } : {}),
    } }),
    summarize: (data, model) => ({
      title: data.name,
      detail: (model?.modules ?? []).find(entry => entry.id === data.homeId)?.data.name ?? '',
    }),
  });
  const translations = Object.fromEntries(Object.entries(context.translations).map(([locale, messages]) =>
    [locale, { label: messages[label] ?? label }]));
  return { modules: [{ ...descriptor, translations, usageModel: 'identity',
    sourceModule: { language: 'groovy-cashle-plugin', provider: pluginId, source: 'swedish-mortgage-repayment.cashle' },
  }] };
};
