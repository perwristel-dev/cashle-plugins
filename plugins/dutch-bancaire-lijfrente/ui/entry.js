const provider = 'cashle.finance.nl-lijfrente';
const accountType = 'cashlab.nl-lijfrente';
const payoutType = 'cashlab.dutch-lijfrente-payout';
const accountSource = 'dutch-bancaire-lijfrente.cashle';
const accountIn = (id, model) => model?.modules?.find(entry => entry.id === id && entry.type === accountType && entry.enabled !== false);
const linkedAccounts = model => (model?.modules ?? []).filter(entry => entry.type === accountType && entry.enabled !== false &&
  entry.data.policyOptions?.contractStart);

export default function createPlugin(context) {
  const { translate: t } = context;
  const investment = context.investmentAccount({
    type: accountType, kind: 'NLlijfrente', country: 'NL', label: t('label'), help: 'help.scope',
    defaults: {
      liquidity: { withdrawals: 'never', liquid: 'never' },
      policyOptions: { qualifiedAccountConfirmed: false, verifiedAnnualRoom: 0, aowYear: 2026,
        contractStart: '', contractYears: 20, monthlyPayoutEur: 0 },
    },
    features: { canAdd: true, basis: false, plannedSales: false, dividendsReinvest: false, history: ['deposits', 'withdrawals'] },
    policyFields: [
      { key: 'qualifiedAccountConfirmed', label: 'field.confirmed', kind: 'check' },
      { key: 'verifiedAnnualRoom', label: 'field.room', kind: 'number', money: true, min: 0, help: 'help.room' },
      { key: 'contractStart', label: 'field.start', kind: 'date', help: 'help.start' },
      { key: 'aowYear', label: 'field.aowYear', kind: 'number', min: 1900, max: 2300, integer: true, when: options => Boolean(options.contractStart) },
      { key: 'contractYears', label: 'field.term', kind: 'number', min: 20, max: 100, integer: true, when: options => Boolean(options.contractStart) },
      { key: 'monthlyPayoutEur', label: 'field.payment', kind: 'number', money: true, min: 0, when: options => Boolean(options.contractStart) },
    ],
    validateAccount(data) {
      return data.closeEnabled || data.liquidity?.withdrawals !== 'never' ? ['invalid.locked']
        : data.dividendRate !== 0 || data.reinvestDividends !== false ? ['invalid.return'] : [];
    },
    validateOptions(options) {
      const errors = [];
      if (!options.qualifiedAccountConfirmed) errors.push('invalid.confirmed');
      if (!Number.isFinite(options.verifiedAnnualRoom) || options.verifiedAnnualRoom < 0) errors.push('invalid.room');
      if (options.contractStart) {
        const year = Number(options.contractStart.slice(0, 4));
        if (!/^\d{4}-\d{2}-01$/.test(options.contractStart) || year < options.aowYear || year > options.aowYear + 5 ||
            !(options.monthlyPayoutEur > 0)) errors.push('invalid.contract');
      }
      return errors;
    },
    sourceModule: { language: 'groovy-cashle-plugin', provider, source: accountSource,
      dependencies: [{ language: 'groovy-cashle-plugin', provider: `${provider}.policy`, source: accountSource }] },
    translations: context.translations,
    usageModel: 'identity',
  });
  const payment = context.schemaModule({
    id: 'dutch-lijfrente-payout', category: 'income', financesTab: 'income', label: 'label.payment',
    availability: model => linkedAccounts(model).length ? [] : [t('invalid.link')],
    fields: [
      { key: 'name', kind: 'text', label: 'field.name', default: t('label.payment') },
      { key: 'accountId', kind: 'select', label: 'field.account', default: '', options: [['', 'option.account']],
        optionsFor: (_data, model) => [['', 'option.account'], ...linkedAccounts(model).map(account => [account.id, account.data.name])] },
    ], sections: [],
    deleteWithModuleIds: data => data.accountId ? [data.accountId] : [],
    validateData(data, model) {
      return linkedAccounts(model).some(account => account.id === data.accountId) ? [] : ['invalid.link'];
    },
    validateLinks(model) {
      const ids = model.modules.filter(entry => entry.type === payoutType && entry.enabled !== false).map(entry => entry.data.accountId);
      return new Set(ids).size < ids.length ? ['invalid.duplicate'] : [];
    },
    engineInput(data, { model }) {
      const account = accountIn(data.accountId, model);
      const owner = account?.data.owner;
      const { contractStart, contractYears, monthlyPayoutEur } = account?.data.policyOptions ?? {};
      return { input: { ...data, owner, contractStart, contractYears, monthlyPayoutEur },
        timeReferences: owner ? [{ reference: 'life', personId: owner }] : [] };
    },
    summarize(data, model) {
      const options = accountIn(data.accountId, model)?.data.policyOptions;
      const amount = options ? new Intl.NumberFormat(context.language, { style: 'currency', currency: 'EUR' })
        .format(options.monthlyPayoutEur) : null;
      return { title: data.name, amount, detail: options ? t('summary.payment', { date: options.contractStart }) : '' };
    },
  });
  return { modules: [{ ...investment,
    engineInput(data, inputContext) {
      const exported = investment.engineInput(data, inputContext);
      return { ...exported, input: { ...exported.input, assetNature: 'PENSION_ASSET' } };
    },
    editor: { ...investment.editor, detailedSections: investment.editor.detailedSections.filter(section => section.id !== 'liquidity') },
  }, { ...payment, pluginId: provider, usageModel: 'identity', translations: context.translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider: `${provider}.payout`, source: 'dutch-lijfrente-payout.cashle' },
  }] };
}
