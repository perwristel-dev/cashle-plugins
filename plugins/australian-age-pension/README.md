# Australian Age Pension

Add **Australian Age Pension** in Savings to record the public benefit for one person. The same entry appears in Income, where you choose when to start payments. Age Pension is a government payment with no personal account balance. [Services Australia Age Pension](https://www.servicesaustralia.gov.au/age-pension)

## Estimating your payment

Use the Centrelink quote or estimate for your own circumstances. Enter the gross and taxable fortnightly amounts in September 2026 AUD. For a full normal rate, the 20 September 2026 single-person preset is AUD 1,237.70 gross and AUD 1,166.10 taxable per fortnight. The partnered preset is AUD 933 gross and AUD 881.20 taxable per person. The taxable component includes the basic pension and basic Pension Supplement. The additional Pension Supplement and Energy Supplement are exempt. [Age Pension rates](https://www.servicesaustralia.gov.au/how-much-age-pension-you-can-get?context=22526) · [Pension Supplement breakdown and tax treatment](https://guides.dss.gov.au/social-security-guide/3/12/1) · [Energy Supplement tax treatment](https://www.ato.gov.au/individuals-and-families/your-tax-return/instructions-to-complete-your-tax-return/mytax-instructions/2026/income/amounts-that-you-do-not-pay-tax-on)

Confirm the forecast assumes the recipient meets Centrelink residence, income and assets tests for the entered amount. The usual residence requirement is ten years in total, including five continuous years. Use a quoted rate to reflect part pensions, deemed income, Work Bonus, applicable residence exceptions or changes to assessable superannuation. The model holds the assessment constant and projects the amount using plan inflation from the rate date. [Residence rules](https://www.servicesaustralia.gov.au/residence-rules-for-age-pension?context=22526) · [Income test](https://www.servicesaustralia.gov.au/income-test-for-age-pension?context=22526) · [Assets test](https://www.servicesaustralia.gov.au/assets-test-for-age-pension?context=22526)

## Payments and tax

The earliest modeled payment is the last day of the birth month in which the recipient turns 67. Request a later age, date or milestone to defer the first payment to the first month-end on or after that request. The forecast spreads 26 fortnightly payments over 12 monthly installments and stops payments after the recipient’s life milestone. It omits back-pay, partial installments, overseas portability and ancillary payments. [Age Pension eligibility](https://www.servicesaustralia.gov.au/who-can-get-age-pension?context=22526)

With the [Australian tax plugin](../australian-tax/README.md), the taxable component enters annual assessment as pension income and the exempt component remains outside that assessment. Choose **Verified individual assessment** for a senior who needs the applicable Medicare amounts entered manually. Enter any verified Seniors and Pensioners Tax Offset as a non-refundable offset. Without tax, the forecast records both components as income. [ATO government pension income](https://www.ato.gov.au/forms-and-instructions/individual-tax-return-2026-instructions/income-questions-1-12-individual-tax-return-2026/6-australian-government-pensions-and-allowances-2026) · [Seniors and Pensioners Tax Offset](https://www.ato.gov.au/individuals-and-families/your-tax-return/instructions-to-complete-your-tax-return/mytax-instructions/2026/tax-offsets/seniors-and-pensioners-tax-offset)

## Direct model

From this directory, run the source calculation with the Cashle CLI.

```sh
cashle doc/direct-model.cashle --classpath .:../australian-tax
```

The requested date is before the recipient turns 67, so the first payment is 31 July 2026. In 2026/27, the quoted amounts produce AUD 31,200 in payments and AUD 28,600 in assessable pension income. With AUD 24,000 salary, the modeled work deduction of AUD 1,000 and declared zero Medicare and offsets, annual income tax is AUD 5,774, payable on the assumed notice date.
