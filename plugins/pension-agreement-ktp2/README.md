# KTP 2 and KTPK occupational pension agreement

KTP 2 remains in force for covered groups, including legacy Fremia–PTK
cohorts and staff under AFO–Handels and Fremia–Forena/Handels/
Akademikerförbunden. The Fremia–PTK main rule places employees born up to 1980
in KTP 2 and employees born from 1981 in ITP 1. Other agreement areas have
different birth-date boundaries and may allow individual elections. Select the
agreement shown on the pension statement.
[PTK coverage overview](https://www.ptk.se/sakfragor/pension-och-forsakring/tjanstepension-ktp/val-och-villkor-inom-ktp/)
[Folksam KTP 2 agreement areas](https://www.folksam.se/sparande/tjanstepension/kooperativa-tjanstepensioner/ktp-2)

## Defined-benefit old-age pension

Select **KTP 2** in a Swedish defined-benefit pension. With 360 months of
credited service, the annual pension at age 65 is 10% of pensionable pay
up to 7.5 income base amounts, 65% from 7.5 to 20, and 32.5% from 20 to 30.
Cashle prorates the annual benefit by supplied or estimated service up to
30 years. Ordinary accrual starts in the month after the 28th birthday
and ends before the month of the 65th birthday. Starting from a statement,
the forecast preserves the reported accrued amount and adds rights from
future service at the modeled pensionable pay.
[Folksam Fremia–PTK terms §§ 5–8](https://s7g10.scene7.com/is/content/folksam/S40575_5284pdf)

Use a statement for coordinated and protected prior rights, including
historical transition benefits. The estimate treats linked annualized pay
as pensionable pay. It leaves the insurer's salary determination, including
holiday supplements, variable-pay averaging and salary caps on late-career
raises, to the statement or entered pensionable wage basis. Cashle's service
tracking uses fractional years. The editor sets the standard age-65 payout.
Early, deferred and temporary pension amounts depend on insurer conversion
factors. The lifetime estimate uses the standard age-65 benefit.
[Folksam KTP 2 conditions and fact sheets](https://www.folksam.se/sparande/tjanstepension/kooperativa-tjanstepensioner/villkor)

## Defined-contribution KTPK-egenpension

Add a separate Swedish defined-contribution pension and select the KTPK
option listed for the employee. Contributions use the same ordinary
accrual ages and pensionable pay up to 30 income base amounts.

| Cashle selection | Scheme ID | Standard premium |
| --- | --- | ---: |
| KTPK (Fremia–PTK), including Fremia–Handels and Fremia–Handels folkrörelse under KTP 2 | `KTPK` | 2.1% |
| KTPK (AFO–Handels) | `KTPK-AFO-HANDELS` | 3.9% |
| KTPK (Folksam) | `KTPK-FOLKSAM` | 3.5% |
| KTPK (LO–TCO Rättsskydd) | `KTPK-LO-TCO-RATTSSKYDD` | 3.1% |

These are rates from the 2026 fact sheets, used as forecast assumptions
when estimating historical capital. Use the pension statement for actual
capital, including previously earned KTPK. The model leaves insurer fees,
optional supplements, alternative high-earner solutions, collective final
payments and family or sickness protection outside the calculation.
[Fremia–PTK fact sheet](https://s7g10.scene7.com/is/content/folksam/S11317_1261pdf)
[AFO–Handels fact sheet](https://s7g10.scene7.com/is/content/folksam/S11014_1269pdf)
[Folksam and LO–TCO Rättsskydd fact sheet](https://s7g10.scene7.com/is/content/folksam/S11319_1268pdf)
[KTPK-egenpension terms § 9.2](https://s7g10.scene7.com/is/content/folksam/S12703_3187pdf)

The DB scheme ID is `KTP2`. Provider IDs use the
`cashle.pension.agreement.` prefix followed by the scheme ID. Build the
source bundle with `node plugins/pension-agreement-ktp2/build.mjs`.
Install it alongside the Swedish [DB](../swedish-db-pension/README.md) and
[DC](../swedish-dc-pension/README.md) pension types and their libraries.
The [direct CLI model](doc/direct-model.cashle) shows both pension parts.
