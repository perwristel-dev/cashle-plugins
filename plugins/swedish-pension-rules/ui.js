export default async function (context) {
  if (typeof context.importDependencyModule !== 'function') return {};
  const { createPensionUi } = await context.importModule('ui/factory.js');
  const { personFields, swedishPensionAssumptions } = await createPensionUi(context, context.importModule);
  return { personFields, generalAssumptions: [swedishPensionAssumptions] };
}
