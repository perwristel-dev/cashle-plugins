# Swedish tax source bundle

The bundle provides Swedish 2025 ordinary income tax and payroll withholding,
private-home sales and deferrals, tax after emigration, and the physical tax
account. `swedish-tax.cashle` declares the country provider `cashle.tax.se`.
`account-lifecycle.cashle` declares `cashle.tax.se.runtime` with the
`SE-physical-tax-account` lifecycle. Both use the public Cashle SDKs.
The UI preserves the existing `SE` profile and property options.

Build an installable ZIP with `node plugins/swedish-tax/build.mjs /tmp/swedish-tax.zip`.
The bundle contains the editable source, localized UI and reference tables.
A Cashle distribution that includes the bundled source providers can run
`plugins/swedish-tax/doc/direct-model.cashle` directly.

The ordinary assessment uses the [pinned Swedish rules](rule-provenance.json).
See the [monthly](preliminary-tax-monthly-2025-provenance.json) and
[biweekly](preliminary-tax-biweekly-2025-provenance.json) withholding table
provenance and the [emigration rule sources](SWEDISH_EMIGRATION_SOURCES.md).
