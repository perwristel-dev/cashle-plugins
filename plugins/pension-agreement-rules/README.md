# Swedish pension agreement rules library

This source library supplies shared salary bands, the indexed 2026 income
base, age calculations and account metadata. Both PA16 sections and their
components also use shared eligibility and flex rate rules.

To build the library ZIP from the repository root, run
`node plugins/pension-agreement-rules/build.mjs`. Install it before enabling
an agreement that declares `cashle.pension.agreement.rules` as a dependency.
The standard Cashle distribution includes the library.

[Swedish occupational pension agreements](../pension-agreements.md)
