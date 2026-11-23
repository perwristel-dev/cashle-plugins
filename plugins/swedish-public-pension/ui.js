export default function (context) {
  return {
    modules: [{
      ...context.replacementModule('cashlab.swedish-public-pension', 1),
      usageModel: 'identity',
      sourceModule: { language: 'groovy-cashle-plugin', provider: 'cashle.finance.pension.public', source: 'swedish-public-pension.cashle' },
    }],
  };
}
