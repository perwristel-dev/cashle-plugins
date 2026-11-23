# French PEA source plugin

The plugin defines `frPea` for an ordinary plan with verified eligible listed
assets and a first payment from 2018 onward. It tracks lifetime contributions
against the €150,000 PEA ceiling and the €225,000 combined PEA and PEA-PME
ceiling. Withdrawals before five years require full closure and incur 12.8%
income tax plus 17.2% social levies. The proportional gain in a withdrawal
after five years incurs 17.2% social levies. The plugin accounts for those gains
in the reference income supplied to the French annual tax policy.

Build the installation ZIP with `node plugins/french-pea/build.mjs`. The ZIP
includes the account DSL, tax-policy DSL and the account form in English and
Swedish. Select French tax for the plan to apply the country assessment.

[The direct model](doc/direct-model.cashle) closes a five-year-old account with
a €5,000 gain. It produces €860 in social levies and a closing net worth
of €14,140. Run it with `cashle plugins/french-pea/doc/direct-model.cashle --classpath plugins/french-pea --classpath plugins/french-tax`.

See the published contribution limits and withdrawal rules. [Service Public F2385](https://www.service-public.gouv.fr/particuliers/vosdroits/F2385) · [Service Public F22449](https://www.service-public.gouv.fr/particuliers/vosdroits/F22449)
