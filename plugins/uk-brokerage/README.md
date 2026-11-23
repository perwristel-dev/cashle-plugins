# UK brokerage source plugin

This bundle provides a UK brokerage account for a verified Section 104 pool
under the 2026/27 tax rules. Withdrawals use the pool's proportional basis or
a supplied resolved basis. Dividends, realized gains and realized losses
feed the annual UK assessment. The account editor and validation messages
are available in English and Swedish.

Build the ZIP with Node.js and `zip`.

```sh
node plugins/uk-brokerage/build.mjs
```

Install `cashle-account-gb-brokerage-source.zip` alongside the
[United Kingdom tax source plugin](../uk-tax/README.md). The module keeps
its saved type `cashlab.gb-brokerage` and DSL entry point `gbBrokerage`.

The [direct model](doc/direct-model.cashle) closes a GBP 15,000 portfolio on
1 September 2026. The model has GBP 54,234 in final cash and GBP 11,036 in
total final tax. See the [UK policy notes](../../docs/tax-anglosphere-research.md#uk).
