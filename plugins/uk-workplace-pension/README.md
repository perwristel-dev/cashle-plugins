# UK workplace pension under auto-enrolment

Add one uncrystallised defined-contribution pot in Savings and choose its
withdrawals in Income. The plugin projects the standard qualifying-earnings
basis with minimum contributions and relief at source. Enter the gross monthly
pay and confirmed active membership dates. Other pensionable pay definitions,
contribution rates, salary sacrifice and net pay arrangements require their own
payroll treatment.

From 6 April 2026 the monthly qualifying band is £520 to £4,189. The pot gets
8% of earnings in the band, consisting of 3% from the employer and 5% gross
from the employee. Basic-rate relief at source funds 1 percentage point and
4 points come out of shared cash. The plan should record gross payroll income
separately. The monthly joining trigger is £833 and automatic enrolment normally
applies from age 22 to State Pension age. Confirmed members can continue to
contribute on qualifying earnings below the joining trigger. The dates and pay
entered here describe actual membership. The model holds the 2026/27 thresholds
constant in later years and excludes additional personal tax relief and allowance
charges. The return assumption is nominal and net of charges.
[The Pensions Regulator’s thresholds](https://www.thepensionsregulator.gov.uk/en/business-advisers/automatic-enrolment-guide-for-business-advisers/automatic-enrolment-earnings-threshold)
[Minimum contributions](https://www.gov.uk/workplace-pensions/what-you-your-employer-and-the-government-pay)
[Ongoing membership below the joining trigger](https://www.thepensionsregulator.gov.uk/en/ae-questions-and-answers/general/do-contributions-have-to-continue-once-a-member-of-staff-has-been-put-into-a-pension-scheme-but)
[HMRC relief at source](https://www.gov.uk/tax-on-your-private-pension/pension-tax-relief)

The normal minimum pension age is 55 before 6 April 2028 and 57 from that
point. Enter a later date if the scheme requires one and enter the exact birth
day when timing matters. Otherwise the projection uses the last day of the birth
month. Choose the earliest eligible date in the plan, an age, an explicit date,
or a milestone. An early choice moves to the first permitted date. Milestone
withdrawals post at month end. Each withdrawal is checked at its payment date.
Protected pension ages, ill-health access and other exceptions need scheme-specific
terms. Contributions can continue while withdrawals are taken if the membership
inputs still apply. Check money purchase annual allowance implications separately.
[HMRC normal minimum pension age](https://www.gov.uk/government/publications/increasing-normal-minimum-pension-age/increasing-normal-minimum-pension-age)
[HMRC on the age transition and UFPLS](https://www.gov.uk/government/publications/pension-schemes-newsletter-180-april-2026/newsletter-180-april-2026)

Select a whole-pot withdrawal or a monthly amount through uncrystallised funds
pension lump sums (UFPLS) if the provider offers it. Gross payments are limited
by the available pot. The tax-free amount is up to 25% of each payment, capped
by the allowance you allocate to this pot. Enter the lower of the remaining lump
sum allowance and the remaining lump sum and death benefit allowance. Allocate
that amount only once across the pots in the plan. The standard allowance starts
at £268,275. The balance of each payment is taxable pension income when using the
UK tax source that supports pension income. The pot remains outside the general
household withdrawal order. Annuities, crystallised flexi-access drawdown and
small-pot elections have separate rules.
[HMRC UFPLS and permitted maximum](https://www.gov.uk/hmrc-internal-manuals/pensions-tax-manual/ptm063300)
[Tax-free amounts](https://www.gov.uk/tax-on-pension/tax-free)

Build with `node plugins/uk-workplace-pension/build.mjs`. Run the [direct
model](doc/direct-model.cashle) with the Cashle CLI and
`--classpath plugins/uk-workplace-pension`. In the example, monthly contributions
of £198.40 include £99.20 paid by the member. The first two £1,000 withdrawals
contain a total of £350 tax-free and £1,650 taxable pension income.
