# United States tax plugin

The ZIP includes the 2026 United States country policy, its income and property settings, and Swedish and English messages. It retains federal income tax, employee FICA, capital loss carry by term, and the local income estimate. Traditional pre-tax pension distributions and the taxable
portion of Social Security benefits use the ordinary income brackets. The property
policy covers the Section 121 exclusion and the federal payment calendar. See the [rule research](../../docs/tax-north-america-research.md).

## Retirement income

Use `pension` for wholly taxable traditional pension and traditional 401(k)
distributions. Use `socialSecurityBenefits` for gross Social Security
retirement benefits. The federal assessment uses combined income, which adds
half the gross benefit and tax-exempt interest to supported adjusted gross
income before the benefit. It applies the IRS 50% and 85% bands and includes
the taxable amount in adjusted gross income. Pension and benefits stay outside
employee FICA and net investment income. The federal annual tax still uses
the usual standard and senior deductions.

For married filing separately with Social Security, select whether the spouses
lived apart all year. When applicable, enter the annual tax-exempt interest.
Separate filing, head of household and single are available in a Cashle plan.
Direct assessment also accepts joint returns with combined inputs.

Verified state treatment covers AK, FL, NV, SD, TN, TX and WY. If using the
estimated flat state/local rate, choose which types of retirement income to
include under the local estimate. The estimate applies the federal Social
Security inclusion formula to locally included income. State-specific
retirement exclusions and thresholds require the user's own effective-rate
assumption. Special federal exclusions, prior-year benefit repayments and
lump-sum elections require additional tax facts. [IRS Publication 915](https://www.irs.gov/publications/p915) ·
[IRS Topic 424](https://www.irs.gov/taxtopics/tc424)

Build the package from the repository root with Node.js and `zip`:

```sh
node plugins/us-tax/build.mjs
```

Upload `cashle-tax-us-source.zip` to the personal plugin repository, enable it, and reload Cashle. Existing plans use the same `US` country code and saved fields.

The [direct model](doc/direct-model.cashle) assesses USD 5,800 of federal income tax and USD 5,087.25 of employee FICA on USD 66,500 of annual Texas salary:

```sh
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/us-tax/doc/direct-model.cashle --classpath plugins/us-tax
```
