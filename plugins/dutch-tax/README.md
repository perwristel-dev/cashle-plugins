# Dutch tax plugin

The plugin provides the Netherlands' 2026 employment tax, national insurance,
provisional Box 3 deemed-return assessment and property-sale treatment.
The residence and property editors include Swedish and English catalogues.
Enter external wealth separately from investment accounts already in the plan.

Build the installation ZIP with Node.js and `zip` from the repository root.

```sh
node plugins/dutch-tax/build.mjs
```

Install and enable `cashle-tax-nl-source.zip` in Cashle's plugin repository and
reload. The plugin retains the `NL` country code and existing saved input keys.

The [direct model](doc/direct-model.cashle) uses EUR 40,000 in employment income
and no Box 3 wealth in 2026. It accrues EUR 1,748.70 in income tax and
EUR 4,537.18 in national insurance.

```sh
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/dutch-tax/doc/direct-model.cashle --classpath plugins/dutch-tax
```

[Rule provenance](../../docs/tax-germany-netherlands-research.md)
