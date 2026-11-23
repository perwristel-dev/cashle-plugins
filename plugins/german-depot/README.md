# German listed-share depot

The bundle provides the version 1 `cashlab.de-depot` account editor in English
and Swedish, the `deDepot` Cashle DSL block, and the German 2026 account policy.
The policy models FIFO for a single homogeneous listed-share lot acquired in
2009 or later. The [German tax plugin](../german-tax/README.md) combines the
depot's dividends, share gains and share losses with the owner's annual taxes.

Build and install `cashle-finance-de-depot-source.zip` in Cashle, then enable the
German tax plugin to assess plans with German tax residence.

```sh
node plugins/german-depot/build.mjs
```

Run the depot's [direct model](doc/direct-model.cashle) from the repository root.
The depot closes on 1 June 2026 and realizes EUR 5,000 in share income. With
EUR 60,000 of wages, the model posts EUR 23,504 of final tax and ends with
EUR 51,496 in cash.

```sh
cashle-cli/build/install/cashle/bin/cashle plugins/german-depot/doc/direct-model.cashle --classpath plugins/german-depot --classpath plugins/german-tax
```

See the [German tax rule provenance](../../docs/tax-germany-netherlands-research.md)
for the statutory sources and the supported assumptions.
