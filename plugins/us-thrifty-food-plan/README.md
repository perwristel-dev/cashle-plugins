# USDA Thrifty Food Plan

Add the USDA Thrifty Food Plan in Expenses for a U.S. household. The expense
uses the October 2026 U.S. average published in November. It covers groceries
for meals and snacks prepared at home. Restaurants, delivery, infant formula,
housing, transport, and all other living costs belong in separate expenses.

Select each household member's USDA food-cost category. Cashle uses the age
in each payment month and applies the USDA household-size adjustment to the
sum of individual amounts. The adjustments are +20% for one person, +10% for
two, +5% for three, zero for four, −5% for five or six, and −10% for seven or
more. The USDA report has no individual amount for infants under one. Their
household size still counts. When a child lives with the household half time,
Cashle halves their food amount and interpolates the household-size factor.
If only the child's birth year is known, Cashle uses January for age bands.
Adult life milestones stop their share of costs. The household profile
determines which children stay in the projection.

The model applies the case's inflation assumption from October 2026 and
converts USD to the case currency. The USDA report is a reference food basket,
so Cashle treats it as an expense and does not calculate SNAP benefits.
The BLS Consumer Expenditure Surveys report observed spending averages that
include housing and other categories. They serve a different purpose and can
inform separately entered local spending estimates.
[USDA October 2026 tables](https://fns-prod.azureedge.us/sites/default/files/resource-files/CostofFoodOct2026Thrifty.pdf) ·
[USDA monthly report archive](https://www.fns.usda.gov/research/cnpp/usda-food-plans/cost-food-monthly-reports) ·
[BLS Consumer Expenditure Surveys](https://www.bls.gov/cex/)

The [direct example](doc/direct-model.cashle) assesses $1,024.60 for the USDA
reference family of four with inflation disabled.

```sh
cashle plugins/us-thrifty-food-plan/doc/direct-model.cashle --classpath plugins/us-thrifty-food-plan
```
