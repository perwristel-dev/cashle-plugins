# Swedish source taxation after emigration

Verified against Skatteverket on 2026-10-31. `SwedishEmigrationPolicy` is a
pure domestic-law planning policy; `SwedishTaxPlugin.classifySource` adapts
native nominal SEK payments to it. FX conversion belongs to `TaxMoneyBasis`.

## Rules verified

- [SINK](https://www.skatteverket.se/sink): 25% for income received in 2025,
  22.5% for income received in 2026, and 20% from 2027. The payment date,
  rather than the ordinary Swedish plugin's 2025 rule year, chooses the rate.
  SINK is definitive: its income never enters ordinary earned income, general
  pension charges, basic allowance, or job credits.
- The same SINK page states a monthly tax-free amount for eligible social
  insurance pensions of SEK 3,773 for 2025 and SEK 3,799 for 2026. This is
  explicitly selected as `pensionKind=public`; private/occupational pensions
  receive no such allowance. The runtime shares one allowance across every
  eligible pension paid to the same person in the same calendar month.
  The returned allowance use is an increment, which the runtime must retain
  in reset/checkpoint state. Unused allowance is not transferred to another
  month or person. The policy itself stores no state.
- [Nonresident property and capital income](https://www.skatteverket.se/privat/internationellt/bosattutomlands/bosattutomlandsmedfastighetochkapitalinkomsterisverige.4.48cfd212185efbb440b8edc.html):
  ordinary interest, ISK imputed income, and gains on fund units are excluded
  from the limited-liability Swedish assessment. Swedish property fees,
  property taxation, taxable home gains, and Swedish rental income remain.
- The same page describes qualifying share disposals during a calendar year
  when the person lived in Sweden or in one of the preceding ten years.
  Consequently a 2025 departure is inside the window through 2035-12-31,
  and outside it on 2036-01-01. No disposal occurs just because the owner
  emigrates. Classification must be explicit; ordinary shares may qualify,
  while fund units and ISK do not automatically qualify. In particular,
  foreign shares require acquisition while Swedish resident. The caller
  resolves this factual eligibility before selecting `qualifying-shares`.
- The same capital-income page confirms Swedish coupon withholding on
  relevant dividends and treaty reductions. The implementation's domestic
  planning default is 30%; an explicitly entered treaty rate may be 0–30%.
  The fraction is stored as `treatyCouponRate` (for example `0.15`). ISK
  exclusion from imputed-income taxation does not itself exempt relevant
  Swedish dividends from coupon withholding.
- [Six-month and one-year rules](https://www.skatteverket.se/privat/internationellt/arbetautomlands/sexmanadersregelnochettarsregeln.4.1c68351d170ce5545275329.html):
  unlimited-liability foreign employment may be exempt only when all legal
  conditions are confirmed. Six months normally requires foreign taxation;
  the one-year rule has same-country, reason-for-exemption, and other
  conditions. Merely spending six months/one year abroad does not activate
  the policy. Work in Sweden cannot use either foreign-work exemption.
- [Foreign tax credit](https://www.skatteverket.se/avrakning): the helper
  requires entered foreign tax, confirmed entitlement, and the attributable
  ordinary Swedish tax ceiling. It returns the smaller amount. SINK,
  coupon withholding, and property fees must never enter that ceiling.

The legal-guidance ISK link in the design returned no substantive page in
this environment; the directly accessible Skatteverket nonresident capital
page independently confirms the ISK exclusion.

## Planning assumptions and boundaries

Residence and source origin are independent. Limited liability is the
post-emigration default. Unlimited liability is a user assumption, not a
legal test of substantial connection. Actual work country controls ordinary
private salary; employer/source origin does not establish Swedish work.
Public employment, seafarers, and other special employment are rejected
rather than inferred from the employer name.

Continued unlimited liability also preserves the ordinary Swedish ISK regime
after physical departure. Its capital base still includes applicable opening
values and deposits, and its imputed income remains ordinary Swedish income.
Actual gains, losses and dividends inside that ISK do not separately enter
Swedish ordinary income or coupon withholding. With limited liability,
imputed income and ISK gains remain excluded, while relevant Swedish
dividends can still incur definitive coupon withholding. Physical residence
remains a separate fact for destination-country investment taxation.

The latest verified pension allowance after 2026 is the 2026 amount. The
policy exposes its money year and projection flag. The source adapter uses
`SourceContext.allowanceInflationFactor` to project that amount after 2026;
`sourceMoneyReferenceYear()` returns 2026. This is a planning projection,
not a claim that future statutory amounts have been enacted.

Swedish ordinary tax remains the existing 2025 engine. During departure
year it assesses actual ordinary income with annual progression thresholds;
`residenceYearOptions` supplies the count of calendar months with at least
one day of Swedish residence. Continued unlimited liability uses twelve
months. No annualization of part-year salary is performed. These ordinary
allowance/credit prorations are Cashle approximations, not a complete legal
part-year return. For an entirely nonresident year, the ordinary engine's
minimum valid month count is one; since all salary/pension is excluded from
ordinary income, it grants no earned-income allowance or job credit. Entered
optional personal-credit fields are removed for this profile. Capital/home
bases and property fees can still be assessed.

There is no treaty database. `securitiesTreatyExemptionConfirmed` is an
explicit confirmation that a treaty removes the modeled security-gain taxing
right. Source `securitiesClassification=unknown` produces an error for limited
liability. Deferrals from share exchanges, special instruments, public
employment, and treaty-specific pension exemptions require additional rules.

The source adapter preserves private-home gain/loss categories for the
existing Swedish home rules. Security gains must come from the investment
account's annual gain/loss calculation. A negative listed-share net amount
enters ordinary capital income at 70%, matching the existing Swedish VP
planning rule. The policy does not independently net each trade or create
new loss carry state. The account provider defaults a VP account to qualifying
shares and ISK to excluded ISK; an explicit fund/other classification overrides
that assumption. Its source-options adapter removes destination-only
`foreign*` investment fields and known destination loss-confirmation aliases
before validating Swedish source options; unknown unrelated fields still
produce an error. Account aggregation must keep
interest, dividends, gains, and ISK imputed income distinct until classified.
The legacy `capitalIncome` movement requires an explicit `sourceKind` in the
limited-liability source path. Supported kinds are `bankInterest`,
`dividendIncome`, `securitiesGains`, `iskImputedIncome`, and
`propertyRentalIncome`. Unknown assets and unclassified gains produce an
error rather than silently receiving the bank-interest exclusion.

The app defaults foreign-tax credit to zero: the Swedish assessment receives
no separately assessed foreign tax payments or attribution data from which to
estimate a credit. It never invents a foreign payment from a gross income.
Optional advanced fields accept a paid foreign amount and the Swedish ordinary
income tax attributable to that income. There are no enable or entitlement
confirmation checkboxes. Saved checkbox values are ignored; positive entered
payment and attribution amounts activate the credit for the entered year.

The `foreignTaxCredit` annual option contains these entered `paidAmount`
and `attributableOrdinaryTax` in nominal SEK plus the required integer `taxYear`.
The app supplies the legacy API's `entitlementConfirmed: true` as its planning
assumption, without requiring an extra manual gate. The credit applies only to
that income year,
never repeatedly to later years using the same residence profile.
These amounts receive inflation adjustment but bypass FX even in a non-SEK
plan. The adapter rejects a simultaneous legacy foreign-tax credit basis.
It caps the requested credit by the remaining ordinary municipal/state/capital
tax after existing credits; property fees, property taxes and definitive
withholding never enlarge this cap. Subtracting all existing credits from
this ceiling is a conservative planning simplification of credit ordering.

The credit helper calculates no attribution, foreign payment, treaty
entitlement, or carry-forward. Its caller supplies an ordinary Swedish
attribution ceiling and books the entered foreign payment only once. Unused
credit is not carried into later years.
This policy calculates Swedish tax only; it does not establish total tax or
net disposable income in the destination country.
