export default function (context) {
  return { modules: [context.investmentAccount({
    type: 'cashlab.ca-brokerage',
    kind: 'CAbrokerage',
    country: 'CA',
    label: 'Kanada – aktiedepå (ACB)',
    help: 'Kanada 2026: en pool identiska börsnoterade aktier med genomsnittlig adjusted cost base (ACB). Samtliga identiska aktier för samma person måste ingå i poolen; separata mäklare får inte separata anskaffningsunderlag. Realiserad kapitalförlust får bara kvittas mot kapitalvinst och kan föras framåt. Endast avyttringar utan superficial-lossvillkor stöds; inget automatiskt återköp. Utdelningsklass skiljer utländsk utdelning från eligible/non-eligible kanadensisk utdelning.',
    defaults: { policyOptions: { dividendTreatment: '', noSuperficialLossConfirmed: false } },
    policyFields: [
      { key: 'dividendTreatment', label: 'Verifierad utdelningsklass', kind: 'select', required: true,
        options: [['', 'Välj'], ['foreign', 'Utländsk utdelning / vanlig kapitalinkomst'], ['eligible', 'Eligible Canadian dividends'], ['nonEligible', 'Non-eligible Canadian dividends']] },
      { key: 'noSuperficialLossConfirmed', label: 'Inga superficial loss-köp inom 30 dagar före/efter förlustförsäljningar av mig/närstående (verifierat)', kind: 'check' },
    ],
    features: {
      basis: true, plannedSales: false, dividendsReinvest: true, canAdd: true,
      history: ['deposits', 'withdrawals', 'dividends', 'distributedDividends', 'realizedGain', 'realizedLoss', 'prepaidTax'],
    },
    translations: context.translations,
    sourceModule: {
      language: 'groovy-cashle-plugin',
      provider: 'cashle.finance.ca-brokerage',
      source: 'canadian-brokerage.cashle',
      dependencies: [
        { language: 'groovy-cashle-plugin', provider: 'cashle.finance.ca-brokerage.tax-policy', source: 'canadian-brokerage.cashle' },
      ],
    },
    usageModel: 'identity',
  })] };
}
