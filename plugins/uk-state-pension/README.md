# UK New State Pension

Add the individual entitlement in Savings and choose the claim start in Income.
Enter the gross weekly amount from a GOV.UK forecast or award in 2026/27 pounds.
The 2026/27 full-rate illustration is £241.30/week. A forecast or award reflects
qualifying years, transitional starting amounts, contracting out and protected
payments. An eligible claimant usually needs 10 qualifying years. The 35-year
full-rate rule applies to a record that began after the 2016 reform.
[GOV.UK eligibility](https://www.gov.uk/new-state-pension/eligibility)
[GOV.UK amounts and uprating](https://www.gov.uk/new-state-pension/what-youll-get)
[2026 rate order](https://www.legislation.gov.uk/uksi/2026/148/article/6/made?view=plain)

The claim can begin at statutory State Pension age, a selected age, a date or a
milestone. Earlier selections move to State Pension age. The source implements
the legislated changes from 66 to 67 and 67 to 68. Add the exact birth day for
an exact age calculation. Blank uses the last day of the birth month. A person
born before 6 October 1954 enters their confirmed State Pension date from the
GOV.UK calculator. For these historical cohorts the plugin supports the new
scheme when the confirmed date is on or after 6 April 2016.
[State Pension age timetable](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable)
[State Pension age calculator](https://www.gov.uk/state-pension-age)

For a qualifying continuous deferral, select the lifetime increase. The weekly
amount increases by 1/9% for each whole eligible week once the delay reaches
nine weeks. The calculation covers the increased regular-payment choice. Enter
an award that already includes a deferral increase with this option off. The
projection uses a monthly equivalent of 52 weeks per year, prorates the first
month and stops at the owner’s life milestone. The entered weekly amount follows
plan inflation after April 2026. Future triple-lock decisions, arrears lump
sums and separate uprating of the protected portion are outside this forecast.
[Deferral guidance](https://www.gov.uk/deferring-state-pension/if-you-reach-state-pension-age-on-or-after-6-april-2016)
[Pensions Act 2014, section 17](https://www.legislation.gov.uk/ukpga/2014/19/section/17)
[State Pension Regulations 2015](https://www.legislation.gov.uk/uksi/2015/173/body/2026-04-06?view=extent)

The payments use the UK tax plugin’s `pension` basis when UK tax is enabled in
the plan. The current income-tax bands apply and the pension carries no employee
National Insurance. [HMRC pension income guidance](https://www.gov.uk/tax-on-pension/taxed)

Build the archive with `node plugins/uk-state-pension/build.mjs`. Run the
[direct model](doc/direct-model.cashle) with the Cashle CLI and
`--classpath plugins/uk-state-pension`. In that model the 6 April 1960 cohort
reaches pension age on 6 May 2026.
