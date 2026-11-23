# United Kingdom tax plugin

The ZIP contains the residence and private-property editors, English and
Swedish translations, and Cashle DSL rules for the 2026/27 tax year. The
rules cover annual income tax, employee National Insurance, savings interest,
dividends, foreign listed shares and capital gains, including the fiscal
calendar and carried capital losses. Private Residence Relief and the
60-day residential capital gains payment use the entered property facts.

Build the ZIP from the repository root:

```sh
node plugins/uk-tax/build.mjs
```

Upload `cashle-tax-gb-source.zip` to the personal plugin repository, enable
it and reload Cashle. Existing UK cases use the same `GB` country code and
input fields. Use a Cashle build with the [country tax DSL](../../cashle-plugin-groovy/README.md#country-tax-policies).

The [direct model](doc/direct-model.cashle) books GBP 7,540 in income tax and
GBP 3,016 in employee National Insurance on GBP 50,270 in salary. Run it from
the repository root:

```sh
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/uk-tax/doc/direct-model.cashle --classpath plugins/uk-tax
```

The [UK policy notes](../../docs/tax-anglosphere-research.md#uk) document the
enacted rates, qualifying assumptions and official sources.
