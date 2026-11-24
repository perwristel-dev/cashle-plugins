# Danish owner-occupied housing tax

Add **Danish owner-occupied housing tax** in Expenses for a property owner's
share of *ejendomsværdiskat* and *grundskyld*. Copy the annualized cash charges
in DKK from the property section of the preliminary income assessment
(*forskudsopgørelse*). Use the amounts after any tax rebate. The monthly model
covers notices from 2024 onward, when both charges moved into the preliminary
income assessment for private owners.
[Danish Tax Agency guidance](https://skat.dk/en-us/individuals/property/charging-property-tax/housing-tax-in-the-preliminary-income-assessment),
[Property tax from 2024](https://skat.dk/en-us/individuals/property/introduction-to-property-in-denmark)

The two components are separate property-tax postings, each at one twelfth
of the entered annualized cash charge. Cashle uses calendar month end to
represent the monthly cash cost. The optional first and last payment months
are inclusive. Leave the first month blank to start with the plan and
the last month blank for a continuing payment. The forecast holds charges
fixed in nominal DKK and converts them at the case exchange rate.

For a new assessment or different effective dates, use consecutive date
ranges or separate entries. For example, a notice that charges DKK 1,500 over
three months has an annualized rate of DKK 6,000. Use only the cash amounts
due for the modeled ownership share and period. Enter payroll withholding
excluding these housing charges when they are recorded here. Valuation,
municipal rates, property-tax deferral loans, partial-month calculations and
final-assessment adjustments are outside this cash-flow forecast.
[Danish Tax Agency buying guide](https://skat.dk/en-us/individuals/property/buying-a-home-or-a-holiday-home/buying-a-home)

## Direct model

```sh
cashle doc/direct-model.cashle --classpath .
```

DKK 10,800 of annual property value tax and DKK 3,600 of annual land tax
produce DKK 1,200 in each of February, March and April 2026.
