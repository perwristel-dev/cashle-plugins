# Danish tax plugin

This source plugin provides Denmark's 2026 personal income tax assessment,
foreign listed-share rules and private-home sale rules. Its tax-residence and
property editors include Swedish and English catalogues. The policy supports
ordinary single-person assessments with full-year residence.

Build the installation ZIP with Node.js and `zip` from the repository root.

```sh
node plugins/danish-tax/build.mjs
```

Install `cashle-tax-dk-source.zip` in Cashle's personal plugin repository,
enable it and reload. Select Denmark as a tax residence or property tax
jurisdiction. Existing cases use the same country and saved input keys.

Run the [direct model](doc/direct-model.cashle) using a Cashle build that
supports the [country tax DSL](../../cashle-plugin-groovy/README.md#country-tax-policies).
The model accrues DKK 215,672.79 in tax for 2026 on a DKK 50,000 monthly salary.

```sh
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/danish-tax/doc/direct-model.cashle --classpath plugins/danish-tax
```

[Rule provenance](doc/rule-provenance.json)
