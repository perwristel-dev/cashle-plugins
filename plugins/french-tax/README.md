# French tax source plugin

The package `cashle.tax.fr` supplies the French income-year 2025 assessment
for full-year residents. Its DSL owns income tax, the reconciliation of gross
wages with actual employee payroll contributions, PFU, ten dated securities-loss
buckets, the ordinary private-home sale rules and notary advances. The UI
includes an annual profile and property-sale form with English and Swedish
catalogues.

Build the installation ZIP with `node plugins/french-tax/build.mjs` from the
repository root. The default output is `plugins/french-tax/cashle-tax-fr-source.zip`.
Install that ZIP through Lab's plugin manager.

[The direct model](doc/direct-model.cashle) selects the same policy and uses the
official worked example with €30,000 in taxable employment. It books €2,104 of
income tax on 31 December 2025 and leaves a cash balance of €9,997,896. Run it
with `cashle plugins/french-tax/doc/direct-model.cashle --classpath plugins/french-tax`.

## Rule sources

- The 2025 income scale for the 2026 assessment and its official worked example. [Service Public F1419](https://www.service-public.gouv.fr/particuliers/vosdroits/F1419)
- The ordinary family quotient, €1,807 half-part cap, single-person décote and 10% employment-expense deduction. [Service Public F34328](https://www.service-public.gouv.fr/particuliers/vosdroits/F34328) · [Service Public F2705](https://www.service-public.gouv.fr/particuliers/vosdroits/F2705) · [Service Public F1989](https://www.service-public.gouv.fr/particuliers/vosdroits/F1989)
- The 18.6% social levy on securities gains assessed in 2026, the 17.2% levy on dividends paid in 2025 and the ten-year use of securities losses. [Service Public F2329](https://www.service-public.gouv.fr/particuliers/vosdroits/F2329) · [Service Public F21618](https://www.service-public.gouv.fr/particuliers/vosdroits/F21618)
- Property-sale exemptions, the separate 22-year and 30-year abatements, surtax and collection by the notary. [Service Public F10864 and form 2048-IMM-SD](https://www.service-public.gouv.fr/particuliers/vosdroits/F10864)

Verification dates and the original scope decisions are recorded in the
[French tax research](../../docs/tax-italy-spain-france-research.md#france).
