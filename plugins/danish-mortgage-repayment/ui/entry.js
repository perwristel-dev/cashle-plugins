const provider = 'cashle.finance.loan-repayment.dk';
const type = 'cashlab.repayment-dk';
const periodMonths = { monthly: 1, quarterly: 3, semiannual: 6, annual: 12 };

export default function createPlugin(context) {
  const t = context.translate;
  const ui = context.repaymentUi();
  const compatibleLoans = model => context.amortizableDebts(model).filter(loan => {
    const descriptor = ui.descriptorFor(model, loan.type, loan.version);
    const support = descriptor?.repaymentScheduleSupport?.(loan.data, model);
    return descriptor?.capabilities?.creditFacility !== true &&
      support?.loanStart && support.interestFrequency && support.annuityProjection;
  });
  const hasOtherAnnuity = (model, id, loanId) => model?.modules?.some(entry => {
    if (entry.id === id || entry.enabled === false) return false;
    const descriptor = ui.descriptorFor(model, entry.type, entry.version);
    return descriptor?.capabilities?.exclusiveAnnuity === true &&
      descriptor.deleteWithModuleIds?.(entry.data, model)?.includes(loanId);
  });
  const fields = [
    { key: 'name', kind: 'text', label: 'field.name', default: 'label' },
    { key: 'loanId', kind: 'select', label: 'field.loan', default: '', options: [['', 'option.loan']],
      optionsFor: (_data, model) => [['', 'option.loan'], ...compatibleLoans(model).map(loan => [loan.id, loan.data.name])],
      when: (_data, model) => model?.relatedEditor?.key !== 'amortizationFlows', preserveWhenInactive: true },
    { key: 'remainingMonths', kind: 'number', label: 'field.term', default: 360, min: 1, max: 360,
      integer: true, unit: 'unit.months' },
    { key: 'interestOnlyMonths', kind: 'number', label: 'field.deferral', default: 0, min: 0, max: 120,
      integer: true, unit: 'unit.months', help: 'help.deferral' },
  ];
  const module = context.schemaModule({
    id: 'repayment-dk', label: 'label', pluginId: provider, category: 'flows', fields, sections: [],
    capabilities: { amortizationFlow: true, fundingGoal: true, exclusiveAnnuity: true },
    availability: model => compatibleLoans(model).length ? [] : [t('invalid.loan')],
    amortizationDefaults: loan => ({ loanId: loan.id }),
    deleteWithModuleIds: data => data.loanId ? [data.loanId] : [],
    monthlyAmortization: (data, debt) => Number(debt?.balance) / data.remainingMonths,
    validateData(data, model) {
      const loan = compatibleLoans(model).find(entry => entry.id === data.loanId);
      if (!loan) return ['invalid.loan'];
      const descriptor = ui.descriptorFor(model, loan.type, loan.version);
      const period = periodMonths[descriptor.monthlyDebt?.(loan.data, model)?.frequency] ?? 1;
      const errors = [];
      if (data.interestOnlyMonths >= data.remainingMonths || data.remainingMonths % period || data.interestOnlyMonths % period)
        errors.push('invalid.periods');
      const edited = model?.editingEntry?.id;
      if (edited && model.modules.find(entry => entry.id === edited)?.enabled !== false && hasOtherAnnuity(model, edited, data.loanId))
        errors.push('invalid.exclusive');
      return errors;
    },
    validateLinks(model) {
      const loans = new Set(compatibleLoans(model).map(loan => loan.id));
      const payments = model.modules.filter(entry => entry.enabled !== false && entry.type === type);
      return [
        ...(payments.some(entry => !loans.has(entry.data.loanId)) ? ['invalid.loan'] : []),
        ...(payments.some(entry => hasOtherAnnuity(model, entry.id, entry.data.loanId)) ? ['invalid.exclusive'] : []),
      ];
    },
    engineInput(data) { return { input: data }; },
    summarize(data, model) {
      const name = model?.modules?.find(entry => entry.id === data.loanId)?.data.name;
      return { title: data.name, amount: t('summary.term', { months: data.remainingMonths }), detail: name };
    },
  });
  return { modules: [{ ...module, translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: 'danish-mortgage-repayment.cashle' },
    usageModel: 'identity',
  }] };
}
