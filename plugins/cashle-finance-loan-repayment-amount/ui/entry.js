const pluginId = 'cashle.finance.loan-repayment.amount';
const label = 'Amorteringsbelopp';

export function definition(ui, translate) {
  const { basis, money, number, annualMoneyAmount } = ui.fields;
  return ui.createEditor({
    id: 'repayment-amount', label, pluginId,
    fields: [
      number('amortizationAmount', 'Amorteringsbelopp per betalningsperiod', 0, { unit: 'kr', frequencyKey: 'paymentFrequency' }),
      basis('amortizationBasis', { resets: ['amortizationAmount'] }),
    ],
    monthlyAmortization: (data, debt) => annualMoneyAmount(Number(data.amortizationAmount),
      data.paymentFrequency === 'loan-interest' ? debt?.frequency : data.paymentFrequency) / 12,
    sectionSummary: data => money(data.amortizationAmount),
    amountSummary: data => money(data.amortizationAmount),
  });
}

export default context => {
  const module = context.schemaModule(definition(context.repaymentUi(), context.translate));
  const translations = Object.fromEntries(Object.entries(context.translations).map(([locale, messages]) => [locale, { label: messages[label] ?? label }]));
  return { modules: [{
    ...module,
    editor: { ...module.editor, detailedSections: module.editor.detailedSections.map(section => ({ ...section, translateTitle: context.translate })) },
    translations,
    sourceModule: { language: 'groovy-cashle-plugin', provider: pluginId, source: 'amount.cashle' },
    usageModel: 'identity',
  }] };
};
