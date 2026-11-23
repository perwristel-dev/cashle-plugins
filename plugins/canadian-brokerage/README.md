# Canadian brokerage account plugin

The ZIP provides the Canadian brokerage account editor and 2026 tax policy for
a pool of identical listed shares. Realized gains and losses use the average
adjusted cost base (ACB). Annual assessment classifies foreign, eligible and
non-eligible dividends. Capital losses require confirmation of the
superficial-loss conditions.

From the repository root, run `node plugins/canadian-brokerage/build.mjs` to
build `cashle-account-ca-brokerage-source.zip`. Upload it to the personal
plugin repository and enable it along with the
[Canadian tax plugin](../canadian-tax/README.md). The account retains saved type
`cashlab.ca-brokerage` version 1 and the `caBrokerage` DSL block.

Run the [direct model](doc/direct-model.cashle) from the repository root after
building the CLI.

```sh
cashle-cli/build/install/cashle/bin/cashle plugins/canadian-brokerage/doc/direct-model.cashle --classpath plugins/canadian-brokerage --classpath plugins/canadian-tax
```

The case closes the CAD 15,000 brokerage account on June 1, 2026. With its
CAD 5,000 capital gain and CAD 85,000 salary, the final assessment is
CAD 21,728.9956. The [Canadian rule sources](../../docs/tax-north-america-research.md#canada)
document the supported rules.
