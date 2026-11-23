const acquired = { key: 'acquiredDate', label: 'Faktisk anskaffningsdag / första insättningsdag', kind: 'date' };
const history = ['deposits', 'withdrawals', 'dividends', 'realizedGain', 'realizedLoss', 'prepaidTax'];
const ordinary = { basis: true, plannedSales: false, dividendsReinvest: false, canAdd: false, history };
const validDate = o => /^\d{4}-\d{2}-\d{2}$/.test(o.acquiredDate ?? '') ? [] : ['Ange faktisk anskaffningsdag för den enda aktieposten.'];

const spec = {
 type: 'cashlab.it-conto-ordinario',
 kind: 'ITcontoOrdinario',
 country: 'IT',
 label: 'Conto titoli ordinario (dichiarativo)',
 help: 'Italien 2025: en homogen post noterade aktier med faktiskt anskaffningsvärde, endast deklarativ årsbeskattning. Vinster/utdelning 26 %. Aktieförluster möter aktievinster, aldrig utdelning/ränta, och kan föras i fyra år. Amministrato med kronologisk förlustordning, statsobligationer, fonder och pensionskonton ingår inte. Stämpelskatt 0,2 % beräknas separat från leverantörens faktiska beskattningsvärde och innehavsdagar; inga uttag får automatiskt användas för att gissa värdet. Årsavgiften bokas på årets faktiska årsbeskedsdag 31 december, eller vid avslut med verifierat avslutsunderlag; annan rapporteringsfrekvens ingår inte. Ytterligare köp och återinvesterad utdelning kräver separata anskaffningsposter.',
 defaults: {
   policyOptions: { acquiredDate: '', taxRegime: 'dichiarativo', statementFrequency: 'annual', stampTaxableValue: null, stampHoldingDays: 365 },
 },
 policyFields: [
   acquired,
   { key: 'statementFrequency', label: 'Verifierad årlig leverantörsrapportering för stämpelskatt', kind: 'select',
     options: [['annual', 'Årsbesked (annan rapporteringsfrekvens stöds inte)']] },
   { key: 'taxRegime', label: 'Skatteregim', kind: 'select', options: [['dichiarativo', 'Regime dichiarativo']] },
   { key: 'stampTaxableValue', label: 'Leverantörens faktiska stämpelskattepliktiga värde (EUR)', kind: 'number', money: true, min: 0 },
   { key: 'stampHoldingDays', label: 'Leverantörens faktiska innehavsdagar under året', kind: 'number', min: 1, max: 366 },
 ],
 features: ordinary,
 validateOptions(options) {
   const errors = validDate(options);
   if (options.statementFrequency !== 'annual') errors.push('Bekräfta årligt leverantörsbesked för stämpelskatt.');
   if (options.taxRegime !== 'dichiarativo') errors.push('Välj deklarativ årsregim.');
   if (!Number.isFinite(options.stampTaxableValue) || options.stampTaxableValue < 0 ||
       !Number.isInteger(options.stampHoldingDays) || options.stampHoldingDays < 1 || options.stampHoldingDays > 366) {
     errors.push('Ange faktiskt stämpelskatteunderlag och innehavsdagar.');
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
      provider: 'cashle.finance.it-conto-ordinario',
      source: 'italian-conto-ordinario.cashle',
      dependencies: [{
        language: 'groovy-cashle-plugin',
        provider: 'cashle.finance.it-conto-ordinario.tax',
        source: 'italian-conto-ordinario-tax.cashle',
      }],
    },
    usageModel: 'identity',
  })] };
}
