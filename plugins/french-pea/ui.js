const acquired = { key: 'acquiredDate', label: 'Faktisk anskaffningsdag / första insättningsdag', kind: 'date' };
const state = [
  { key: 'cumulativeContributions', label: 'Faktiska sammanlagda insättningar sedan öppning (EUR)', kind: 'number', money: true, min: 0 },
  { key: 'yearContributions', label: 'Årets insättningar före prognosstart (EUR)', kind: 'number', money: true, min: 0 },
];
const history = ['deposits', 'withdrawals', 'dividends', 'realizedGain', 'realizedLoss', 'prepaidTax'];
const validDate = options => /^\d{4}-\d{2}-\d{2}$/.test(options.acquiredDate ?? '')
  ? [] : ['Ange faktisk anskaffningsdag för den enda aktieposten.'];

const spec = {
  type: 'cashlab.fr-pea', kind: 'FRpea', country: 'FR', label: 'Plan d’épargne en actions (PEA)',
  help: 'Frankrike, inkomster 2025: kvalificerat PEA/PEA-PME med endast noterade godkända tillgångar och faktisk första insättning från 2018. Femårsgränsen räknas från första insättningen. Före fem år krävs fullständigt avslut; vinsten belastas med 12,8 % plus 17,2 % sociala avgifter. Efter fem år är vinsten fri från inkomstskatt men 17,2 % sociala avgifter tas på proportionell vinstandel vid uttag. Historiska blandade sociala skattesatser, onoterad utdelning och undantag för tidiga partiella uttag ingår inte. Insättningsgräns PEA 150 000 EUR och totalt PEA+PEA-PME 225 000 EUR; uttag återställer inte utrymme. Ange verkliga livstidsinsättningar, inte marknadsvärde. Högst ett modellerat konto i PEA-familjen per ägare; det andra kontots fasta externa insättningar anges separat.',
  defaults: {
    reinvestDividends: true,
    policyOptions: { acquiredDate: '', eligibleListedAssetsConfirmed: false, otherPlanContributions: 0 },
    openingState: { cumulativeContributions: 0, yearContributions: 0, earlyGain: 0 },
  },
  policyFields: [
    acquired,
    { key: 'eligibleListedAssetsConfirmed', label: 'Jag har verifierat enbart godkända noterade PEA-tillgångar', kind: 'check' },
    { key: 'otherPlanContributions', label: 'Det andra, externa PEA/PEA-PME-kontots livstidsinsättningar (EUR)', kind: 'number', money: true, min: 0, help: 'Inkludera kända framtida insättningar. Endast ett PEA-familjekonto får modelleras per ägare.' },
  ],
  stateFields: [
    ...state,
    { key: 'earlyGain', label: 'Årets tidigare vinst från tidigt avslut (EUR)', kind: 'number', money: true, min: 0 },
  ],
  features: { basis: true, plannedSales: false, dividendsReinvest: true, dividendsMustReinvest: true, canAdd: true, history },
  validateOptions(options, data) {
    const errors = validDate(options);
    if (!data?.initialYear?.newAccountAtStart && (data?.openingState?.cumulativeContributions ?? 0) < (data?.costBasis ?? 0)) {
      errors.push('Ange verkliga livstidsinsättningar; de får inte understiga återstående insatt kapital.');
    }
    if (data?.reinvestDividends !== true) errors.push('PEA-utdelning måste återinvesteras inom kontot.');
    if (options.acquiredDate < '2018-01-01') errors.push('Endast första insättning från 2018 stöds.');
    if (options.eligibleListedAssetsConfirmed !== true) errors.push('Verifiera godkända noterade PEA-tillgångar.');
    if (!Number.isFinite(options.otherPlanContributions) || options.otherPlanContributions < 0) {
      errors.push('Ange faktisk insättning i annat PEA/PEA-PME, även 0.');
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
      provider: 'cashle.finance.fr-pea',
      source: 'french-pea.cashle',
      dependencies: [{
        language: 'groovy-cashle-plugin',
        provider: 'cashle.finance.fr-pea.tax',
        source: 'french-pea-tax.cashle',
      }],
    },
    usageModel: 'identity',
  })] };
}
