const defaults = Object.freeze({
  kind: 'dc',
  minimumAge: 55,
  minimumDuration: 5,
});

export const agreement = Object.freeze({
  ...defaults,
  id: 'BTP1',
  pluginId: 'cashle.pension.agreement.BTP1',
  order: 70,
});

export default context => {
  const swedish = context.language === 'sv';
  return {
    pensionAgreements: [
      agreement,
      {
        ...defaults,
        id: 'BTP1-TRYGG',
        label: swedish ? 'BTP 1 – trygg del' : 'BTP 1 – protected portion',
        order: 71,
      },
      {
        ...defaults,
        id: 'BTP1-VALBAR',
        label: swedish ? 'BTP 1 – valbar del' : 'BTP 1 – selectable portion',
        order: 72,
      },
    ],
  };
};
