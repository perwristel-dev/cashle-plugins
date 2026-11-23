# Italian tax source plugin

This bundle provides Italy's existing 2025 individual tax and property sale
policies. It includes residence, payroll, investment and property settings
in English and Swedish.

Build the source ZIP with Node.js and `zip`.

```sh
node plugins/italian-tax/build.mjs
```

Install `cashle-tax-it-source.zip` in the Cashle plugin repository and enable it
in the app. Italy will appear in the tax residence and property settings.

The [direct model](doc/direct-model.cashle) books EUR 260 of tax on EUR 1,000
of capital income. The [pinned assessment](doc/pinned-assessment.cashle)
checks the annual posting date, tax, contributions and closing cash.

```sh
cashle-cli/build/install/cashle/bin/cashle plugins/italian-tax/doc/direct-model.cashle --classpath plugins/italian-tax
```

See the [rule provenance](doc/ITALIAN_RESIDENCE_SOURCES.md) for the official
sources and forecast assumptions.
