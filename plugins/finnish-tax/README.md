# Finnish tax source plugin

This bundle supplies Cashle's 2026 mainland Finnish tax policy and editors. It
covers earned income, foreign listed shares and private-home sales. The source
recognizes only one class of earned income per person and assessment. Foreign
investment losses can carry for ten years. The separate property loss carry
lasts five years.

Build the source ZIP with `node plugins/finnish-tax/build.mjs` from the repository
root. Upload `cashle-tax-fi-source.zip` to your personal plugin repository in
Cashle and enable it. The host will select the source provider for plans using
Finnish tax residence or Finnish property tax.

The [direct model](doc/direct-model.cashle) uses a 50,000 EUR annual salary and
the pinned 2026 assessment with municipal and church rates of 5.3% and 1%.
It accrues 9,361.96 EUR in assessed tax and 4,095 EUR in social contributions.

```bash
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/finnish-tax/doc/direct-model.cashle --classpath plugins/finnish-tax
```

See [rule provenance](doc/rule-provenance.json) for the official sources.
