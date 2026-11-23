export default function (context) {
  return {
    modules: [{
      ...context.replacementModule('cashlab.swedish-dc-pension', 1),
      usageModel: 'identity',
      sourceModule: { language: 'groovy-cashle-plugin', provider: 'cashle.finance.pension.dc', source: 'swedish-dc-pension.cashle' },
    }],
  };
}
