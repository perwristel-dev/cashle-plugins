# ATP Livslang Pension

Denmark's statutory supplementary labour-market pension. Cashle shows the ATP statement amount under **Savings** and the payout under **Income**. Both rows edit one module. The statement amount is a pension entitlement, with no liquid balance or capital in net worth.

## Inputs and payment rules

- Select the recipient and enter the gross annual ATP pension from their statement or ATP's estimate at ordinary retirement age. Under the 2026 rules, an ATP pension above DKK 3,600 per year is paid monthly for life. For an annual pension of DKK 3,600 or less, enter the gross lump sum quoted by ATP. Cashle applies the 40% levy and records the one net payment in the first eligible month. The amount of the lump sum depends on ATP's capitalisation rules. [ATP statement and payments](https://www.borger.dk/pension-og-efterloen/atp-livslang-pension-oversigt/atp-bidraget) · [2026 capitalisation regulation, §§ 7–8](https://www.retsinformation.dk/eli/lta/2025/1745/pdf)
- Monthly payments start from the first of the month after the recipient reaches the state pension age. Choose the first eligible month, an age, a date, or a case milestone. Cashle rounds up to a month boundary and clamps the start to the ten-year statutory window. The general state pension age is 70 from the 1971 cohort under current law, and future legislative changes may alter it. Cashle stops receipts at the recipient's life milestone. [ATP Act, §§ 9–9a](https://www.retsinformation.dk/eli/lta/2026/976/pdf) · [State pension ages](https://www.borger.dk/pension-og-efterloen/dit-liv-aendrer-sig---tjek-pensionen/naar-du-naermer-dig-pensionsalderen/din-pensionsalder)
- For a later start, optionally enter ATP's gross annual quote for that start. Cashle uses the ordinary quote if no deferred quote is entered. ATP sets separate deferral tariffs each year. Use your current annual gross payment if ATP is already in payment. The monthly receipt uses the ordinary `pension` tax basis. For cash-flow planning the module books at the start of each eligible month, while ATP's banking calendar may settle the payment on the preceding bank day. [ATP deferral quote](https://www.borger.dk/handlingsside?selfserviceid=44d490a6-685a-4f62-8ccd-09532e4a41d4) · [ATP payment arrangements](https://lifeindenmark.borger.dk/pension/atp-livslang-pension)

The projection holds the quoted ATP amounts in nominal DKK and converts at the case exchange rate. ATP contributions, future bonuses, survivor benefits, future threshold changes and historical rules are outside this statement-based estimate. If needed, enter qualifying ATP income separately in the folkepension supplement's assessable-income input.

## Direct model

Run `cashle plugins/danish-atp-pension/doc/direct-model.cashle --classpath plugins/danish-atp-pension` from the catalog repository. The person requests age 66 and receives the first DKK 1,000 payment on 1 August 2026, the month after reaching the statutory age of 67.
