# Konsumentverket’s household budget

The `cashle.finance.budget.se` plugin calculates monthly household costs using
Konsumentverket’s 2026 reference amounts and the plan’s inflation and FX
assumptions. Its saved module type is `cashlab.consumer-budget@1`.

The required baseline can be reported as one expense or split by category.
A positive deviation is one additional expense with its own necessity and
savings settings. The schedule starts on the plan’s opening day and runs
monthly. It follows active household members, their residence, and the
entered household events. See the [data and rule provenance](doc/provenance.md).

Build the source-only ZIP and run the direct-model example from the repository
root.

```sh
node plugins/swedish-consumer-budget/build.mjs
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/swedish-consumer-budget/doc/direct-model.cashle --classpath plugins/swedish-consumer-budget
```

The `reference` operation accepts `{profile, date, residenceChanges, language}`.
Residence rows include an `owner`, a resolved ISO `date` or `null`, and raw
country `settings`. It returns the supported household’s monthly 2026 prices
in SEK. Incomplete or uncertain facts return `null`. The app uses this query
for the household reference before running a forecast.
