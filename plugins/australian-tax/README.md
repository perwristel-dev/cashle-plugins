# Australian tax plugin

The plugin contains Australia's residence settings, property tax editor and
2026/27 tax calculations. It covers ordinary resident income tax, the low
income tax offset, Medicare, franking credits and capital gains with loss
carry. The property policy uses verified main-residence facts, absence
elections and the first-income cost basis rule.

Build the installation ZIP from the repository root with Node.js and `zip`.

```sh
node plugins/australian-tax/build.mjs
```

Upload `cashle-tax-au-source.zip` to the personal plugin repository, enable it
and reload Cashle. Choose Australia as the tax residence or property tax
jurisdiction. Existing Australian plans use the same country code and input
fields.

The [direct model](doc/direct-model.cashle) assesses a salary of AUD 60,000
over the 2026/27 fiscal year. Its income tax is AUD 8,105 and its Medicare
levy is AUD 1,180.

```sh
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/australian-tax/doc/direct-model.cashle --classpath plugins/australian-tax
```

See the [2026/27 rule research and sources](../../docs/tax-anglosphere-research.md#australia).
