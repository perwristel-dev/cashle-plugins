const provider = 'cashle.finance.au-investment-bond';
const source = 'australian-investment-bond.cashle';
const validDate = date => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) &&
  !Number.isNaN(Date.parse(`${date}T00:00:00Z`)) && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;

export default function createPlugin(context) {
  const { translate: t } = context;
  const account = context.investmentAccount({
    type: 'cashlab.au-investment-bond', kind: 'AUinvestmentBond', country: 'AU', label: t('label'), help: 'help.scope',
    defaults: {
      liquidity: { withdrawals: 'never', liquid: 'never' },
      policyOptions: { acquiredDate: '', eligiblePeriodStart: '', domesticPolicyConfirmed: false },
      openingState: { premiumYear: 0, premiumTotal: 0, priorPremium: 0 },
    },
    features: { basis: true, canAdd: true, plannedSales: false, dividendsReinvest: false, history: [] },
    policyFields: [
      { key: 'acquiredDate', label: 'field.inception', kind: 'date', help: 'help.inception', required: true },
      { key: 'eligiblePeriodStart', label: 'field.restart', kind: 'date', help: 'help.restart' },
      { key: 'domesticPolicyConfirmed', label: 'field.confirmed', kind: 'check' },
    ],
    stateFields: [
      { key: 'premiumYear', label: 'field.premiumYear', kind: 'number', integer: true, min: 0, help: 'help.premiumHistory' },
      { key: 'premiumTotal', label: 'field.premiumTotal', kind: 'number', money: true, min: 0 },
      { key: 'priorPremium', label: 'field.priorPremium', kind: 'number', money: true, min: 0 },
    ],
    validateOptions(options) {
      const errors = [];
      if (options.domesticPolicyConfirmed !== true) errors.push('invalid.scope');
      if (!validDate(options.acquiredDate) || options.acquiredDate <= '1983-12-07') errors.push('invalid.inception');
      if (options.eligiblePeriodStart && (!validDate(options.eligiblePeriodStart) || options.eligiblePeriodStart < options.acquiredDate)) {
        errors.push('invalid.restart');
      }
      return errors;
    },
    validateAccount(data) {
      const errors = [];
      if (data.dividendRate !== 0 || data.reinvestDividends !== false) errors.push('invalid.dividend');
      if (data.liquidity?.withdrawals !== 'never') errors.push('invalid.withdrawal');
      if (!Number.isInteger(data.openingState?.premiumYear) || data.openingState.premiumYear < 0) errors.push('invalid.premiumYear');
      return errors;
    },
    translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider, source,
      dependencies: [{ language: 'groovy-cashle-plugin', provider: `${provider}.tax-policy`, source }] },
    usageModel: 'identity',
  });
  return { modules: [{
    ...account,
    editor: { ...account.editor, detailedSections: account.editor.detailedSections.filter(section => section.id !== 'liquidity') },
    summarize(data, model) {
      const summary = account.summarize(data, model);
      return { ...summary, detail: data.closeEnabled ? t('summary.surrender', { date: data.closeDate }) : t('summary.value') };
    },
  }] };
}
