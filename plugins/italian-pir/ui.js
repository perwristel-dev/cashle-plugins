const acquired = { key: 'acquiredDate', label: 'Faktisk anskaffningsdag / första insättningsdag', kind: 'date' };
const validDate = o => /^\d{4}-\d{2}-\d{2}$/.test(o.acquiredDate ?? '') ? [] : ['Ange faktisk anskaffningsdag för den enda aktieposten.'];

const spec = {
 type: 'cashlab.it-pir',
 kind: 'ITpir',
 country: 'IT',
 label: 'Piano individuale di risparmio (PIR ordinario)',
 help: 'Ordinarie PIR 2025: 40 000 EUR insättning per år, 200 000 EUR totalt; uttag återställer inte historiskt utrymme. Leverantören måste verifiera instrument-, allokerings-, koncentrations- och hemvistvillkor. Fem års innehav bedöms per bidrags-/värdepapperspost; öppningsdatum räcker inte. Ett moget uttag kräver uttrycklig leverantörsbekräftelse för samtliga uttagna poster. Tidig avveckling kräver exakt leverantörsberäknad återföringsskatt inklusive ränta och fullständigt avslut. Ingen generell PIR-skattelättnad antas på enbart öppningsdatum.',
 defaults: {
   reinvestDividends: true,
   policyOptions: { acquiredDate: '', pirEligibilityConfirmed: false, pirAllWithdrawnLotsFiveYears: false, pirResolvedRecaptureTax: null },
   openingState: { cumulativeContributions: 0, yearContributions: 0, recaptureTax: 0 },
 },
 policyFields: [
   acquired,
   { key: 'pirEligibilityConfirmed', label: 'Leverantören har verifierat samtliga ordinarie PIR-villkor', kind: 'check' },
   { key: 'pirAllWithdrawnLotsFiveYears', label: 'Leverantören verifierar fem års innehav för varje uttagen post', kind: 'check' },
   { key: 'pirResolvedRecaptureTax', label: 'Faktisk återföringsskatt inklusive ränta vid tidigt fullständigt avslut (EUR)',
     kind: 'number', money: true, min: 0, when: options => !options.pirAllWithdrawnLotsFiveYears },
 ],
 stateFields: [
   { key: 'cumulativeContributions', label: 'Faktiska sammanlagda insättningar sedan öppning (EUR)', kind: 'number', money: true, min: 0 },
   { key: 'yearContributions', label: 'Årets insättningar före prognosstart (EUR)', kind: 'number', money: true, min: 0 },
   { key: 'recaptureTax', label: 'Årets redan upplupna leverantörsberäknade återföringsskatt (EUR)', kind: 'number', money: true, min: 0 },
 ],
 features: {
   basis: true, plannedSales: false, dividendsReinvest: true, dividendsMustReinvest: true, canAdd: true,
   history: ['deposits', 'withdrawals', 'dividends', 'prepaidTax'],
 },
 validateOptions(options, data) {
   const errors = validDate(options);
   if (!data?.initialYear?.newAccountAtStart && (data?.openingState?.cumulativeContributions ?? 0) < (data?.costBasis ?? 0)) {
     errors.push('Ange verkliga livstidsinsättningar; de får inte understiga återstående insatt kapital.');
   }
   if (data?.reinvestDividends !== true) errors.push('PIR-utdelning måste återinvesteras inom kontot.');
   if (!options.pirEligibilityConfirmed) errors.push('Leverantörens PIR-behörighetsbekräftelse krävs.');
   if (!options.pirAllWithdrawnLotsFiveYears && (!Number.isFinite(options.pirResolvedRecaptureTax) || options.pirResolvedRecaptureTax < 0)) {
     errors.push('Ange exakt leverantörsberäknad skatt/ränta för ett tidigt avslut.');
   }
   return errors;
 },
};

export default function (context) {
  return { modules: [context.investmentAccount({
    ...spec,
    translations: context.translations,
    sourceModule: {
      language: 'groovy-cashle-plugin',
      provider: 'cashle.finance.it-pir',
      source: 'italian-pir.cashle',
      dependencies: [{
        language: 'groovy-cashle-plugin',
        provider: 'cashle.finance.it-pir.tax',
        source: 'italian-pir-tax.cashle',
      }],
    },
    usageModel: 'identity',
  })] };
}
