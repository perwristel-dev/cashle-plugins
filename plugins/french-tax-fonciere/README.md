# Taxe foncière on built property

Enter the annual amount and payment date from the official notice, plus the
dates the property was acquired and, if known, disposed of. The annual expense
applies in each year when this household owns the property on 1 January.
Ownership beginning after 1 January first counts in the following year. A
seller who owned it on 1 January still pays the notice for that calendar
year even if the property is sold before the payment date.

The forecast uses the same payment calendar day in later years and applies
plan inflation to the reference notice. Enter the actual net amount due,
including applicable reductions and charges already on the notice. This
plugin covers annual payment in one instalment. Monthly collection, private
prorating between seller and buyer, and cadastral valuation need separate
figures. Add one record per notice for the property or properties it covers.

Run the [direct model](doc/direct-model.cashle) with
`cashle plugins/french-tax-fonciere/doc/direct-model.cashle --classpath plugins/french-tax-fonciere`.

- [Service Public on taxe foncière liability](https://www.service-public.gouv.fr/particuliers/vosdroits/F59)
- [French tax administration on notice and payment dates](https://www.impots.gouv.fr/particulier/questions/quelle-date-vais-je-recevoir-mon-avis-de-taxe-fonciere-et-quand-dois-je-la)
