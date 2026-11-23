# Spanish tax plugin

The plugin supplies Spain's common-territory IRPF for income year 2025 and
its residence, source and property tax UI. The DSL uses the user's verified
autonomous-community schedule and personal minimum. It tracks separate
four-year carryforwards for investment gains and savings-income losses.
Property assessment covers private-home gains, the habitual-home exemption
from age 65 and the proportional exemption for completed reinvestment.

Build the installation ZIP from the repository root using Node.js and `zip`:

```sh
node plugins/spanish-tax/build.mjs
```

Upload `cashle-tax-es-source.zip` to the personal plugin repository, enable
it and reload Cashle. Existing plans keep their `ES` code and input fields.
Use a Cashle build that supports [the country tax DSL](../../cashle-plugin-groovy/README.md#country-tax-policies).

The [direct model](doc/direct-model.cashle) books EUR 925.50 in annual income
tax on EUR 10,000 of savings income. Run it from the repository root:

```sh
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/spanish-tax/doc/direct-model.cashle --classpath plugins/spanish-tax
```

See the [Spanish rules and source references](../../docs/tax-italy-spain-france-research.md)
and the [IRPF 2025 manual](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025.html).
