# Assurance-vie in unit-linked funds

Add each eligible assurance-vie or capitalization contract to Savings with its
first premium date, current surrender value and remaining premium basis. The
contract and all premiums must fall under the rules from 27 September 2017.
This forecast covers separately assessed single French residents who choose PFU
and hold unit-linked contracts. Euro-fund, grandfathered, joint-filing and
cross-border contracts need a separate assessment.

Enter each contract’s unreturned premiums at the previous 31 December. Include
any deposits, withdrawals and realized gains from the current year before the
forecast, including the portion of gains from surrenders before the eight-year
anniversary. Include all eligible contracts for the taxpayer, including those
with zero planned surrenders, in the year-end €150,000 test and a single €4,600
annual income-tax allowance.

Use a transfer to another account to model a partial surrender.
Partial surrenders allocate proceeds proportionately between premiums and
gains. When a unit-linked contract is in loss, returned premiums are capped at
the withdrawal. Gross surrender gains attract 17.2% social levies, including
gains within the income-tax allowance. Gains before eight years attract 12.8%
income tax. From eight years, the 7.5% share is determined by total unreturned
premiums at the previous year-end, with the balance assessed at 12.8%. The
allowance applies first against gains eligible for 7.5%, then at 12.8%. Cashle
books the resulting tax and levies at year-end. Actual insurer withholding can
occur at different times.

Run the [direct model](doc/direct-model.cashle) with
`cashle plugins/french-assurance-vie/doc/direct-model.cashle --classpath plugins/french-assurance-vie --classpath plugins/french-tax`.

- [French tax administration on assurance-vie and social levies](https://www.impots.gouv.fr/particulier/lassurance-vie-et-le-pea-0)
- [BOFiP on surrender gains and allowance](https://bofip.impots.gouv.fr/bofip/3951-PGP.html/identifiant%3DBOI-RPPM-RCM-20-10-20-50-20220630)
- [BOFiP on allocating across the 7.5% and 12.8% rates](https://bofip.impots.gouv.fr/bofip/11224-PGP.html/identifiant%3DBOI-RPPM-RCM-20-15-20210621)
