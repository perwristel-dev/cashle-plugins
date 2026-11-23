# Consumer Agency reference amounts

The category amounts and age rules are transferred from
DECCF `domainpacks/household/budget.js` at commit
`4a77ee0ab44c0d052ebdc311ce5af491707b1fe7` (file SHA-256
`a2ca0b70e6932e150eec1457867e0c4f701dca04679b0febdf83ba4744c86aa8`).
DECCF attributes the figures to Konsumentverket's 2026 household-cost table:
https://stpubshop.blob.core.windows.net/publikationer/kostnadsberakningar-hushallskostnader-2026-sv-kov_tga_32d.pdf

The reference is a monthly estimate in SEK and excludes weekday lunches,
housing, travel and several other costs. The 2026 table and DECCF provide a
single home-insurance row based on a medium-sized city. Small and large city
values are an approximation: the 2026 row is multiplied by each household
size's small/medium or large/medium ratio from the Consumer Agency's 2024
table, not presented as published 2026 city amounts. The 2024 source is
https://stpubshop.blob.core.windows.net/publikationer/kostnadsberakningar-hushallskostnader-2024-konsumentverket_a4c.pdf.
See https://www.konsumentverket.se/ekonomi/vilka-kostnader-har-ett-hushall/.

The budget engine plugin approximates locality size using SCB TAB5557 municipal population on
2025-12-31. SCB municipalities are larger geographic areas than localities;
the resulting category can therefore differ from the locality's actual size.
Fewer than 50,000 is small, more than 200,000 is large, and values between
those limits, as well as missing municipality codes, use medium. The source
and hash are recorded in the plugin's
[`budget/municipality-population-2025.properties`](../budget/municipality-population-2025.properties).

Part-time residence is an application approximation, not a published table:
individual costs are weighted by residence share, shared costs are linearly
interpolated between integer household sizes, and the internet reduction is
weighted by the largest share among children under eight. As in DECCF,
household sizes above seven extend by the difference between six and seven.
