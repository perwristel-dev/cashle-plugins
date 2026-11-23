# Dutch beleggingsrekening

The bundle provides the version 1 `cashlab.nl-beleggingsrekening` investment
account, its Swedish and English editor, and the `nlBeleggingsrekening` DSL
block. For 2026, the account contributes its market value on 1 January to
the owner's Box 3 calculation. Withdrawals and closure do not generate a
separate capital gain or loss for tax purposes.

Build and install `cashle-finance-nl-beleggingsrekening-source.zip`. Enable
the [Dutch tax plugin](../dutch-tax/README.md) for plans with Dutch tax residence.

```sh
node plugins/dutch-beleggingsrekening/build.mjs
```

The [direct model](doc/direct-model.cashle) closes the EUR 15,000 account on
1 June 2026. With EUR 60,000 in wages, the model posts EUR 15,906.47 in taxes
and ends with EUR 59,093.53 in cash.

```sh
cashle-cli/build/install/cashle/bin/cashle plugins/dutch-beleggingsrekening/doc/direct-model.cashle --classpath plugins/dutch-beleggingsrekening --classpath plugins/dutch-tax
```

[Box 3 rule provenance](../../docs/tax-germany-netherlands-research.md)
