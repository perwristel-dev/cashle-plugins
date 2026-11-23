# Italian ordinary investment account source plugin

This bundle provides the Conto titoli ordinario account for one homogeneous
listed-share lot under the 2025 dichiarativo regime. It sends gains, losses and
dividends to the Italian tax policy and assesses financial-provider statement
stamp duty on the verified balance and holding days. The account editor and
validation messages are available in English and Swedish.

Build the ZIP with Node.js and `zip`.

```sh
node plugins/italian-conto-ordinario/build.mjs
```

Install `cashle-account-it-conto-ordinario-source.zip` alongside the
[Italian tax source plugin](../italian-tax/README.md). The module keeps its
saved type `cashlab.it-conto-ordinario` and DSL entry point `itContoOrdinario`.

The [direct model](doc/direct-model.cashle) closes the account on 1 June 2025
and produces EUR 20,970.49 in total final tax. See the
[Italian rule provenance](../../docs/tax-italy-spain-france-research.md).
