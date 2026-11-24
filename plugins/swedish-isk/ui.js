export default function (context) {
  const provider = 'cashle.finance.isk';
  const source = { language: 'groovy-cashle-plugin', source: 'swedish-isk.cashle' };
  return {
    modules: [context.investmentAccount({
      type: 'cashlab.isk', kind: 'SEisk', country: 'SE', label: 'Investeringssparkonto (ISK)',
      translations: context.translations,
      advisorHelp: 'Schablonbeskattning med kvartalsvärden och insättningar. Grundnivån 300 000 SEK från 2026 delas per person mellan ISK, kapitalförsäkring och PEPP; den gäller inte separat för varje konto.',
      features: { inlineGrowth: true, quarterOpeningValues: true },
      emigrationSettings: {
        defaultOptions: { securitiesClassification: 'excluded', securitiesTreatyExemptionConfirmed: false, treatyCouponRate: .30 },
        fields: [
          { key: 'securitiesTreatyExemptionConfirmed', kind: 'check', label: 'Bekräftad avtalsbegränsning undantar värdepappersvinster från svensk skatt' },
          { key: 'treatyCouponRate', kind: 'number', label: 'Bekräftad kupongskatt enligt avtal', percent: true, min: 0, max: .30, help: '30 % enligt nationella regler är förval. Skatteavtal kan begränsa svensk utdelningsskatt.' },
        ],
        invalidOptions: 'Ange giltiga inställningar för svensk skatt efter utflyttning.',
        appliesTo: (model, data) => context.sourceResidenceChanges(model)
          .some(row => (!row.owner || row.owner === 'joint' || row.owner === data.owner) && row.settings.country !== 'SE'),
      },
      sourceModule: { ...source, provider, dependencies: [{ ...source, provider: `${provider}.policy` }] },
      usageModel: 'identity',
    })],
  };
}
