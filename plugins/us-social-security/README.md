# US Social Security retirement

Add the benefit in Savings and set its payment timing in Income. Both entries
edit one benefit. It contributes lifetime income and has no balance in net worth
or inheritance. This plugin covers the individual's own Social Security
retirement benefit.

## Enter the SSA estimate or award

Enter a gross monthly amount in today's USD. The full retirement age estimate
option applies the federal early-claim reduction and delayed retirement
credits. It uses full retirement age 66 for the 1943–1954 cohorts, 66 plus two
months per birth year through 1959, and 67 from 1960 onward. A January 1 birthday
uses the previous year's rules. Early claims reduce the estimate by 5/9 of 1%
for each of the first 36 months and 5/12 of 1% for additional months. After full
retirement age the forecast adds 2/3 of 1% per credited month through age 70.
When someone claims before 70, credits earned in the claim year affect the
following January entitlement. A start after 70 earns the same credits as a
start at 70.

For someone receiving benefits, choose the award option and enter their gross
monthly payment with the original claim start. The same option accepts an SSA
estimate for a particular claim start or an amount SSA has already adjusted.
Update that estimate if you change the intended claim month. Estimated benefits
assume eligibility, which ordinarily requires 40 credits. The forecast uses
the entered SSA amount for earnings history and any expected future earnings.
A claim before full retirement age assumes either that earnings are below the
retirement earnings-test limit or that the amount entered already reflects
the applicable withholding. The plugin projects the worker's own retirement
benefit. Spousal and survivor benefits, suspension, retroactive awards,
Medicare premiums and separately modeled earnings-test adjustments are outside
its scope.

## Claim and payment timing

Choose an age, specific date, retirement or another milestone. The first
possible entitlement month is the first full month at age 62. Enter the
recipient's day of birth for the first- and second-day rules. Cashle's default
assumes a birthday after the second day of the month. A date within a month
selects the following entitlement month. Earlier requests move to the first
eligible month. Payments are booked at the end of the month following
entitlement. The final payment represents the preceding month when the
recipient dies. The forecast uses case inflation as a proxy for SSA cost-of-living
adjustments and converts USD at the case exchange rate.

## Tax

Use the updated US tax plugin for federal combined-income taxation. The gross
payments enter the annual assessment separately from wages and do not produce
FICA. Verified state coverage is AK, FL, NV, SD, TN, TX and WY. Other states
and DC use the existing explicit local estimate with a separate retirement
income setting. When filing separately, enter whether you lived apart from
your spouse for the entire year. The country tax plugin supports federal
individual returns for full-year U.S. residents. [US tax plugin](../us-tax/README.md)

## Direct model

Run the [direct Cashle model](doc/direct-model.cashle) with both plugins on the
classpath from the repository root.

```sh
cashle plugins/us-social-security/doc/direct-model.cashle \
  --classpath plugins/us-social-security:plugins/us-tax
```

[SSA estimates](https://www.ssa.gov/prepare/get-benefits-estimate) ·
[Full retirement age](https://www.ssa.gov/benefits/retirement/planner/agereduction.html) ·
[Early-claim reductions](https://www.ssa.gov/oact/quickcalc/earlyretire.html) ·
[Delayed credits](https://www.ssa.gov/benefits/retirement/planner/delayret.html) ·
[Birthday rules](https://secure.ssa.gov/poms.nsf/lnx/0300615015) ·
[Retirement payments and earnings test](https://www.ssa.gov/pubs/EN-05-10077.pdf) ·
[Benefit eligibility](https://www.ssa.gov/benefits/retirement/planner/credits.html) ·
[Month of death](https://www.ssa.gov/OP_Home/handbook/handbook.03/handbook-0304.html) ·
[IRS Publication 915](https://www.irs.gov/publications/p915)
