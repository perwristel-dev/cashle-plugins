export default function (context) {
  const swedish = context.translations.sv;
  // The investment editor translates account help and fields from their authored labels on each render.
  const translations = Object.fromEntries(Object.entries(context.translations).map(([locale, messages]) => [locale, {
    ...messages,
    [swedish.help]: messages.help,
    [swedish.acquiredDate]: messages.acquiredDate,
    [swedish.acquiredDateHelp]: messages.acquiredDateHelp,
  }]));
  const text = key => translations[context.language]?.[key]
    ?? translations[context.language?.split('-')[0]]?.[key]
    ?? translations.sv[key];
  const sourceReference = { language: 'groovy-cashle-plugin', source: 'german-depot.cashle' };

  return {
    modules: [context.investmentAccount({
      type: 'cashlab.de-depot',
      version: 1,
      pluginId: 'cashle.finance.de-depot',
      kind: 'DEdepot',
      country: 'DE',
      label: swedish.label,
      help: swedish.help,
      translations,
      defaults: { policyOptions: { acquiredDate: '' } },
      policyFields: [{ key: 'acquiredDate', label: swedish.acquiredDate, kind: 'date', help: swedish.acquiredDateHelp }],
      validateOptions: options => /^\d{4}-\d{2}-\d{2}$/.test(options.acquiredDate ?? '') &&
        options.acquiredDate >= '2009-01-01' ? [] : [text('acquiredDateInvalid')],
      features: {
        basis: true,
        plannedSales: false,
        dividendsReinvest: false,
        canAdd: false,
        history: ['dividends', 'realizedGain', 'realizedLoss', 'prepaidTax'],
      },
      sourceModule: {
        ...sourceReference,
        provider: 'cashle.finance.de-depot',
        dependencies: [{ ...sourceReference, provider: 'cashle.finance.de-depot.policy' }],
      },
      usageModel: 'identity',
    })],
  };
}
