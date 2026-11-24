const provider = 'cashle.finance.es-long-term-savings';
const source = { language: 'groovy-cashle-plugin', source: 'spanish-long-term-savings.cashle' };
const liquidity = { withdrawals: 'never', liquid: 'never' };

export default function createPlugin(context) {
  return { modules: [context.investmentAccount({
    type: 'cashlab.es-long-term-savings', version: 1, kind: 'ESlongTermSavings', country: 'ES',
    label: 'Långsiktigt sparande (SIALP/CIALP)',
    help: 'Högst 5 000 EUR per kalenderår, ett sparande per ägare. Vid avslut efter fem år är vinsten skattefri.',
    translations: context.translations,
    defaults: { reinvestDividends: true, liquidity, policyOptions: { acquiredDate: '' }, openingState: { annualDeposits: 0 } },
    policyFields: [{ key: 'acquiredDate', kind: 'date', label: 'Datum för första insättningen' }],
    stateFields: [{ key: 'annualDeposits', kind: 'number', label: 'Insättningar tidigare under kalenderåret', money: true, min: 0, max: 5000 }],
    features: { basis: true, plannedSales: false, canAdd: true, dividendsReinvest: true, dividendsMustReinvest: true, history: ['openingValue'] },
    validateOptions(options, data) {
      const errors = [];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(options.acquiredDate ?? '')) errors.push('Ange datum för första insättningen.');
      if (data.liquidity?.withdrawals !== 'never' || data.liquidity?.liquid !== 'never') errors.push('Använd ett avslutsdatum för uttag.');
      return errors;
    },
    sourceModule: { ...source, provider, dependencies: [{ ...source, provider: `${provider}.policy` }] },
    usageModel: 'identity',
  })] };
}
