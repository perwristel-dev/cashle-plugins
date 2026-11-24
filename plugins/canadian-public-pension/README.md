# Canadian public pension

Enter pension rights and payment dates in one Income record per person. Enter either CPP or QPP according to the administering plan.
A person with contributions under both plans should use the combined estimate
from the plan that will pay the pension.

- CPP and QPP start no earlier than the month after age 60. Enter the gross
  monthly estimate at age 65 in plan-start Canadian dollars. CPP is reduced
  by 0.6% per month before 65. For QPP, use the applicable 0.5%–0.6%
  monthly rate based on the ratio of the member's base pension to the maximum
  base pension under section 120.1. The default 0.6% gives the maximum
  reduction. Both increase by 0.7% per month after 65, capped at age 70 for CPP
  and age 72 for QPP. An explicit claim after the cap starts later at the
  capped amount. If already collecting, enter the current gross payment.
  [CPP start and adjustments](https://www.canada.ca/en/services/benefits/publicpensions/cpp/when-start.html)
  [Retraite Québec calculation](https://www.retraitequebec.gouv.qc.ca/en/citizens/retirement-planning/applying-your-retirement-pension/retirement-pension-quebec-pension-plan/calculation-your-retirement-pension)
  [Québec Pension Plan Act](https://www.legisquebec.gouv.qc.ca/en/pdf/cs/R-9.pdf)
- OAS starts no earlier than the month after age 65. Enter complete Canadian
  residence years after age 18 at approval, capped at 40. Standard eligibility
  requires at least 10 years when resident in Canada or at least 20 when abroad.
  The partial base rate is the full rate multiplied by residence years divided
  by 40. Enter the first eligible month if it falls after age 65 and the initial
  complete years of residence if they differ from the years at approval. OAS
  adds 0.6% per deferred month through age 70 and compares the deferred amount
  with the value of additional residence years by approval. If the rate became
  full while deferring, enter the first full-rate month. Update residence years
  at approval when comparing a different claim date. An additional 10% applies from the month
  after age 75. The editable default of CAD 762.50 is the October–December
  2026 full monthly rate at ages 65–74. For existing pensioners, enter the
  gross current amount before any recovery withholding, including any uplift
  already received. Use 0 residence years to omit OAS.
  [OAS eligibility](https://www.canada.ca/en/services/benefits/publicpensions/old-age-security/eligibility.html)
  [OAS amount and age 75 increase](https://www.canada.ca/en/services/benefits/publicpensions/old-age-security/benefit-amount.html)
  [OAS deferral and partial pension](https://www.canada.ca/en/services/benefits/publicpensions/old-age-security/when-start.html)
  [Old Age Security Act section 7.1](https://laws-lois.justice.gc.ca/eng/acts/O-9/section-7.1.html)
  [Current OAS rates](https://www.canada.ca/en/services/benefits/publicpensions/old-age-security/payments.html)
- Optional GIS uses a confirmed monthly quote for the period from OAS start
  or plan start through the entered last month. The model pays it only with
  OAS and during Canadian residence. Payments end with the quote.
  [GIS benefit and income test](https://www.canada.ca/en/services/benefits/publicpensions/old-age-security/guaranteed-income-supplement/benefit-amount.html)

The projection uses monthly periods, model inflation and plan FX. Supply an
estimate for the selected claim and contribution assumptions. Special residence
arrangements, sponsorship and eligibility exceptions, retroactive lump sums,
disability, survivor and post-retirement benefits, and payment-day and
indexation calendars are outside the standard scenario. The projection
assumes the recipient lives in Canada when no residence timeline is entered.
It stops GIS and OAS with fewer than 20 residence years immediately on a
modeled move abroad. Temporary absence rules may continue actual payments.
[Service Canada rules while receiving](https://www.canada.ca/en/services/benefits/publicpensions/old-age-security/while-receiving.html)

The Canadian tax plugin applies the 2026 Ontario or Alberta ordinary income
rules, including OAS recovery in annual settlement and the federal supplement
deduction without preliminary withholding on GIS. Cashle supports gross QPP
projections and net projections with Ontario or Alberta tax residence.
[OAS recovery](https://www.canada.ca/en/services/benefits/publicpensions/old-age-security/recovery-tax.html)

The [direct model](doc/direct-model.cashle) projects a CPP and OAS claim.
