const acquired = { key: 'acquiredDate', label: 'Faktisk anskaffningsdag / första insättningsdag', kind: 'date' };
const history = ['deposits', 'withdrawals', 'dividends', 'realizedGain', 'realizedLoss', 'prepaidTax'];
const ordinary = { basis: true, plannedSales: false, dividendsReinvest: false, canAdd: false, history };
const validDate = options => /^\d{4}-\d{2}-\d{2}$/.test(options.acquiredDate ?? '')
  ? [] : ['Ange faktisk anskaffningsdag för den enda aktieposten.'];

const spec = {
  type: 'cashlab.fr-compte-titres', kind: 'FRcompteTitres', country: 'FR', label: 'Compte-titres ordinaire (actions cotées)',
  help: 'Frankrike inkomster 2025: en homogen post noterade aktier. PFU på utdelning 12,8 % + 17,2 % sociala avgifter; värdepappersvinster beskattade 2026 12,8 % + 18,6 %. Förluster möter bara motsvarande värdepappersvinster och kan föras tio år, aldrig mot utdelning eller lön. Globalt årligt barème-val med 40 % utdelningsavdrag ingår inte. Nya köp och återinvesterad utdelning kräver separata poster.',
  defaults: { policyOptions: { acquiredDate: '' } }, policyFields: [acquired], features: ordinary, validateOptions: validDate,
};

export default function (context) {
  return { modules: [context.investmentAccount({
    ...spec,
    translations: context.translations,
    sourceModule: {
      language: 'groovy-cashle-plugin',
      provider: 'cashle.finance.fr-compte-titres',
      source: 'french-compte-titres.cashle',
      dependencies: [{
        language: 'groovy-cashle-plugin',
        provider: 'cashle.finance.fr-compte-titres.tax',
        source: 'french-compte-titres-tax.cashle',
      }],
    },
    usageModel: 'identity',
  })] };
}
