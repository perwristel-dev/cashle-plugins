# Canadian tax plugin

The ZIP contains the 2026 tax rules for Alberta and Ontario and their tax
residence and property sale editors. The policy covers federal and provincial
tax, CPP and EI, eligible and non-eligible dividends, capital gains and
losses, and supported private residential sales. Investment account policies
are supplied by their respective account plugins.

Build the installation ZIP from the repository root with Node.js and `zip`:

```sh
node plugins/canadian-tax/build.mjs
```

Upload `cashle-tax-ca-source.zip` to the personal plugin repository, enable it
and reload Cashle. Choose Canada as the tax residence or property jurisdiction.
Existing plans use the same country code and input fields.

Run the [direct model](doc/direct-model.cashle) from the repository root:

```sh
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/canadian-tax/doc/direct-model.cashle --classpath plugins/canadian-tax
```

The case assesses CAD 6,875.20 in tax on CAD 50,000 in Alberta interest income.
The [Canadian rule sources](../../docs/tax-north-america-research.md#canada)
document the rates, supported profiles and statutory references.
