# Italian PIR source plugin

This bundle provides an ordinary Italian PIR account under the 2025 rules.
Annual and lifetime external contributions use separate counters. Withdrawals
use provider-confirmed five-year holding for each contribution lot or
provider-resolved tax and interest for early full closure. The account editor
and validation messages are available in English and Swedish.

Build the ZIP with Node.js and `zip`.

```sh
node plugins/italian-pir/build.mjs
```

Install `cashle-account-it-pir-source.zip` alongside the
[Italian tax source plugin](../italian-tax/README.md). The module keeps its
saved type `cashlab.it-pir` and DSL entry point `itPir`.

The [direct model](doc/direct-model.cashle) closes a qualifying PIR on
1 June 2025 and returns EUR 15,000 without tax. See the
[Italian rule provenance](../../docs/tax-italy-spain-france-research.md).
