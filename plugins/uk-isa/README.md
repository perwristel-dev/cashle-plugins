# UK Stocks and Shares ISA source plugin

This bundle provides an adult, non-flexible UK Stocks and Shares ISA under
the 2026/27 tax rules. The account shares a GBP 20,000 fiscal-year allowance
with other ISAs. Withdrawals leave the subscription counter intact. The
account editor and validation messages are available in English and Swedish.

Build the ZIP with Node.js and `zip`.

```sh
node plugins/uk-isa/build.mjs
```

Install `cashle-account-gb-isa-source.zip` alongside the
[United Kingdom tax source plugin](../uk-tax/README.md). The module keeps
its saved type `cashlab.gb-isa` and DSL entry point `gbIsa`.

The [direct model](doc/direct-model.cashle) closes an ISA on 1 September 2026
and returns GBP 15,000 tax-free. See the
[UK policy notes](../../docs/tax-anglosphere-research.md#uk).
