# German statutory living-cost minimum (Regelbedarf)

Add **German statutory living-cost minimum (Regelbedarf)** in Expenses to
use the 2026 national rates as a monthly budget benchmark. Cashle reads the
people and children in the household profile. The benchmark represents the
official minimum for ordinary living expenses. Eligibility for benefits,
income and asset tests and actual household average spending are outside the
calculation.
[BMAS 2026 rates](https://www.bmas.de/DE/Service/Presse/Pressemitteilungen/2025/fortschreibung-regelbedarfe-sozialhilfe-und-buergergeld.html)

| Household member | 2026 EUR/month |
| --- | ---: |
| Single or single parent | 563 |
| Each adult in a couple | 506 |
| Child aged 0–5 | 357 |
| Child aged 6–13 | 390 |
| Child aged 14–17 | 471 |

The statutory total covers food, clothing, personal care, household goods,
ordinary household electricity, and social and cultural participation. Housing
costs, space heating, water heating, separate education and participation
benefits and individual additional needs are outside this line. The benchmark
uses the published total for each person because BMAS does not publish a
current breakdown of the updated amount by category.
[BMAS scope](https://www.bmas.de/DE/Arbeit/Grundsicherung-fuer-Arbeitsuchende/Leistungen-und-Bedarfe-in-der-Grundsicherung-fuer-Arbeitsuchende/leistungen-und-bedarfe-in-der-grundsicherung-fuer-arbeitsuchende.html),
[SGB XII statutory table](https://www.gesetze-im-internet.de/sgb_12/anlage.html),
[BMAS methodology and category detail](https://www.bmas.de/DE/Soziales/Sozialhilfe/Methodik-der-Regelbedarfsermittlung-FAQ/faq-sozialhilfe-regelbedarfsermittlung.html)

This forecast uses the child's birth month for age-band changes. A child with
half residence counts for half the benchmark. Cashle applies each rate until
the next age band and stops the child component at age 18. The benchmark
covers adults living at home and children under 18. Adult dependent and
institutional rates, separation or moves, and the exact statutory proration
of a partial month are outside the calculation. The case exchange rate is
applied and forecasts after 2026 grow with case inflation. The same nominal
rates were published for 2024 and 2025.

## Direct model

```sh
cashle doc/direct-model.cashle --classpath .
```

A single adult budgets EUR 563 per month, for a total of EUR 1,126 over
January and February 2026.
