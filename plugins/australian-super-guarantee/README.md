# Australian Superannuation Guarantee

Add **Australian Superannuation Guarantee** in Savings to record an individual’s standard taxed super fund balance, qualifying pay and assumed return. Its Income row controls the same entry’s retirement-phase account-based pension. This plan covers an eligible adult employee and one employer’s contribution base. [ATO employer super contributions](https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/growing-and-keeping-track-of-your-super/super-from-your-employer)

## Employer contributions

The forecast starts contributions from 1 July 2026 under Payday Super. It credits 12% of regular qualifying earnings up to the 2026/27 annual employer earnings cap of AUD 270,830, less the standard 15% fund contribution tax. Cashle groups pay and contributions by month and resets the cap each 1 July. For a mid-year plan opening, include this employer’s earlier qualifying earnings since 1 July and put their related received contributions in the opening balance. The model holds the 2026/27 cap and entered earnings fixed in nominal AUD for projections. [Payday Super calculation and timing](https://www.ato.gov.au/businesses-and-organisations/super-for-employers/paying-super-on-payday/how-to-work-out-and-pay-super) · [Maximum contribution base](https://www.ato.gov.au/businesses-and-organisations/super-for-employers/paying-super-on-payday/what-payments-are-qualifying-earnings/maximum-contributions-base) · [Concessional contributions tax](https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/growing-and-keeping-track-of-your-super/caps-limits-and-tax-on-super-contributions/concessional-contributions-cap)

Optionally keep contributions running once pension payments start. These and any amount above the available transfer cap stay in accumulation. The same entered nominal return, after fees and fund tax, applies to both balances. The forecast excludes award rates above the statutory floor, salary sacrifice, multiple-employer and under-18 eligibility rules, the Norfolk Island transition, concessional cap adjustments and additional tax such as Division 293. [Super guarantee rates](https://www.ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds/super-guarantee) · [Division 293](https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/growing-and-keeping-track-of-your-super/caps-limits-and-tax-on-super-contributions/division-293-tax-on-concessional-contributions-by-high-income-earners)

## Retirement income

Choose an age, date or milestone. The forecast begins in the first full eligible month at age 65, or at 60 if you confirm that an employment arrangement ends at age 60 or older by the modeled start. The month after the birthday is used because the case records the birth month. Enter the available personal transfer balance cap from the ATO, defaulting to the 2026/27 general cap of AUD 2.1 million for a first transfer. The forecast treats the modeled start as a new account-based pension. [Conditions of release](https://www.ato.gov.au/tax-and-super-professionals/for-superannuation-professionals/apra-regulated-funds/paying-benefits/releasing-benefits/conditions-of-release) · [Transfer balance cap](https://www.ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds/transfer-balance-cap)

The account-based pension pays a monthly share of the minimum required under the age table, or your desired monthly amount when higher. Cashle determines that minimum from the pension balance and age at commencement or at the start of each 1 July financial year. It prorates the initial year by days and rounds to the nearest AUD 10. A June start has a zero minimum for the first financial year. Payments stop when the pension balance is depleted or the member’s life ends. [Annual minimum pension payments](https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/self-managed-super-funds-smsf/paying-smsf-benefits/income-stream-pension-rules-and-payments)

For an Australian resident aged 60 or older, payments from the modeled taxed-source account-based pension are exempt from Australian personal income tax. The forecast excludes untaxed components, capped defined benefits, transition-to-retirement pensions, early release, lump sum and death benefit distributions, and foreign tax treatment. [ATO tax on super benefits](https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/withdrawing-and-using-your-super/early-access-to-super/tax-on-super-benefits)

## Direct model

From this directory, run the source calculation with the Cashle CLI.

```sh
cashle doc/direct-model.cashle --classpath .
```

The member requests age 60 without confirming qualifying employment cessation, so payments start in July 2027 at age 65. The 2026/27 modeled employer contributions add AUD 27,624.66 after contributions tax. The pension pays AUD 2,845 in its first three months.
