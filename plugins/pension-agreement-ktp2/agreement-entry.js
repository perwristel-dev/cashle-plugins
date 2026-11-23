const ktp2 = Object.freeze({
  id: 'KTP2',
  label: 'KTP 2',
  kind: 'db',
  minimumAge: 65,
  minimumDuration: 5,
  fixedAge: 65,
});

const ktpk = [
  ['KTPK', 'KTPK (Fremia–PTK)', 2],
  ['KTPK-AFO-HANDELS', 'KTPK (AFO–Handels)', 5],
  ['KTPK-FOLKSAM', 'KTPK (Folksam)', 2],
  ['KTPK-LO-TCO-RATTSSKYDD', 'KTPK (LO–TCO Rättsskydd)', 2],
].map(([id, label, minimumDuration]) => Object.freeze({
  id, label, minimumDuration, kind: 'dc', minimumAge: 55,
}));

export default { pensionAgreements: [ktp2, ...ktpk] };
