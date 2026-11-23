export default function (context) {
  const { translations } = context;
  const source = { language: 'groovy-cashle-plugin', provider: 'cashle.finance.fi-ost' };
  return {
    modules: [context.investmentAccount({
      type: 'cashlab.fi-ost',
      version: 1,
      pluginId: source.provider,
      kind: 'FIost',
      country: 'FI',
      label: 'Osakesäästötili (OST)',
      help: 'Finland 2026: uttag fördelas proportionellt mellan vinst och återstående insatt kapital. Endast kapitaldelen återställer insättningsutrymme under taket 100 000 EUR. Förlust får avdrag först vid uttryckligt avslut. Beskattade uttag sammanräknas med ägarens årliga kapitalinkomster.',
      closureOnlyLoss: true,
      withdrawalProfitHistory: true,
      withdrawalProfitHelp: 'Ange den skattepliktiga vinstandelen av tidigare uttag, inte hela uttagsbeloppet. Ange återstående tillskjutet kapital separat under skatteunderlag.',
      prepaidTaxHelp: 'OST-leverantören innehåller 30 % av uttagets skattepliktiga vinstandel. Ange faktiskt redan innehållet eller inbetalt belopp på tidigare uttag, så att det tillgodoräknas och inte debiteras igen. Slutskatten beror på årets samlade kapitalinkomster.',
      translations,
      features: {
        basis: true,
        plannedSales: false,
        dividendsReinvest: true,
        canAdd: true,
        history: ['deposits', 'withdrawals', 'dividends', 'realizedGain', 'prepaidTax'],
      },
      sourceModule: {
        ...source,
        source: 'finnish-ost.cashle',
        dependencies: [
          { ...source, provider: 'cashle.finance.fi-ost.policy', source: 'finnish-ost-tax.cashle' },
        ],
      },
      usageModel: 'identity',
    })],
  };
}
