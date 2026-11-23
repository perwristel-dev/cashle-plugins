# US traditional 401(k)

In Savings, enter the vested pre-tax balance for one employer's plan.
Income edits the distributions from that same balance. The account is part of
net worth and stays reserved for the plan's distributions. Enter a separate
account for each employer. Roth balances, after-tax basis, loans, rollover
transactions and beneficiary payouts require separate handling.

## Contributions and distributions

Enter the expected nominal annual return and, if applicable, the pre-tax amount
the plan receives monthly from payroll and employer contributions. Enter a stop
date for contributions. The forecast applies case inflation to that monthly
amount. Model any employee deferrals in your salary and payroll tax assumptions
as well. The plugin credits the plan using your entered contributions. Employer
match, vesting, payroll deduction and statutory contribution limits are
determined by the employer plan and existing salary assumptions. The ordinary
2026 elective deferral limit is $24,500 and the general annual additions limit is
the lesser of $72,000 and 100% of compensation, before permitted catch-up
contributions. [IRS 2026 contribution limits](https://www.irs.gov/irb/2025-49_IRB) ·
[IRS Topic 424](https://www.irs.gov/taxtopics/tc424)

Select a distribution method available in your employer's plan.

- **Required minimum only** sends the required amount each December.
- **Lump sum** distributes the remaining balance once.
- **Monthly installments** divide the current balance by the number of monthly
  payments remaining, with an annual top-up if needed for the required minimum.
  Choose a projected term from 1 to 40 years that your plan permits.
- **Lifetime annuity** pays the plan's quoted gross monthly lifetime amount and
  removes the converted balance. The model first pays any remaining
  account-based minimum for that year. Enter the plan's quote after that
  distribution. The quote is a fixed nominal monthly amount and should reflect
  the plan's annuity rules. For an annuity already in payment, enter zero opening
  capital, the monthly amount and its historical start.

Set a voluntary start by age, date, retirement or another milestone. Payments
are recorded at month end. The forecast uses age 59½ for ordinary pre-tax
distributions. If the employer imposes a later eligibility date, enter the
confirmed date and the model will delay the requested start. Separation after
age 55 and other exceptions to the additional 10% tax require separate plan and
tax facts. [IRS 401(k) distribution rules](https://www.irs.gov/retirement-plans/plan-participant-employee/401k-resource-guide-plan-participants-general-distribution-rules) ·
[IRS significant ages](https://www.irs.gov/retirement-plans/retirement-topics-significant-ages-for-retirement-plan-participants)

## Required minimum distributions

The forecast takes required minimum distributions starting in the applicable
year, including during a voluntary installment term. It uses 73 for the
1951–1959 cohorts and 75 from 1960 onward, with the earlier thresholds of 70½ or
72 for older cohorts. The 1959 assumption follows the proposed Treasury
clarification. For a still-employed participant, select the deferral only if
the plan permits it and the participant is not a 5% owner. Enter the separation
date as the first allowed distribution date to defer the first required year
until then where applicable.

The plugin uses the Uniform Lifetime Table and the prior December 31 balance,
with the January 1 opening balance serving as that balance at plan start. For a
midyear plan start when a minimum applies, enter the remaining amount confirmed
by the plan. It forecasts the first required payment in its applicable calendar
year, without the optional following-April delay. The separate IRS table for
a sole spouse beneficiary more than 10 years younger requires different
assumptions. After conversion, the plan's quoted annuity determines payments
for life. On death, the forecast ends owner distributions and preserves any
remaining unconverted balance as an estate asset.
[IRS required minimum distribution FAQs](https://www.irs.gov/retirement-plans/retirement-plan-and-ira-required-minimum-distributions-faqs) ·
[Uniform Lifetime Table](https://www.irs.gov/publications/p590b) ·
[Treasury regulations and 1959 proposal](https://www.irs.gov/irb/2024-33_IRB)

## Tax and direct model

With U.S. tax enabled, the updated US tax plugin supplied with Social Security
assesses distributions as ordinary pension income outside FICA. Verified state
coverage is AK, FL, NV, SD, TN, TX and WY. Other states and DC require the
existing explicit local estimate and a retirement inclusion choice.
[US tax plugin](../us-tax/README.md) · [IRS Topic 424](https://www.irs.gov/taxtopics/tc424)

The [direct Cashle model](doc/direct-model.cashle) demonstrates gross
distributions and runs with this plugin alone.

```sh
cashle plugins/us-401k/doc/direct-model.cashle --classpath plugins/us-401k
```
