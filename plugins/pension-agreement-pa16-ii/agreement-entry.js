export const agreement = Object.freeze({
  id: 'PA16-II',
  pluginId: 'cashle.pension.agreement.PA16-II',
  kind: 'dc',
  minimumAge: 63,
  minimumDuration: 10,
  order: 60,
  label: 'PA16 Avdelning II – premiebestämd del',
  minBirthYear: 1966,
  maxBirthYear: 1987,
  continueAfter69: true,
});

export default { pensionAgreements: [agreement] };
