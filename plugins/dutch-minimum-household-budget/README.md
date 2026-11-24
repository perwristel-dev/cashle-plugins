# Dutch minimum household budget

Add **Dutch minimum household budget** under Expenses and choose a reference household. The plugin uses ten Nibud minimum example budgets published in Table 3.1 of the Social Minimum Commission’s 2023 report. The profiles cover single adults, couples, one- and two-parent families with up to three children, and single adults and couples past AOW age. One-child households use age 8, two-child households use ages 8 and 13, and three-child households use ages 11, 13 and 15. [Table 3.1, Een zeker bestaan](https://open.overheid.nl/documenten/d0ab26e9-096b-41fd-ada9-ede686c99169/file)

These budgets estimate a minimum standard for households at the social minimum in social housing without cars or debt. They cover fixed bills, replacement and health costs, daily household expenses, and social participation. A toggle includes the reference rent from the same table. Leave it off to enter the household’s own rent or mortgage costs. Utilities and local charges remain in the reference amount. [Government publication and methodology](https://www.rijksoverheid.nl/documenten/2023/06/30/een-zeker-bestaan-rapport-i-commissie-sociaal-minimum)

The plugin uses nominal EUR per month at January 2023 prices and projects those amounts using the plan’s inflation and exchange rate. The selected household profile remains fixed for the forecast. The baseline represents the published necessary costs, without the report’s later rent and contingency policy scenarios.

## Direct model

```sh
cashle doc/direct-model.cashle --classpath .
```

For a couple with two children, the published reference is EUR 3,100 monthly, including EUR 679 of modeled rent. With reference rent excluded and no inflation, Cashle records EUR 2,421 per month and EUR 7,263 over three months.
