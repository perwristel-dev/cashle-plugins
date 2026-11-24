# Canadian First Home Savings Account

Model the holder's eligible Canadian FHSAs as one combined personal account.
Use the CRA-confirmed room and gross lifetime cash contributions immediately
before the start of the projection. Leave the modeled opening deposit out
of both entered historical counters. For an existing account, enter eligible
contributions already made in the opening year in the year-to-date history.

The first account year gives up to CAD 8,000 of participation room. The
ordinary limit in following years is CAD 8,000 plus up to CAD 8,000 of
unused prior-year room, subject to a total CAD 40,000 lifetime limit. These
are nominal CAD amounts. Cashle limits deposits to remaining room and does
not use withdrawals to add it back. Provide the first account opening date
and the year the holder reaches age 71. The account must close by the end
of the earliest applicable calendar year. Standard age and anniversary
cutoffs are the year the holder turns 71 and the year of the 15th
anniversary of the first FHSA.

For a qualifying first-home withdrawal, confirm all CRA requirements,
including the purchase or construction agreement, eligible time window,
Canadian residence, occupancy and Form RC725. Set the exact confirmed
withdrawal date and use the same date for full account closure. That
transaction is exempt. Other withdrawals, including unconfirmed closure
and transfers paid out of the account, are ordinary taxable FHSA income.

The Canadian tax plugin applies taxable withdrawals and the chosen
same-year deduction for eligible cash contributions, with annual
assessments for Ontario and Alberta. Check the deduction election to
claim contributions for the contribution year. The model applies the
plan's preliminary payment setting for taxable withdrawals when relevant.
It does not represent CRA issuer-specific withholding schedules or
actual tax filing.

Ordinary Canadian full-year residence, cash contributions, eligible
holdings, reinvested distributions, and no prior special adjustments are
the supported profile. Further deposits after a taxable withdrawal are
outside this model because special re-participation room can apply.
Excess contributions, RRSP/RRIF direct rollovers, deductible carryovers,
designated corrections, departure and foreign tax, partial qualifying
withdrawals, and post-deadline deemed receipts require separate facts.

- [CRA participation room](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account/contributing-your-fhsa.html)
- [CRA withdrawals and qualifying conditions](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account/withdrawals-transfers-out-your-fhsas.html)
- [CRA deduction and filing](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account/tax-deductions-fhsa-contributions.html)
- [Income Tax Act section 146.6](https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-146.6.html)

The [direct model](doc/direct-model.cashle) projects a confirmed first-home withdrawal.
