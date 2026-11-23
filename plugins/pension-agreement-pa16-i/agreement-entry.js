export const agreement = Object.freeze({
  id: 'PA16-I',
  pluginId: 'cashle.pension.agreement.PA16-I',
  kind: 'dc',
  minimumAge: 63,
  minimumDuration: 10,
  order: 50,
  label: 'PA16 Avdelning I – premiebestämda delar',
  minBirthYear: 1988,
  continueAfter69: true,
});

export default { pensionAgreements: [agreement] };
