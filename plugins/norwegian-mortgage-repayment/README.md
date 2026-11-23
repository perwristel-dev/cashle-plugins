# Norwegian mortgage repayment requirement

Choose the dwelling and a linked installment loan. The model counts
outstanding principal on all active loans linked to the dwelling when it
checks whether the loan-to-value ratio exceeds 60%. Above that threshold,
the annual minimum is the lower of 2.5% of the selected loan's granted amount
and the principal due in the corresponding year of a 30-year annuity.
[Utlånsforskriften §§ 7 and 9](https://lovdata.no/dokument/SF/forskrift/2020-12-09-2648)

The forecast divides this annual amount into twelve month-end installments.
It uses the loan's projected rate for a full month and holds that rate
constant for the benchmark annuity. The loan itself continues to book
interest. When no lender figures are entered, the forecast uses the modeled
property value, the selected loan's opening principal and its modeled start
date. Enter the lender's figures for an existing loan or for a fixed
valuation. The app checks the threshold at each payment. A higher projected
property value is a forecast assumption for future lender valuations.

Use the bank's agreed payments when an exception or different terms apply.
The plugin covers ordinary installment mortgages. It does not calculate the
combined installment and revolving-credit rule, joint debt that is absent
from the model, additional collateral, refinancing exceptions, temporary
payment deferrals or the lender's flexibility quota.
[Finance Ministry guidance](https://www.regjeringen.no/no/tema/okonomi-og-budsjett/finansmarkedene/utlansforskriften2/id3077676/),
[Finanstilsynet guidance](https://www.finanstilsynet.no/nyhetsarkiv/rundskriv/2024/praksis-for-lan-til-forbrukere/),
[Finanstilsynet 2026 mortgage survey](https://www.finanstilsynet.no/publikasjoner-og-analyser/boliglansundersokelser/2026/boliglansundersokelsen-2026/informasjon-om-utlansforskriften/)

Build the catalog with `npm run build` from the repository root. The
[direct Cashle model](doc/direct-model.cashle) loads the plugin source.

```sh
cashle plugins/norwegian-mortgage-repayment/doc/direct-model.cashle --classpath plugins/norwegian-mortgage-repayment
```
