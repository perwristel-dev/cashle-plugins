# Spanish listed-share account

The plugin provides the `esCuentaValores` DSL block and the account editor for a
Spanish cuenta de valores. It models one homogeneous acquisition lot and
recognizes gains, qualifying losses and dividends in the owner's annual IRPF
assessment. A tax deduction on a listed-share loss requires confirmation of the
two-month repurchase restriction or a provider-resolved deductible amount.

Build the source ZIP using Node.js and `zip`:

```sh
node plugins/spanish-cuenta-valores/build.mjs
```

Install `cashle-account-es-cuenta-valores-source.zip` and the [Spanish IRPF
plugin](../spanish-tax/README.md) for a domestic Spanish plan. The account
preserves the saved module type `cashlab.es-cuenta-valores` and its fields.

The [direct model](doc/direct-model.cashle) closes a EUR 15,000 holding acquired
for EUR 10,000 and books EUR 17,057 in total annual tax, including salary.

```sh
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/spanish-cuenta-valores/doc/direct-model.cashle
```

See [rule provenance and Spanish sources](../../docs/tax-italy-spain-france-research.md).
