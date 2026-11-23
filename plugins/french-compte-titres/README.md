# French compte-titres source plugin

The plugin defines `frCompteTitres` for one homogeneous lot of listed shares.
It sends realized gains, realized losses and dividends to the French country
tax policy. The country tax policy applies the 2025 PFU and carries unused
securities losses forward for up to ten subsequent years.

Build the installation ZIP with `node plugins/french-compte-titres/build.mjs`.
The ZIP includes the account DSL, tax-policy DSL and the account form in
English and Swedish. Select French tax for the plan to apply the country
assessment.

[The direct model](doc/direct-model.cashle) closes a €15,000 account with
€10,000 in cost basis and combines the gain with €60,000 in salary. It
produces €10,874 in total tax and a closing net worth of €64,126.
Run it with `cashle plugins/french-compte-titres/doc/direct-model.cashle --classpath plugins/french-compte-titres --classpath plugins/french-tax`.

See the published treatment of securities gains and losses and the verified
2025 social levies. [Service Public F21618](https://www.service-public.gouv.fr/particuliers/vosdroits/F21618) · [Service Public F2329](https://www.service-public.gouv.fr/particuliers/vosdroits/F2329)
