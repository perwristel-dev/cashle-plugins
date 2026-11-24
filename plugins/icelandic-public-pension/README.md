# Icelandic public pension

This plugin projects the ordinary full-rate old-age pension (*ellilífeyrir*)
administered by Tryggingastofnun (TR). Add it in Income to enter the recipient,
years of insured Icelandic residence and two gross annual income estimates in
2026 ISK. Set the payment start in the same record. The engine books only the pension income that
the recipient receives.

## Benefit

- The 2026 full monthly amount is ISK 365,592 before tax. The domestic
  qualifying period is three insured years between ages 16 and 67. The
  residence share reaches 100% at 40 years.
- The annual employment exemption is ISK 2,524,800. The general exemption is
  ISK 523,896 and applies to other assessable income plus employment income
  beyond its exemption. The full amount falls by 45% of income beyond the
  exemptions, down to zero. TR then applies the residence share and any
  actuarial adjustment.
- The first regular payment is on the first day of the month after the
  67th birthday. An age selection uses the month after that birthday. An
  entered date or milestone uses the first payment day on or after the request,
  within the available range. A conditional milestone must occur before its
  payment can start. The payment start can use calendar dates and milestones
  directly. The withdrawal timeline can also shift starts anchored to the
  first of a month.
- The early range starts at age 65 for eligible recipients. The checkbox asks
  the user to confirm approval from all applicable mandatory pension funds and
  the minimum combined monthly pension required for early claims. Deferred
  starts can gain a permanent increase up to age 80 (72 if born before 1952).
  Select the deferral checkbox when the full selected deferral qualifies. For
  people born from 1958 this assumes the applicable mandatory occupational
  pensions are also deferred to the chosen start.
- The pension pays monthly through the month of death. The plugin converts
  native amounts using the plan's exchange rates and sends the gross payment
  to the selected tax provider under the `pension` basis. The existing
  Icelandic tax plugin accepts that basis.

## Planning scope

The projection holds the 2026 benefit and exemption amounts in 2026 purchasing
power and uses the plan's inflation assumption. Enter representative income
expected while claiming. Include mandatory occupational pensions and the
recipient's assessable share of capital income. TR can consider half the
couple's capital income, allow deductions and exclusions, and reconcile annual
income with actual figures. Apply those distinctions to your income estimates
before entering them.

Annex I supplies inception factors for the 1952–1962 deferral cohorts and
the 1958–1962 early cohorts. Later birth years use the 1962 table as a forecast
approximation. Pre-2025 claim decisions may use a different table. The model
assumes that the applicable pension funds are already paying or will pay by the
chosen start for a normal or deferred claim and represents deferral uplift as
all or none. A fund that starts partway through a deferral can stop the uplift
accrual at its first payment.

This version covers the ordinary domestic calculation at full draw. Special
half-pension arrangements, seafarers' early pensions, treaty coordination,
transferred spouse or disability-based rights, household and age supplements,
seasonal bonuses, supplemental social assistance, and retroactive claims
require separate treatment. Mandatory occupational funds and voluntary savings
are separate pensions. Cross-border withholding and pension tax treaties
require their own tax treatment.

## Build and run

Build the ZIP with `node plugins/icelandic-public-pension/build.mjs` and install
it through Cashle Lab's plugin settings. The provider is
`cashle.finance.pension.is`. The [direct model](doc/direct-model.cashle) runs the
same calculation with the existing Icelandic tax provider:

```sh
cashle plugins/icelandic-public-pension/doc/direct-model.cashle \
  --classpath plugins/icelandic-public-pension:plugins/icelandic-tax
```

## Sources

- Social Security Act 100/2007, especially articles 16 and 19–22 on eligibility and benefit, 32–33 on monthly payments and assessment, and transitional provision 4 on cohorts. [Alþingi](https://www.althingi.is/lagas/nuna/2007100.html)
- Annual 2026 benefit amount and exemptions. [Regulation 1491/2025](https://island.is/reglugerdir/nr/1491-2025) [Regulation 1490/2025](https://www.reglugerd.is/reglugerdir/allar/nr/1490-2025)
- Flexible commencement rules and the current actuarial annex, effective since 2025. [Regulation 1195/2017](https://www.reglugerd.is/reglugerdir/eftir-raduneytum/fvr/nr/20857) [Regulation 1485/2024 with Annex I](https://assets.ctfassets.net/8k0h54kbe6bj/6eJzde5QS5MSRH0TwMrmBT/e42835a79770853e8119fc2023d59e40/B_nr_1485_2024.pdf)
- TR claim guidance and how occupational pension dates affect deferral. [Old-age pension](https://island.is/en/apply-for-retirement-pension) [Deferring the old-age pension](https://island.is/en/o/social-insurance-administration/news/effects-of-postponing-old-age-pension-for-those-born-in-1958-or-later)
- Welfare appeals decisions illustrating the income, residence and timing adjustments. [Decision 488/2025](https://www.stjornarradid.is/gogn/urskurdir-og-alit-/stakur-urskurdur/2025-11-05-Mal-nr.-488-2025-Urskurdur) [Decision 141/2025](https://www.stjornarradid.is/gogn/urskurdir-og-alit-/stakur-urskurdur/2025-06-18-Mal-nr.-141-2025-Urskurdur)
