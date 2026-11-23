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
      help: 'Norge 2026: tillskjutet kapital tas ut först, därefter används skjerming. Förlust får avdrag först vid uttryckligt avslut. Skjermingsräntan för 2026 fastställs efter årets slut och är ännu inte känd; ange ett eget prognosantagande, även om du väljer 0 %. 2025 års 3,6 % är inte en fastställd ränta för 2026.',
      shieldingHelp: "2026 års officiella skjermingsränta är ännu inte publicerad. Ange ett eget antagande även för ett tomt konto som kan få framtida insättningar; 0 % måste också väljas uttryckligen.",
      withdrawalProfitHelp: 'Ange vinstdelen av tidigare uttag före årets avdrag för skjerming, inte uttagna tillskott. Årsberäkningen drar av tillgänglig skjerming en gång. Ange återstående tillskjutet kapital separat under skatteunderlag.',
      translations: context.translations,
      features: {
        basis: true,
        plannedSales: false,
        dividendsReinvest: true,
        canAdd: true,
        shielding: true,
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
