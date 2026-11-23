export const agreement = Object.freeze({
  id: 'FTP2',
  pluginId: 'cashle.pension.agreement.FTP2',
  kind: 'db',
  minimumAge: 65,
  minimumDuration: 5,
  order: 80,
  fixedAge: 65,
});

const supplement = Object.freeze({
  id: 'FTPK',
  kind: 'dc',
  minimumAge: 55,
  minimumDuration: 5,
  order: 81,
});

export default { pensionAgreements: [agreement, supplement] };
