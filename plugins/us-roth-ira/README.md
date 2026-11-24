# US Roth IRA

In Investments, use one account for all the owner's Roth IRAs containing
ordinary after-tax contributions. Enter the market value separately from the
unwithdrawn regular contributions in the cost-basis field. Investment returns
and reinvested dividends stay inside the account without annual U.S. income
tax. The account remains part of net worth.

Withdrawals exhaust the owner's regular contribution basis first. Earnings
become available once both the five-tax-year period and the age condition
are met. The five-year period starts on January 1 of the first contribution
tax year, even for a contribution made the next spring for that tax year.
Cashle uses the owner’s birth month and releases earnings in the first full
month after the month of reaching 59½. The model accepts no owner RMDs.

Use explicit withdrawals or enable automatic funding from the desired date. An attempted
earnings withdrawal before qualification is rejected. Conversion and rollover
basis, their separate clocks, inherited IRAs, disability and first-home
exceptions, nonqualified earnings taxes, and excess contribution corrections
require different treatment. Use this account for ordinary U.S. residents with
regular contributions only.

For new deposits, enter the verified regular contribution allowance for this
account in the first calendar year, after contributions to other IRAs. If you
enter this Roth IRA's year-to-date deposits in Cashle, include them in that
allowance. Cashle subtracts those deposits and any projected deposits. Set a
separate allowance for later years if desired.
The model caps annual regular deposits at the applicable 2026 limit, projected
using case inflation. The 2026 limit is $7,500 plus $1,100 at age 50 or older.
Compensation, the income and filing-status phaseout, and contributions across
all IRAs can reduce the actual limit. Treat any remaining allowance, including
the minimum reduced limit where applicable, as an IRS worksheet input.
Withdrawals do not restore contribution room. The model allocates each
contribution to its posting year.

[IRS Roth IRA distributions and ordering](https://www.irs.gov/publications/p590b) ·
[IRS IRA contribution limits](https://www.irs.gov/retirement-plans/retirement-topics-ira-contribution-limits) ·
[IRS allowable Roth contributions and phaseout](https://www.irs.gov/publications/p590a)

The [direct example](doc/direct-model.cashle) closes an existing account after
both age and five-year conditions are met.

```sh
cashle plugins/us-roth-ira/doc/direct-model.cashle --classpath plugins/us-roth-ira:plugins/us-tax
```
