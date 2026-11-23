export default async function (context) {
  const type = 'cashlab.swedish-db-pension';
  let module;
  if (typeof context.importDependencyModule === 'function') {
    const load = path => context.importDependencyModule('cashle.finance.pension.rules', path);
    const { createPensionUi } = await load('ui/factory.js');
    const { pensionPlugins } = await createPensionUi(context, load, { editor: true });
    module = pensionPlugins.find(plugin => plugin.type === type);
  } else {
    module = context.replacementModule(type, 1);
  }
  return {
    modules: [{
      ...module,
      usageModel: 'identity',
      sourceModule: { language: 'groovy-cashle-plugin', provider: 'cashle.finance.pension.db', source: 'swedish-db-pension.cashle' },
    }],
  };
}
