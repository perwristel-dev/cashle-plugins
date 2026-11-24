# Icelandic occupational pension

This plugin projects the lifetime old-age income that members earn in the
mutual insurance division (*samtrygging*) of an Icelandic occupational pension
fund (*lífeyrissjóður*). Enter the recipient, the fund's gross monthly estimate in today's ISK and the payment terms in one Income record. The engine records the fund's payments as income, with no
balance in net worth.

## Use the fund's statement

Enter the fund's estimated monthly benefit for your chosen start. Use its
projection if you want the amount to include expected future contributions.
Update the estimate when your chosen start or the fund's assumptions change.
Use a separate entry for each fund or division with different terms.

Set the earliest and latest claim ages confirmed by the fund. The initial
settings both use age 67. Many funds use age 67 as the standard age and allow
a wider range. LSR Division A permits ages 60–80. LSR Division B generally
uses age 65 and has separate conditions for earlier retirement. Use the
person's own fund terms to set the range.

Choose a start by age, date or milestone and set the fund's monthly payment
day. A month-end payment can start at the end of the birthday month. A
first-day payment based on age starts in the following month. Dates and
milestones use the first modeled payment day on or after the request, within
the chosen age range. A conditional milestone that has yet to resolve by the
latest claim age starts at the last eligible payment date.

The plugin models full monthly payments through the recipient's month of
death. It uses the case's inflation assumption for CPI indexation and converts
to the case currency using the selected exchange rates. The selected tax
provider receives the gross income under the `pension` basis. The existing
Icelandic tax plugin supports that basis.

## Scope

Iceland generally requires pension fund membership from 16 to 70 for employees
and self-employed workers. The law sets a minimum total contribution of 15.5%
of the contribution base, with a transitional exception for older collective
agreements. At LSR Division A, members typically contribute 4% and employers
11.5%. Benefit accrual depends on the fund, its actuarial tables and whether
contributions also fund specified personal savings. This model uses the
member's quoted lifetime benefit and leaves contribution deductions and detailed
accrual to the fund estimate and the tax profile.

The quote should cover the mutual insurance benefit only. Public old-age
pension from Tryggingastofnun, specified individual savings (*tilgreind
séreign*) and voluntary supplementary savings are separate benefits. When
projecting the public pension, include this occupational pension in the
public pension's assessable-income assumptions where applicable.

The forecast uses calendar payment days. Fund-specific business days and
application cutoffs can shift an actual payment. Staged half pensions,
small-entitlement cash-outs, specific indexation adjustments, transfers to
spouses, disability pensions, and survivor benefits require separate handling.

## Build and run

Build the ZIP with `node plugins/icelandic-occupational-pension/build.mjs` and
install it through Cashle Lab's plugin settings. The provider ID is
`cashle.finance.pension.is-occupational`. The [direct model](doc/direct-model.cashle)
runs the same calculation with the Icelandic tax plugin.

```sh
cashle plugins/icelandic-occupational-pension/doc/direct-model.cashle \
  --classpath plugins/icelandic-occupational-pension:plugins/icelandic-tax
```

## Sources

- Mandatory participation, minimum contributions, lifetime CPI-indexed benefits and member statements. [Act 129/1997, articles 1–4, 14 and 18](https://www.althingi.is/lagas/nuna/1997129.html)
- How the mandatory mutual insurance pension, specified savings and voluntary savings interact with the TR pension. [Ísland.is](https://island.is/en/apply-for-retirement-pension/the-effect-of-pension-fund-income-on-the-old-age-pension-from-tr)
- LSR's 4% employee and 11.5% employer split, claim ages, monthly payment dates and member projections. [LSR Division A overview](https://www.lsr.is/en/pensions/division-a/overview/) [LSR retirement payments](https://www.lsr.is/en/pensions/division-a/pension-payments/pensions/) [LSR Division B overview](https://www.lsr.is/lifeyrir/b-deild/yfirlit/)
- Examples of month-end payments and fund-specific cutoff dates. [Gildi pension fund](https://www.gildi.is/en/pensions/retirement-pension) [Lífeyrissjóður verzlunarmanna](https://www.live.is/en/frequently-asked-questions/lifelong-pension/)
- Income tax on pension payments. [Ísland.is](https://island.is/en/tax-on-wages-and-pensions)
