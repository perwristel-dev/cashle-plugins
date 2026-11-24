# CNLE reference budget excluding housing

Choose a household profile and a territory in Expenses. The module adds one
monthly household cost from the corresponding official CNLE benchmark
excluding housing. The CNLE figures describe the resources needed for social
participation under the study’s assumptions. Select the profile that most
closely matches the household, add actual housing costs separately, and use
the benchmark in place of other expense entries that cover the same costs.

The 2022 CNLE report gives these monthly amounts in 2018 euros:

| Household | Rural | Medium-sized town | Greater Paris |
|---|---:|---:|---:|
| Working adult living alone | €1,030 | €980 | €1,240 |
| Working couple without children | €1,788 | €1,545 | €2,080 |
| Working couple with two children | €2,925 | €2,675 | €2,685 |
| Retired adult living alone | €1,096 | €1,023 | €1,281 |
| Retired couple | €1,888 | €1,715 | €2,173 |

Use the two-child profile for the report’s example of children aged 11–14 and
15–17. The model converts the source totals to 2025 prices using the INSEE
national all-items annual CPI ratio of 120.95 to 103.09. This is a price
update to the 2018 basket. Plan inflation applies from mid-2025 onward.
The selected household and territory remain fixed unless changed in the plan.

Run the [direct model](doc/direct-model.cashle) with
`cashle plugins/french-reference-budget/doc/direct-model.cashle --classpath plugins/french-reference-budget`.

- [CNLE 2022 report, chapter 9, tables 1–3](https://solidarites.gouv.fr/sites/solidarite/files/2022-12/Les-budgets-de-reference-nouvelles-pistes-insclusion-sociale-rapport-2022-cnle.pdf)
- [INSEE 2018 annual consumer price index](https://www.insee.fr/fr/statistiques/3695758)
- [INSEE 2025 annual consumer price index](https://www.insee.fr/fr/statistiques/8726461)
