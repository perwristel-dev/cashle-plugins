# Australian core household budget

Add **Australian core household budget** under Expenses and choose a comparable household and employment profile. Cashle schedules its core living expenses monthly. The benchmark covers low-paid and unemployed working-age households in metropolitan Australia. [UNSW research summary](https://www.unsw.edu.au/research/sprc/our-projects/updated-budget-standards-for-2024)

The Department of Social Services commissioned the **Updated Budget Standard Estimates for 2024** on behalf of the Economic Inclusion Advisory Committee. The plugin uses the published **Core** totals in tables 16, 17 and 19 of the study, reproduced in Appendix 5 of the 2025 report. They cover food, personal care, clothing and footwear, recreation, household goods and services, health, transport, and education. The single-adult options use the published averages of the female and male cases. Single-parent and couple options use the study’s family and employment combinations. Where children are present, the one-child comparison is age 8 and the two-child comparison uses ages 8 and 11. [DSS report and tables](https://www.dss.gov.au/system/files/documents/2025-03/eiac-2025-report-appendices.pdf)

Core costs exclude rent, mortgage payments and the study’s supplementary discretionary basket. Enter comparable housing or discretionary expenses separately. The study models transport and childcare costs according to household circumstances. Use the selected profile as a fixed comparison across the forecast. Regional, remote, retired and other unlisted households need their own spending assumptions. [Economic Inclusion Advisory Committee 2026 analysis](https://www.dss.gov.au/system/files/documents/2026-04/economic-inclusion-advisory-committee-2026-report-government.pdf)

Cashle converts the published weekly AUD figures to monthly amounts using 52 weeks divided by 12 and applies plan inflation from December 2024 and the plan exchange rate when used in a different currency.

## Direct model

```sh
cashle doc/direct-model.cashle --classpath .
```

For a couple with two children and one full-time and one part-time minimum wage earner, the source reports AUD 1,032 per week. The model with no inflation books AUD 4,472 per month and AUD 13,416 in three months.
