const agreements = [
  ['KTP1-ABF-HANDELS', 'KTP 1 (ABF–Handels)'],
  ['KTP1-AFO-HANDELS', 'KTP 1 (AFO–Handels)'],
  ['KTP1-FREMIA-HANDELS', 'KTP 1 (Fremia–Handels)'],
  ['KTP1-FREMIA-FORENA', 'KTP 1 (Fremia–Forena/Handels/Akademikerförbunden)'],
  ['KTP1-FREMIA-FORENA-DELTID', 'KTP 1 (Fremia–Forena/Handels/Akademikerförbunden + deltidspension)'],
];

export default ({ translate }) => ({
  pensionAgreements: agreements.map(([id, label]) => Object.freeze({
    id,
    label: translate(label),
    kind: 'dc',
    minimumAge: 55,
    minimumDuration: 5,
  })),
});
