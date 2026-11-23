# US brokerage account

The source bundle owns `cashlab.us-brokerage` version 1 and its `usBrokerage` finance block. Its 2026 tax policy tracks short- and long-term gains and losses for a single acquisition lot. Withdrawals use the lot’s actual acquisition date and proportional cost basis. Dividends go to household cash, and capital losses require confirmation of the wash-sale condition.

Run `node plugins/us-brokerage/build.mjs` to build `cashle-us-brokerage-source.zip`. The ZIP contains the account and tax DSL declarations, the editor descriptor and both English and Swedish catalogs. It uses Cashle’s shared investment graph and the Groovy DSL provider.

Run the [direct model](doc/direct-model.cashle) from the repository root with the US income-tax source on the resource path.

```sh
cashle plugins/us-brokerage/doc/direct-model.cashle --classpath plugins/us-brokerage --classpath plugins/us-tax
```
