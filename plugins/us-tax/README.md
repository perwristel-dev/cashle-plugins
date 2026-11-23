# United States tax plugin

The ZIP includes the 2026 United States country policy, its income and property settings, and Swedish and English messages. It retains federal income tax, employee FICA, capital loss carry by term, and the local income estimate. The property policy covers the Section 121 exclusion and the federal payment calendar. See the [rule research](../../docs/tax-north-america-research.md).

Build the package from the repository root with Node.js and `zip`:

```sh
node plugins/us-tax/build.mjs
```

Upload `cashle-tax-us-source.zip` to the personal plugin repository, enable it, and reload Cashle. Existing plans use the same `US` country code and saved fields.

The [direct model](doc/direct-model.cashle) assesses USD 5,800 of federal income tax and USD 5,087.25 of employee FICA on USD 66,500 of annual Texas salary:

```sh
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/us-tax/doc/direct-model.cashle --classpath plugins/us-tax
```
