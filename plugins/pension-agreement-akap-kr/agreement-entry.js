export const agreement = Object.freeze({
  id: 'AKAP-KR',
  pluginId: 'cashle.pension.agreement.AKAP-KR',
  kind: 'dc',
  minimumAge: 62,
  minimumDuration: 10,
  order: 40,
  assessmentMonths: 6,
  needsEmploymentStart: true,
  pendingPremiumKey: 'openingPendingAkapPremium',
});

export default { pensionAgreements: [agreement] };
