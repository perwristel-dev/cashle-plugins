# INPS ordinary old-age pension

In Income, enter the ordinary gross monthly amount from the INPS estimate for
the selected claim date. Under Income, set the claim by age, date, retirement
or another milestone. The forecast rounds the requested date up to the first
of a month, applies the applicable eligibility floor, and assumes timely
filing and that any required employment cessation takes place.

For ordinary eligibility, use the 20-year route with confirmed qualifying
contributions. In 2026 the age is 67. In 2027 it is 67 years and one month,
and in 2028 it is 67 years and three months. Later projections hold the 2028
rule until updated. The first payment month follows the month the required
age is reached. If the first contribution was in 1996 or later, the 20-year
route also requires the pension to meet the INPS statutory amount threshold
(€546.24 a month in 2026). Select this route only when INPS confirms the
threshold is met. Alternatively, the fully contributory route uses age 71
with five years of effective contributions, excluding figurative credits,
and applies the same 2027 and 2028 age increments without an amount threshold.

Use an INPS-confirmed effective date when contributions qualify later than
the modeled age, when the claim predates 2019, or when INPS has confirmed
another entitlement date. Enter the monthly amount for the resulting start.
Special eligibility exceptions, survivor pensions and supplemental
allowances use separate assessments.

The forecast pays the gross pension monthly for life. December includes the
13th instalment, prorated by months of entitlement in the first calendar year.
The forecast uses the first day of each payment month and indexes the amount
by plan inflation. Italian tax v3 assesses this income using the separate
ordinary pension credit. Payroll charges apply to wages.

Run the [direct model](doc/direct-model.cashle) with
`cashle plugins/italian-public-pension/doc/direct-model.cashle --classpath plugins/italian-public-pension`.

- [INPS old-age eligibility and first payment dates](https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.pensione-di-vecchiaia.html)
- [INPS circular 28 on the 2027 and 2028 retirement requirements](https://www.inps.it/it/it/inps-comunica/atti/circolari-messaggi-e-normativa/dettaglio.circolari-e-messaggi.2026.03.circolare-numero-28-del-16-03-2026_15199.html)
- [INPS social allowance thresholds](https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.assegno-sociale-50184.assegno-sociale.html)
- [INPS pension certificate and 13th instalment](https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.il-certificato-di-pensione-modello-obism.html)
- [INPS pension instalments accrued during the year](https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.liquidazione-di-quote-di-pensione-agli-eredi-50311.liquidazione-di-quote-di-pensione-agli-eredi.html)
