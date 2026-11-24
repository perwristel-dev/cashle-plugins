# UK home purchase tax

Link the expense to an upcoming home acquisition in Cashle. Enter the property's
jurisdiction, its total nominal chargeable consideration in GBP, and the tax
category verified for the buyers at completion. Use one expense per transaction.
If stamp or transfer duty is already included in a separate cost, enter it only
once. The plugin applies the rates in force in November 2026, applicable to the
supported types of acquisition from 1 April 2025. Forecasts reuse these bands.

| Jurisdiction | Supported calculation |
| --- | --- |
| England and Northern Ireland | SDLT standard bands, first-time buyer relief up to £500,000, additional-dwelling rates and the 2% non-resident surcharge when applicable |
| Scotland | LBTT standard bands, first-time buyer nil band of £175,000 and 8% Additional Dwelling Supplement when applicable |
| Wales | LTT main and higher residential bands |

This covers a single ordinary residential purchase by individuals with an
effective date at completion. Determine first-time buyer, additional-home and
SDLT non-resident status from the transaction facts. Mixed use, linked or
multiple-dwelling transactions, lease rent, specialist reliefs, transition
contracts and later refunds are outside the calculation. The expense is budgeted
at completion and follows the linked acquisition. This models the funds needed
for the purchase. Filing and tax payments still follow each authority's actual
deadline. The existing UK income-tax plugin handles residence relief and CGT on
sale separately.

- [HMRC SDLT rates and first-time buyer relief](https://www.gov.uk/stamp-duty-land-tax/residential-property-rates)
- [HMRC additional-dwelling rules](https://www.gov.uk/guidance/stamp-duty-land-tax-buying-an-additional-residential-property)
- [HMRC non-resident surcharge](https://www.gov.uk/guidance/rates-of-stamp-duty-land-tax-for-non-uk-residents)
- [Revenue Scotland residential rates](https://revenue.scot/taxes/land-buildings-transaction-tax/residential-property)
- [Revenue Scotland additional dwelling supplement](https://revenue.scot/taxes/land-buildings-transaction-tax/additional-dwelling-supplement-ads)
- [Welsh Revenue Authority rates](https://www.gov.wales/land-transaction-tax-rates-and-bands)

Build with `node plugins/uk-home-purchase-tax/build.mjs`. Run the [direct
model](doc/direct-model.cashle) through the Cashle CLI with
`--classpath plugins/uk-home-purchase-tax`. The example links £10,000 of SDLT
to a £500,000 first-home purchase in England or Northern Ireland.
