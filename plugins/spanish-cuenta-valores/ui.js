export default function (context) {
  const account = context.investmentAccount({
    type: 'cashlab.es-cuenta-valores',
    kind: 'EScuentaValores',
    country: 'ES',
    label: 'Cuenta de valores (acciones cotizadas)',
    help: 'Spanien 2025: en homogen anskaffningspost noterade aktier. Uttag säljer proportionellt ur denna enda post och motsvarar FIFO för posten. Aktievinster och utdelning/ränta hanteras som separata sparbaskategorier med högst 25 % korskvittning och fyra års förlustöverföring. Återinvestering/traspasos uppskjuter inte skatt för ETF eller aktier; kvalificerade fondbyten ingår inte. Skatten räknas på ägarens samlade sparbas, inte som en platt kontoskatt.',
    defaults: { policyOptions: { acquiredDate: '', spanishLossDeductibilityConfirmed: false } },
    policyFields: [
      { key: 'acquiredDate', label: 'Faktisk anskaffningsdag / första insättningsdag', kind: 'date' },
      {
        key: 'spanishLossDeductibilityConfirmed',
        label: 'Förluster är avdragsgilla: verifierat inga återköp av samma slags noterade aktier inom två månader, eller leverantörens avdragsbesked',
        kind: 'check',
      },
    ],
    features: {
      basis: true,
      plannedSales: false,
      dividendsReinvest: false,
      canAdd: false,
      history: ['deposits', 'withdrawals', 'dividends', 'realizedGain', 'realizedLoss', 'prepaidTax'],
    },
    validateOptions(options) {
      return /^\d{4}-\d{2}-\d{2}$/.test(options.acquiredDate ?? '')
        ? [] : ['Ange faktisk anskaffningsdag för den enda aktieposten.'];
    },
    translations: context.translations,
    sourceModule: {
      language: 'groovy-cashle-plugin',
      provider: 'cashle.finance.es-cuenta-valores',
      source: 'spanish-cuenta-valores.cashle',
      dependencies: [{
        language: 'groovy-cashle-plugin',
        provider: 'cashle.finance.es-cuenta-valores.tax',
        source: 'spanish-cuenta-valores-tax.cashle',
      }],
    },
    usageModel: 'identity',
  });
  return { modules: [account] };
}
