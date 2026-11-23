# Danish Aktiesparekonto (ASK)

This source plugin provides the Danish ASK account editor and 2026 bank-collected
mark-to-market tax. The tax rate is 17%. The rules include the DKK 174,200
deposit ceiling, negative-tax credit, opening unpaid bank tax and settlement
at the bank's annual collection date or on account closure.

Build the installation ZIP with Node.js and `zip`.

```sh
node plugins/danish-ask/build.mjs
```

Install and enable `cashle-dk-ask-source.zip` and the [Danish country tax
plugin](../danish-tax/README.md), then reload Cashle. Existing cases retain
their account type `cashlab.dk-ask` and saved input format.

The [direct model](doc/direct-model.cashle) closes an account with DKK 5,000
of taxable growth. It assesses DKK 850 and releases DKK 14,150 to plan cash.

```sh
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/danish-ask/doc/direct-model.cashle --classpath plugins/danish-ask --classpath plugins/danish-tax
```

[Danish tax rules and provenance](../danish-tax/doc/rule-provenance.json)
