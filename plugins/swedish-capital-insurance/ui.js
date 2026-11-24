const provider = 'cashle.finance.se-capital-insurance';
const source = { language: 'groovy-cashle-plugin', source: 'swedish-capital-insurance.cashle' };

export default function createPlugin(context) {
  return { modules: [context.investmentAccount({
    type: 'cashlab.se-capital-insurance', version: 1, kind: 'SEcapitalInsurance', country: 'SE',
    label: 'Kapitalförsäkring (KF)', help: 'Försäkringsbolaget tar avkastningsskatt. Den skattefria grundnivån delas med ISK och andra kapitalförsäkringar.',
    translations: context.translations,
    features: { basis: false, plannedSales: false, canAdd: true, dividendsReinvest: true, history: ['openingValue', 'deposits', 'unpaidBankTax'] },
    sourceModule: { ...source, provider, dependencies: [{ ...source, provider: `${provider}.policy` }] },
    usageModel: 'identity',
  })] };
}
