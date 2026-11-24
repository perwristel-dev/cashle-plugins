# Danish tax plugin

This source plugin provides Denmark's 2026 personal income tax assessment,
foreign listed-share rules and private-home sale rules. Its tax-residence and
property editors include Swedish and English catalogues. The policy supports
ordinary single-person assessments with full-year residence.

Salaries subject to labour market contributions and taxable pension
payments can be combined before, during and after retirement. The
additional senior employment deduction applies automatically from the
2026 income year in the five calendar years before the year the taxpayer
reaches their cohort’s state pension age. The 2026 deduction is 8.5% of
eligible pay, up to DKK 37,000. It reduces the municipal and church tax
base. Forecasts retain the 2026 rate and limit in 2026 money, using each
simulated year and the taxpayer’s actual birth cohort for eligibility.
The additional single-parent deduction remains outside this assessment.
[Skattestyrelsen’s employment deductions](https://skat.dk/borger/fradrag/arbejdsrelaterede-fradrag/beskaeftigelses-og-jobfradrag) ·
[Act No. 1000 of 17 November 2026](https://www.retsinformation.dk/eli/accn/A20260100030/pdf) ·
[State pension ages](https://www.borger.dk/pension-og-efterloen/Folkepension-oversigt/foer-du-gaar-paa-folkepension)

Build the installation ZIP with Node.js and `zip` from the repository root.

```sh
node plugins/danish-tax/build.mjs
```

Install `cashle-tax-dk-source.zip` in Cashle's personal plugin repository,
enable it and reload. Select Denmark as a tax residence or property tax
jurisdiction. Existing cases use the same country and saved input keys.

Run the [direct model](doc/direct-model.cashle) using a Cashle build that
supports the [country tax DSL](../../cashle-plugin-groovy/README.md#country-tax-policies).
The model accrues DKK 215,672.79 in tax for 2026 on a DKK 50,000 monthly salary.

```sh
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/danish-tax/doc/direct-model.cashle --classpath plugins/danish-tax
```

[Rule provenance](doc/rule-provenance.json)

## Ordinary listed shares

The [Danish listed-share depot](../danish-listed-stock-account/README.md)
contributes eligible gains, dividends and verified losses separately to the
annual assessment. The existing share-income bands apply to the positive
total. Eligible listed losses offset other eligible listed income for the same
taxpayer and fall into an indefinite carry when they exceed it. Enter an
existing verified carry in the listed-share depot in nominal DKK at the start
of the forecast. Earlier profiles can retain their previously saved carry. Generic `shareIncome` still enters the shared bands. It does
not draw down the listed-share loss balance because it does not establish
eligibility.
[Danish Tax Agency guidance on listed-share losses](https://skat.dk/en-us/borger/aktier-og-andre-vaerdipapirer/skat-af-aktier)

Select a municipality in the tax profile. Cashle uses the 2026 municipal and
church rates from Statistics Denmark. Church tax applies when membership is
selected. The profile uses the individual full-year assessment without
spousal transfers or the single-parent supplement. [Statistics Denmark PSKAT](https://www.statbank.dk/PSKAT)
