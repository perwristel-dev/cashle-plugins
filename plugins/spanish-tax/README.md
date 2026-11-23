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

The 2025 IRPF forecast combines taxable pensions and wages in the general
base. Employee charges apply to wages. State personal minima include the age
increments above 65 and 75. The estimate also uses these national increments
for the supplied regional base minimum, which can differ from the actual
local rule. The low-salary credit is estimated against the wage share of the
ordinary income liability. Actual regional or personal relief can differ.
[AEAT personal minima](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c14-adecuacion-impuesto-circunstancias-personales/minimo-contribuyente.html) ·
[AEAT wage credit](https://sede.agenciatributaria.gob.es/Sede/eu_es/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c18-cuota-liquida-resultante-autoliquidacion/deducciones-cuota-liquida-total/deduccion-obtencion-rendimientos-trabajo.html)
