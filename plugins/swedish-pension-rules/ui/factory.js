/** Wire provider-owned code to the published host UI services. */
export async function createPensionUi(context, load, { editor = false } = {}) {
  const [support, { labels, messages }, { createPensionServices }, { createPensionModel }, { createPremiumReturnRules }] = await Promise.all([
    context.uiSupport([
      'core/language', 'core/conditional-values', 'core/financial-presets',
      'core/money-frequency', 'core/source-origin', 'core/planning', 'core/profile',
      'plugins/shared/definitions',
    ]),
    load('ui/locale.js'), load('ui/services.js'), load('ui/model.js'), load('ui/premium-return.js'),
  ]);
  const { language } = support['core/language'];
  const premiumReturnRules = createPremiumReturnRules(support['core/planning'].RETURN_PROFILES);
  const pensionText = language.namespace(messages).t;
  const services = createPensionServices({ ...support['core/source-origin'], pensionText });
  const tags = Object.fromEntries(['inline', 'details', 'payout', 'partial', 'wages'].map(
    name => [name, `${context.elementPrefix}-pension-${name}`],
  ));
  const model = createPensionModel({
    ...services,
    ...support['core/conditional-values'],
    ...support['core/financial-presets'],
    ...support['core/money-frequency'],
    ...support['core/source-origin'],
    ...support['core/planning'],
    ...support['core/profile'],
    ...premiumReturnRules,
    ...support['plugins/shared/definitions'],
    ...labels, pensionText, tags,
  });
  if (editor && context.EditorElement) {
    const [editorSupport, { createPensionEditors }] = await Promise.all([
      context.uiSupport([
        'components/atoms/schema-fields', 'components/editor-fields', 'core/editing-policy',
        'advisor/catalog', 'plugins/shared/language',
      ]),
      load('ui/editor.js'),
    ]);
    createPensionEditors({
      ...model, ...services, language, pensionText, tags, en: messages.en,
      ...support['core/conditional-values'],
      ...support['core/money-frequency'],
      ...premiumReturnRules,
      ...support['plugins/shared/definitions'],
      ...editorSupport['components/atoms/schema-fields'],
      ...editorSupport['components/editor-fields'],
      ...editorSupport['core/editing-policy'],
      ...editorSupport['advisor/catalog'],
      ...editorSupport['plugins/shared/language'],
    });
  }
  return { ...model, swedishPensionAssumptions: services.swedishPensionAssumptions };
}
