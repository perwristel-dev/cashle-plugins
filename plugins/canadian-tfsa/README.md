# Canadian TFSA plugin

The ZIP provides the Canadian TFSA editor and 2026 tax policy. Model a
person's holdings in one account with verified remaining contribution room.
Deposits use that room. Withdrawals restore room the following year with the
assumed CAD 7,000 annual allowance in rule-year money.

From the repository root, run `node plugins/canadian-tfsa/build.mjs` to build
`cashle-account-ca-tfsa-source.zip`. Upload it to the personal plugin
repository and enable it along with the
[Canadian tax plugin](../canadian-tax/README.md). The account retains saved type
`cashlab.ca-tfsa` version 1 and the `caTfsa` DSL block.

Run the [direct model](doc/direct-model.cashle) from the repository root after
building the CLI.

```sh
cashle-cli/build/install/cashle/bin/cashle plugins/canadian-tfsa/doc/direct-model.cashle --classpath plugins/canadian-tfsa --classpath plugins/canadian-tax
```

The case closes the CAD 15,000 TFSA on June 1, 2026 and transfers the full
balance to cash without an income tax charge. The
[Canadian rule sources](../../docs/tax-north-america-research.md#canada)
document the supported rules.
