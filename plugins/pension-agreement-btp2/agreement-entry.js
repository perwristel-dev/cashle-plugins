export const agreement = Object.freeze({
  id: 'BTP2',
  pluginId: 'cashle.pension.agreement.BTP2',
  kind: 'db',
  minimumAge: 65,
  minimumDuration: 5,
  order: 70,
  fixedAge: 65,
});

const supplement = Object.freeze({
  id: 'BTPK',
  kind: 'dc',
  minimumAge: 55,
  minimumDuration: 5,
  order: 73,
});

export default { pensionAgreements: [agreement, supplement] };
