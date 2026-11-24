# Agirc-Arrco supplementary pension

In Savings, enter the Agirc-Arrco points from your career statement. Add
pensionable annual gross pay to project new points from the first whole month
until claim. The projection uses the 2026 purchase price of €20.1877 and
standard point rates of 6.2% up to one annual social-security ceiling and 17%
on pay above that limit up to eight ceilings. The 2026 ceiling is €48,060.
Projected pay and the acquisition parameters stay fixed in real terms.

In Income, choose automatic full rate from 67, or claim Agirc-Arrco independently
of the basic pension from 57 with a permanent age reduction. Request a start by
minimum age, age, date, retirement or another milestone. Cashle rounds the start
up to the first day of a month and uses the earliest date allowed by the
chosen route. Select the first-of-month birth option if applicable. The age
coefficient is fixed at claim. In points mode, amounts use the published service
values from 2019, including €1.4587 from 1 November 2026. Future increases
follow plan inflation.

Alternatively, enter the official gross monthly Agirc-Arrco estimate and its
effective date for a confirmed claim. Use this option for claims based on the
basic scheme's full rate or quarter-based reduction, special early retirement,
or any estimate with other scheme adjustments. The effective date is the floor.
Update the quote if you change the start and the amount changes. The plan assumes
filing and work-cessation conditions are met. It supports birth years from 1955.

This module projects monthly direct pensions for life and posts receipts on
the first of the month. The scheme uses the first business day. Positive awards
below 200 points after any age reduction are paid annually or in one payment and
need a separate cash flow. Use the quote option only for a confirmed monthly
pension. Survivor benefits, historical tranche C rights and special accrual
rates require their own scheme estimates. French income tax uses its pension
basis. Pension-specific social charges are outside that tax forecast.

Run the [direct model](doc/direct-model.cashle) from the repository root with
`cashle plugins/french-agirc-arrco-pension/doc/direct-model.cashle --classpath plugins/french-agirc-arrco-pension`.

- [Agirc-Arrco conditions for opening pension rights](https://www.agirc-arrco.fr/particuliers/ma-retraite/demander-ma-retraite/conditions-douverture-de-mes-droits/)
- [Agirc-Arrco coefficients for early claiming](https://www.agirc-arrco.fr/wp-content/uploads/2024/10/Coefficients-de-minorations-AA.pdf)
- [Agirc-Arrco calculation of accrued points](https://www.agirc-arrco.fr/particuliers/ma-retraite/comprendre-ma-retraite/points-de-retraite-comment-sont-ils-obtenus/)
- [Agirc-Arrco ceiling, purchase price and point service values](https://www.agirc-arrco.fr/nous-connaitre/nos-etudes-et-publications/documentation-institutionnelle/parametres-et-donnees-statistiques/)
- [National agreement, article 107 on payment frequency](https://www.legifrance.gouv.fr/conv_coll/article/KALIARTI000036731861)
- [Agirc-Arrco application and effective dates](https://www.agirc-arrco.fr/particuliers/ma-retraite/demander-ma-retraite/faire-ma-demande-de-retraite/)
