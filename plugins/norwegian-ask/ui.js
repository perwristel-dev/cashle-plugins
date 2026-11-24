export default function (context) {
  const source = { language: 'groovy-cashle-plugin', provider: 'cashle.finance.no-ask' };
  return {
    modules: [context.investmentAccount({
      type: 'cashlab.no-ask',
      version: 1,
      pluginId: source.provider,
      kind: 'NOask',
      country: 'NO',
      label: 'Aksjesparekonto (ASK)',
      help: 'Prognosen använder Låg avkastning från planinställningarna som skjermingsränta.',
      withdrawalProfitHelp: 'Ange vinstdelen av tidigare uttag före årets avdrag för skjerming, inte uttagna tillskott. Årsberäkningen drar av tillgänglig skjerming en gång. Ange återstående tillskjutet kapital separat under skatteunderlag.',
      translations: context.translations,
      features: {
        basis: true,
        plannedSales: false,
        dividendsReinvest: true,
        canAdd: true,
        shielding: true,
        shieldingRateFromPlan: true,
        closureOnlyLoss: true,
        withdrawalProfitHistory: true,
        history: ['deposits', 'withdrawals', 'dividends', 'realizedGain', 'prepaidTax', 'minimumPrincipal'],
      },
      sourceModule: {
        ...source,
        source: 'norwegian-ask.cashle',
        dependencies: [
          { ...source, provider: 'cashle.finance.no-ask.policy', source: 'norwegian-ask-tax.cashle' },
        ],
      },
      usageModel: 'identity',
    })],
  };
}
