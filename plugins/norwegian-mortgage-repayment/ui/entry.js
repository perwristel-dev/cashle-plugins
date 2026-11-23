const pluginId = 'cashle.finance.loan-repayment.no';
const type = 'cashlab.repayment-no';
const label = 'Norskt amorteringskrav';

const isDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value;
};

export default context => {
  const { fields: { number, select, note } } = context.repaymentUi();
  const editorLoan = model => model?.relatedEditor?.key === 'amortizationFlows' ? model.relatedEditor.parentId : undefined;
  const loanIds = (homeId, model) => context.relationTargetIds(model, homeId, 'asset-loan')
    .filter(id => !context.hasModuleCapability(model, id, 'creditFacility'));
  const homes = (model, loan = editorLoan(model)) => (model?.modules ?? []).filter(entry =>
    entry.category === 'real-assets' && entry.enabled !== false &&
    context.hasModuleCapability(model, entry.id, 'dwelling') &&
    (loan ? loanIds(entry.id, model).includes(loan) : loanIds(entry.id, model).length > 0));
  const loans = (data, model) => {
    const selectedLoan = editorLoan(model);
    return loanIds(data.homeId, model).filter(id => !selectedLoan || id === selectedLoan);
  };
  const fields = [
    { key: 'name', kind: 'text', label: 'Namn', default: label },
    select('homeId', 'Bostad', [['', 'Välj bostad']], '', {
      optionsFor: (_data, model) => [['', 'Välj bostad'], ...homes(model).map(entry => [entry.id, entry.data.name])],
    }),
    select('loanId', 'Bolån', [['', 'Välj bolån']], '', {
      optionsFor: (data, model) => [
        ['', 'Välj bolån'],
        ...loans(data, model).map(id => [id, (model?.modules ?? []).find(entry => entry.id === id)?.data.name ?? id]),
      ],
    }),
    { key: 'useLenderValue', kind: 'check', label: 'Ange bankens värdering', default: false },
    number('lenderValue', 'Bankens värdering', 0, { unit: 'NOK', exclusiveMin: true, when: data => data.useLenderValue }),
    { key: 'useGrantedAmount', kind: 'check', label: 'Ange beviljat lånebelopp', default: false },
    number('grantedAmount', 'Beviljat lånebelopp', 0, { unit: 'NOK', exclusiveMin: true, when: data => data.useGrantedAmount }),
    { key: 'grantedDate', kind: 'text', label: 'Datum då lånet beviljades (ÅÅÅÅ-MM-DD)', default: '' },
    note('Med tomma underlag använder prognosen bostadens värde samt lånets ingående saldo och startdatum.'),
  ];
  const descriptor = context.schemaModule({
    id: 'repayment-no', label, pluginId, category: 'flows', fields, sections: [],
    capabilities: { fundingGoal: true, amortizationFlow: true },
    availability: model => homes(model).length ? [] : [context.translate('Lägg först till en bostad med kopplade lån.')],
    amortizationDefaults: (loan, model) => ({ loanId: loan.id, homeId: homes(model, loan.id)[0]?.id ?? '' }),
    relatedOwnerIds: data => data.loanId ? [data.loanId] : [],
    deleteWithModuleIds: data => [data.homeId, data.loanId].filter(Boolean),
    validateData: (data, model) => [
      ...(!homes(model).some(entry => entry.id === data.homeId) ? ['Välj en bostad med kopplade lån.'] : []),
      ...(!loans(data, model).includes(data.loanId) ? ['Välj ett lån som är kopplat till bostaden.'] : []),
      ...(data.grantedDate && !isDate(data.grantedDate) ? ['Ange lånedatum som ÅÅÅÅ-MM-DD.'] : []),
      ...((model?.modules ?? []).some(entry => entry.enabled !== false && entry.type === type &&
        entry.id !== model?.editingEntry?.id && entry.data.loanId === data.loanId)
        ? ['Lånet har redan en plan för norskt amorteringskrav.'] : []),
    ],
    engineInput: data => ({ input: {
      name: data.name, homeId: data.homeId, loanId: data.loanId,
      ...(data.useLenderValue ? { lenderValue: data.lenderValue } : {}),
      ...(data.useGrantedAmount ? { grantedAmount: data.grantedAmount } : {}),
      ...(data.grantedDate ? { grantedDate: data.grantedDate } : {}),
    } }),
    summarize: (data, model) => ({
      title: data.name,
      detail: (model?.modules ?? []).find(entry => entry.id === data.loanId)?.data.name ?? '',
    }),
  });
  const translations = Object.fromEntries(Object.entries(context.translations).map(([locale, messages]) =>
    [locale, { label: messages[label] ?? label }]));
  return { modules: [{ ...descriptor, translations, usageModel: 'identity',
    sourceModule: { language: 'groovy-cashle-plugin', provider: pluginId, source: 'norwegian-mortgage-repayment.cashle' },
  }] };
};
