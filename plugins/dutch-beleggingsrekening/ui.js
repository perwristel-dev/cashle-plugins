export default function (context) {
  const swedish = context.translations.sv;
  const translations = Object.fromEntries(Object.entries(context.translations).map(([locale, messages]) => [
    locale, { ...messages, [swedish.help]: messages.help },
  ]));
  const sourceReference = { language: 'groovy-cashle-plugin', source: 'dutch-beleggingsrekening.cashle' };

  return {
    modules: [context.investmentAccount({
      type: 'cashlab.nl-beleggingsrekening',
      version: 1,
      pluginId: 'cashle.finance.nl-beleggingsrekening',
      kind: 'NLbeleggingsrekening',
      country: 'NL',
      label: swedish.label,
      help: swedish.help,
      translations,
      defaults: { policyOptions: {} },
      policyFields: [],
      features: {
        basis: false,
        plannedSales: false,
        dividendsReinvest: true,
        canAdd: true,
        history: ['openingValue', 'deposits', 'withdrawals', 'dividends'],
      },
      sourceModule: {
        ...sourceReference,
        provider: 'cashle.finance.nl-beleggingsrekening',
        dependencies: [{ ...sourceReference, provider: 'cashle.finance.nl-beleggingsrekening.policy' }],
      },
      usageModel: 'identity',
    })],
  };
}
