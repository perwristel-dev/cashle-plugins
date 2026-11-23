export default function (context) {
  return { modules: [context.investmentAccount({
    type: 'cashlab.dk-ask',
    kind: 'DKask',
    country: 'DK',
    label: 'Aktiesparekonto (ASK)',
    help: 'Danmark 2026: årlig lagerskatt 17 %. Negativ skatt är en separat skattekredit, inte en värdeförlust eller avdrag från lön. Krediten förfaller vid avslut. Insättningstaket 174 200 DKK beror på marknadsvärdet den 31 december föregående år och årets nettoinsättningar; värdeökning över taket behöver inte säljas.',
    unpaidBankTaxHelp: "Ange föregående års kontoskatt som ännu inte har dragits från den danska ASK:n. Den betalas vid nästa betalning i februari eller vid avslut och är skild från den negativa skattekrediten.",
    translations: context.translations,
    features: {
      basis: false,
      plannedSales: false,
      dividendsReinvest: true,
      canAdd: true,
      priorYearEndValue: true,
      openingNegativeTaxCarry: true,
      history: ['deposits', 'withdrawals', 'dividends', 'openingValue', 'unpaidBankTax'],
    },
    sourceModule: {
      language: 'groovy-cashle-plugin',
      provider: 'cashle.finance.dk-ask',
      source: 'dk-ask.cashle',
      dependencies: [{
        language: 'groovy-cashle-plugin',
        provider: 'cashle.finance.dk-ask.tax',
        source: 'dk-ask-tax.cashle',
      }],
    },
    usageModel: 'identity',
  })] };
}
