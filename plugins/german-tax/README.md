# German tax source plugin

This bundle installs Germany's existing 2026 individual income tax and private
home sale policies. The same package contributes the residence and property
settings in English and Swedish. It preserves the existing DE inputs, supported
listed-share classifications, assessment notices and separate loss balances.

Build the source ZIP with Node.js 24 and `zip`:

```sh
node plugins/german-tax/build.mjs
```

Install `cashle-tax-de-source.zip` in the Cashle plugin repository and enable it
in the app. Germany will appear in the tax residence and property settings.

The [direct model](doc/direct-model.cashle) books EUR 263.75 of tax on EUR 2,000
of capital income. The EUR 1,000 saver allowance leaves EUR 250 of capital tax
and EUR 13.75 of solidarity levy.

```sh
cashle-cli/build/install/cashle/bin/cashle plugins/german-tax/doc/direct-model.cashle --classpath plugins/german-tax
```

See the [rule provenance](../../docs/tax-germany-netherlands-research.md) for the
statutory sources and the assumptions of the supported forecast.
