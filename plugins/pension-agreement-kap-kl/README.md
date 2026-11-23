# KAP-KL occupational pension agreement

One package offers KAP-KL in both Swedish occupational pension editors.
In Cashle Lab, install the package alongside the [premium-defined](../swedish-dc-pension/README.md)
and [benefit-defined](../swedish-db-pension/README.md) pension types you use.
Select KAP-KL for earnings or accrued rights that fall under the agreement.
Most municipal and regional employees transferred to AKAP-KR in 2023.
[SKR's agreement and transition information](https://skr.se/kollektivavtal/pensionerochavtalsforsakringar/tjanstepensionenligtkollektivavtal.9234.html)

| Part | Saved scheme | Engine provider |
| --- | --- | --- |
| Premium-defined | `KAP-KL-DC` | `cashle.pension.agreement.KAP-KL-DC` |
| Benefit-defined | `KAP-KL-DB` | `cashle.pension.agreement.KAP-KL-DB` |

## Premium-defined old-age pension

The model accrues 4.5% on calendar-year pensionable earnings up to 30 income
base amounts, starting the month after age 21. Annual premiums at or below
1% of the income base amount stay outside pension capital. Payout starts
from age 62 and can be lifelong or for at least ten years.
[SKR agreement §§ 9–15](https://skr.se/download/18.1cbfb60f198e5f62f5957f2a/1756457601570/Overenskommelse-om-kollektivavtalad-pension-KAP-KL.pdf),
[2017 amendment to § 11](https://www.ofr.se/wp-content/uploads/2018/04/forhprot-170427-overenskommelse-om-andringar-i-kap-kl-samt-bilagor-1-37.pdf),
[KPA's premium-defined rules](https://www.kpa.se/arbetsgivare/kunskapsbank/tjanstepension-kap-kl/avgiftsbestamd-alderspension/)

The projection credits earned premiums at the end of the accrual year. Employers
generally remit by 31 March of the following year. The projection applies the
current rate to estimated history and assumes ordinary salary accrual in the
year employment ends. In the year the employee becomes eligible, the shared
salary accumulator uses all wages when applying the annual floor and cap.
Use a pension statement for actual opening capital.

## Benefit-defined old-age pension

The age-65 benefit uses published birth-year rates on the 7.5–20 and 20–30
income base amount bands, scaled by credited service up to 30 years. Service
runs from the month after age 28 to the month before age 65. Choose lifelong
payment (`duration: 0` in a model). The earliest payout age is 61.
[KPA's benefit-defined rules](https://www.kpa.se/arbetsgivare/kunskapsbank/tjanstepension-kap-kl/formansbestamd-alderspension/)

The estimate uses annualized model salary as the pension basis. A provider
calculates that basis from indexed historical earnings and applies the protected
annuity, eligible projected service, payment-age adjustments, and price-base
indexation where relevant.
Enter the provider's accrued annual amount and credited service in statement mode
when they are available. For a payout at an age other than 65, use an amount
quoted for that payout age.

## Build and run

Build with `node plugins/pension-agreement-kap-kl/build.mjs`. The
[direct CLI example](doc/direct-model.cashle) uses both schemes. Run it
with a Cashle distribution that has the providers declared in its `plugins`
block available.

```sh
cashle plugins/pension-agreement-kap-kl/doc/direct-model.cashle
```
