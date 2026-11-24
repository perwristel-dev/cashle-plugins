# Konsumentverket’s household budget

The `cashle.finance.budget.se` plugin calculates monthly household costs using
Konsumentverket’s 2026 reference amounts and the plan’s inflation and FX
assumptions. Its saved module type is `cashlab.consumer-budget@1`.

The required baseline can be reported as one expense or split by category.
One savings policy applies to the entire baseline in either view.
A positive deviation is one additional expense with its own necessity and
savings settings. The schedule starts on the plan’s opening day and runs
monthly. It follows the case household and its residence. Each adult stops
contributing costs at their life-expectancy milestone in the plan. See the [data and rule provenance](doc/provenance.md).

Build the source-only ZIP and run the direct-model example from the repository
root.

```sh
node plugins/swedish-consumer-budget/build.mjs
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/swedish-consumer-budget/doc/direct-model.cashle --classpath plugins/swedish-consumer-budget
```

The `reference` operation accepts `{profile, date, residenceChanges, lifeEnds, language}`.
Residence rows include an `owner`, a resolved ISO `date` or `null`, and raw
country `settings`. The optional `lifeEnds` map contains resolved planned dates by
person ID. It returns the supported household’s monthly 2026 prices
in SEK. Incomplete or uncertain facts return `null`. The app uses this query
for the household reference before running a forecast.
