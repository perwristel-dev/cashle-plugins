# Norwegian public-sector occupational pension

Add **Norwegian public-sector occupational pension** in Income. Enter the gross monthly lifelong amount quoted by Statens pensjonskasse (SPK) or KLP in NOK at the plan’s starting purchasing power. Set the payment start in the same record. Cashle adds the right to the forecast as income when payments begin. The quoted right has no spendable or inheritable account balance.

## Ordinary post-2020 pension

For people born in 1963 or later, this option covers ordinary **påslagspensjon** earned from 2020. For the ordinary claim, choose an age, effective date or case milestone. Cashle expects the application to be timely and moves a request to the first eligible month on or after it. An age request starts in the month after that age is reached. The claim window runs from the month after age 62 to the month after age 75. At age 75 the pension starts even if a selected milestone is still pending. SPK requires at least one year of accrual, so enter an estimate for a right you actually qualify for. [SPK’s ordinary pension guidance](https://www.spk.no/alderspensjon/fodt-i-1963-eller-etter/slik-er-alderspensjon-fra-2020) · [Statens pensjonskasseloven § 26 c](https://lovdata.no/lov/1949-07-28-26/§26c)

The statutory accrual is 5.7% of earnings up to 12 G plus 18.1% of earnings between 7.1 G and 12 G. The pension provider converts the accrued balance to lifetime income using the folketrygd **delingstall** for the member’s cohort and start age. Cashle uses the provider quote as entered, including any projected accrual already in it. Update the quote if you change the withdrawal age or employment assumptions in ways that change what the provider would pay. The model uses the current published age window. Norway has proposed gradually increasing statutory ages. [KLP’s accrual and actuarial rules](https://www.klp.no/pensjon/1963-eller-senere/alderspensjon/pensjonsdeler/paslagspensjon) · [SPK’s notice on future age rules](https://www.spk.no/alderspensjon/saraldersgrense/tidligpensjon/)

## Confirmed awards and payment assumptions

The **Provider-confirmed lifelong award** option uses the exact start month and gross lifetime amount from the provider. It can represent confirmed transitional or special arrangements whose conditions the provider already applied. Use the permanent lifetime amount. AFP, temporary supplements, special-age rules, coordination with NAV and changes to withdrawal percentages are outside the modeled calculation. [SPK’s pension components and transition rules](https://www.spk.no/alderspensjon/fodt-i-1963-eller-etter/)

Cashle books the pension on the 20th of each active month until the recipient’s life milestone. Provider holiday adjustments and the partial final month are omitted. The forecast holds the entered amount constant in real terms from the plan start and uses the case inflation and exchange rates. It contributes gross taxable `pension` income when a tax provider supports that basis. The Norwegian tax package with pension-source support can use these receipts. Cases without tax record gross payments. [SPK payment calendar](https://www.spk.no/nyheter/2026/datoar-for-utbetaling-av-pensjon-2026/) · [KLP payment timing](https://www.klp.no/artikler/skatt-og-utbetaling-av-pensjon-i-desember)

## Direct model

Run from this directory with the Cashle CLI.

```sh
cashle doc/direct-model.cashle --classpath .
```

A person born in February 1966 requests age 60. The earliest eligible month is March 2028, so the quoted NOK 4,200 is paid on 20 March and 20 April.
