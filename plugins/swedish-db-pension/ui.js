export default function (context) {
  return {
    modules: [{
      ...context.replacementModule('cashlab.swedish-db-pension', 1),
      usageModel: 'identity',
      sourceModule: { language: 'groovy-cashle-plugin', provider: 'cashle.finance.pension.db', source: 'swedish-db-pension.cashle' },
    }],
  };
}
