# Norwegian tax plugin

The plugin contains the Norwegian residence settings, property tax editor and
2026 tax calculations. It covers ordinary personal income tax, relevant
foreign listed-share income and private-home sale rules. Norwegian ASK accounts
have their own account plugin.

Build the installation ZIP from the repository root using Node.js and `zip`:

```sh
node plugins/norwegian-tax/build.mjs
```

Upload `cashle-tax-no-source.zip` to the personal plugin repository, enable it
and reload Cashle. Choose Norway as tax residence or property tax jurisdiction.
Existing Norwegian plans use the same country code and input fields. Use a
Cashle build that supports the [country tax DSL](../../cashle-plugin-groovy/README.md#country-tax-policies).

The [direct model](doc/direct-model.cashle) accrues NOK 144,182.60 in 2026 on
a NOK 50,000 monthly salary in the ordinary region. Run it from the
repository root:

```sh
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/norwegian-tax/doc/direct-model.cashle --classpath plugins/norwegian-tax
```

See the [rule provenance](doc/rule-provenance.json) for the statutory sources.

The `pension` source basis supports ordinary 2026 personal and bracket tax,
the pension minimum deduction and the reduced national-insurance rate.
The additional pension tax credit and wealth tax are outside this forecast.
[2026 minimum deduction](https://www.skatteetaten.no/satser/minstefradrag/?year=2026) ·
[2026 national-insurance rates](https://www.skatteetaten.no/satser/trygdeavgift/?year=2026)
