# French basic old-age pension (Assurance retraite)

In Savings, enter the gross monthly amount from Assurance retraite for the
general scheme (régime général) at the projected start. Use the basic pension
line of the estimate. In Income, set the start for that same record by minimum
age, age, date, retirement or another milestone. Cashle rounds the request up to
the first of a month and applies the legal minimum. If you were born on the
first of the month, select that option to allow the birthday month when the
minimum age is reached. The projection assumes the claim was filed in time and
the conditions for stopping work are met.

The ordinary route uses the cohort schedule for people born in 1955 or later,
including the changes for pensions effective from 1 September 2026. For a
confirmed inaptitude au travail pension, the minimum age is 62. Enter the pension
fund's amount as quoted for the resulting start. It already accounts for any
quarters, reduction, proration or increases applicable to that claim. Update the
quote if a new start changes the amount. Long-career and other early-retirement
routes, survivor pensions and means-tested supplements are outside this scope.

The projection books one gross taxable pension receipt in each entitlement
month for life, indexed by plan inflation. Bank-payment timing may differ.
Assurance retraite ordinarily pays the following month, with advance payment in
Alsace-Moselle. The French tax plugin assesses the pension under its pension
income basis. Pension-specific social charges are outside the tax forecast.

Run the [direct model](doc/direct-model.cashle) from the repository root with
`cashle plugins/french-public-pension/doc/direct-model.cashle --classpath plugins/french-public-pension`.

- [Assurance retraite cohort ages and qualifying quarters](https://www.lassuranceretraite.fr/portail-info/home/actif/age-depart/age-depart-retraite.html)
- [Social-security financing law, article 105](https://www.legifrance.gouv.fr/jorf/id/JORFARTI000053226653)
- [Service Public on choosing the effective claim date](https://www.service-public.gouv.fr/particuliers/vosdroits/F13941)
- [Assurance retraite on inaptitude au travail](https://www.lassuranceretraite.fr/portail-info/home/actif/je-souhaite-partir-plus-tot/travailleur-handicape-retraite.html)
- [Assurance retraite payment calendar](https://www.lassuranceretraite.fr/portail-info/home/retraite/paiements-retraite/calendrier-paiement-retraite.html)
