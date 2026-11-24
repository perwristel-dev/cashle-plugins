# Canadian Market Basket budget

Use this monthly household expense for a modest basic-cost benchmark. Select
one of the 65 published Statistics Canada Market Basket Measure (MBM) regions
and enter the number of people in the economic family. Select the local
population group where Statistics Canada groups municipalities by size.

The model adds the chosen non-shelter components from the 2025 observations
in current CAD, using the 2023-base basket. It includes food, clothing and
footwear, transportation, communication services, other expenses, and
Inuusiqattiarniq in Nunavut. Add shelter as a separate expense. Turn off any
basket component already covered elsewhere.

Statistics Canada prices a reference family of four, or five in Nunavut.
Cashle applies the MBM square-root family-size adjustment to the selected
component subtotal and divides by 12. The derived amount is a planning
benchmark for the entered family size. The projected region and size stay
at their entered values, and the expense stops during a modeled period
outside Canada. The plan supplies inflation and exchange rates.

Data reproduced from Statistics Canada, table 11-10-0066-01, release of
April 29, 2026, under the Statistics Canada Open Licence. The packaged
resource selects 2025, 2023 base, Current dollars, and the listed components.
Shelter is excluded from the extraction. The region codes use the official
geography coordinates.

- [Reference family component table](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1110006601)
- [Current MBM definition and square-root equivalence](https://www23.statcan.gc.ca/imdb/p3Var.pl?Function=DECI&Id=1586745)
- [2023-base methodology and Nunavut reference family](https://www150.statcan.gc.ca/n1/pub/75f0002m/75f0002m2025003-eng.htm)
- [Open Licence](https://www.statcan.gc.ca/en/reference/licence)

The [direct model](doc/direct-model.cashle) projects the Toronto basket.
