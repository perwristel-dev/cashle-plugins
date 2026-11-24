# Icelandic tax source plugin

This package contains the Icelandic 2026 income and housing tax rules and the
Cashle Lab profile and property editors in English and Swedish. Cashle loads
`icelandic-tax.cashle` through the Groovy Cashle DSL provider. The package
depends on the shared tax service and tax support library.

Build an installable archive with `node plugins/icelandic-tax/build.mjs` and
upload it through Cashle Lab's plugin settings. Its provider ID is
`cashle.tax.is`. The [direct model](doc/direct-model.cashle) selects the same
provider in the CLI. Pass the package directory as a plugin classpath entry
when running the model so the localized messages are available.

The [rule provenance](doc/rule-provenance.json) records the rules carried over
from the Icelandic provider and the supported calculation scope.

The selected municipality supplies the actual annual rate. Monthly
withholding retains the official nationwide average.
[Association of Icelandic Local Authorities](https://www.samband.is/tekjustofnar)
