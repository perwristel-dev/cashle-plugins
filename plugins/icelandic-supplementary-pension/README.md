# Icelandic voluntary supplementary pension savings

Add an individual voluntary supplementary account in Savings. Enter the
approved first-home withdrawal and any later taxable full withdrawal in Income.
This model follows the standard séreignarsparnaður arrangement where the
employee contributes 2% or 4% of pensionable pay and the employer adds 2%.
Enter the pensionable monthly pay and an optional stop date to project the
credits. Use zero pay to model existing savings alone. Enter the employee's
contribution in the existing Icelandic tax profile or in the entered take-home
pay. This module credits the pension account and leaves the payroll deduction
with those inputs so it is counted once. It assumes steady pay and uses an
optional nominal return after fees.
[Ísland.is on voluntary contributions](https://island.is/en/apply-for-retirement-pension/the-effect-of-pension-fund-income-on-the-old-age-pension-from-tr)
[Ísland.is on pension contribution deductibility](https://island.is/en/pension-fund-contribution)

Enter only the tax-free lump sum Skatturinn approved for this specific account,
and use the expected fund payment date. Payment is limited by the balance and
reduces the pot. The first-home program applies to approved contributions. The
2026 annual limits are ISK 333,000 employee and ISK 167,000 employer, subject
to contribution percentages and the combined 120-month entitlement. Later caps
are subject to indexation. Eligibility also depends on housing ownership and
application timing. The source uses the approved amount to account for these
facts. It models the payment from existing pension savings outside taxable income.
[Act 111/2016, articles 2–5](https://www.althingi.is/lagas/nuna/2016111.html)
[Ísland.is first-home savings](https://island.is/en/private-pension-savings-used-for-first-home)

Ordinary voluntary savings can be paid out from age 60. Enter an expected date
for a taxable full withdrawal. Any first-home withdrawal on that date is paid
first. The balance is included as ordinary pension income by the existing IS tax
source. Leave the date blank to retain the pot. The calculation covers a standard
full withdrawal and one approved first-home lump sum. Direct repayments to a
mortgage, specified private pension and disability or estate payments have
separate terms.
[Ísland.is retirement and age 60](https://island.is/en/life-events/Retirement)
[Ísland.is taxable pension payments](https://island.is/en/payments-to-individuals-and-tax-rules)

Build with `node plugins/icelandic-supplementary-pension/build.mjs`. Run the
[direct model](doc/direct-model.cashle) with the Cashle CLI and the supplementary
pension and Icelandic tax folders on its classpath.
