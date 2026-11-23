const contributionAgreement = Object.freeze({
  id: 'KAP-KL-DC',
  kind: 'dc',
  label: 'KAP-KL',
  minimumAge: 62,
  minimumDuration: 10,
  assessmentMonths: 12,
  order: 45,
});

const benefitAgreement = Object.freeze({
  id: 'KAP-KL-DB',
  kind: 'db',
  label: 'KAP-KL',
  minimumAge: 61,
  minimumDuration: 5,
  order: 45,
});

export default { pensionAgreements: [contributionAgreement, benefitAgreement] };
