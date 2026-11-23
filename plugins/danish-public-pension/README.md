# Danish state pension (Folkepension)

Add **Danish state pension** in Savings. The row shows the recipient’s residence-based entitlement. Its Income row edits the same saved pension and controls when payments start. Folkepension is a public benefit with no personal balance, contributions, transferable capital or inheritable asset.

## Entitlement and gross payment

- Enter the recipient’s share of a full pension, as a whole percentage. Use 100% for full pension. For people reaching pension age from 1 July 2025, Udbetaling Danmark normally measures eligible Danish residence between age 15 and pension age against 90% of that period and rounds the result to a whole percent. Earlier cohorts generally use a 40-year denominator. The plugin uses the percentage you enter so it can also represent an official decision that includes exceptions or foreign residence. [Eligibility and residence rules](https://www.borger.dk/pension-og-efterloen/folkepension-oversigt/foer-du-gaar-paa-folkepension)
- The estimate uses 2026 rates in DKK before tax. The full basic amount is DKK 7,544 per month and is independent of other income. The maximum monthly supplement is DKK 8,729 for a single person or DKK 4,467 for a recipient with a partner. The reduction starts at DKK 99,200 of annual assessable income if single and DKK 198,800 if partnered, with reduction rates of 30.9%, 16% or 32% for the three household options. The residence percentage scales the resulting basic amount and supplement. [Official 2026 rates](https://www.bm.dk/satser/satser-for-2026/folkepension) · [Supplement income thresholds and reductions](https://www.borger.dk/pension-og-efterloen/folkepension-oversigt/naar-du-er-paa-folkepension)
- Enter one annual assessable income estimate in 2026 DKK. Exclude employment income and include relevant amounts such as ATP and private pension income. If the partner is a non-pensioner, include 46% of their otherwise relevant income. The entered amount and household status apply throughout the forecast. Cashle uses its inflation assumption to carry the result forward from the 2026 rate year and its exchange rate snapshot to convert from DKK.

## Start and deferral

The cohort table uses birth year and month from the case and the published pension ages of 65 to 70, including the half-year cohorts. The first eligible month begins on the first of the month after the statutory pension age is reached. Start there or request an age, date or model milestone. The forecast moves a request to the first of the month on or after that request and applies the statutory floor. Cashle ages resolve in the birth month. The pension is modeled as monthly in arrears on the calendar month-end, a simplification of the Danish last banking day. Payments stop at the recipient’s Cashle life milestone, with no partial final month. [Pension age, applications and payment dates](https://www.borger.dk/pension-og-efterloen/folkepension-oversigt/foer-du-gaar-paa-folkepension)

Ordinary late claiming receives the regular benefit from the chosen lawful month. For one continuous work-qualified deferral, enter the lifetime waiting-supplement percentage from Udbetaling Danmark, or its official estimator for a forecast. The pension starts at most ten years after the earliest eligible month in this mode. The percentage applies to the regular gross benefit after an actual deferral. The user supplies a percentage appropriate to the modeled start and assumes the annual work requirement is satisfied, ordinarily 750 hours with proration for partial calendar years. The forecast covers the lifelong supplement option. It omits catch-up or lump-sum payments, the ten-year supplement, temporary suspensions, and survivor or ancillary benefits. [Official deferral choices and requirements](https://www.borger.dk/pension-og-efterloen/folkepension-oversigt/udskudt-pension) · [Waiting supplement estimator](https://www.borger.dk/Handlingsside?selfserviceId=d16aa124-b77e-428f-8f02-89d1bffb39ae)

[ATP Livslang Pension](https://www.borger.dk/pension-og-efterloen/atp-livslang-pension-oversigt/atp-bidraget) is a separate contribution-based scheme and can be entered as its own income. This plugin emits taxable `pension` receipts. A case with no tax provider records gross income. The separate Danish tax plugin supports pension-only income under its 2026 individual assessment rules and currently rejects salary income at pension ages. The Folkepension household-status input applies only to the pension supplement.

## Direct model

From this directory, run the same source calculation with the Cashle CLI.

```sh
cashle doc/direct-model.cashle --classpath .
```

The example requests June 2026 for a recipient born in July 1959. The earliest eligible month is August 2026. The model records DKK 16,273 in each of August, September and October, and DKK 48,819 gross in total.
