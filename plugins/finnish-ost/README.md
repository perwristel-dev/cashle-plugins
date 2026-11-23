# Finnish OST source plugin

This bundle supplies `cashlab.fi-ost` version 1 and its proportional withdrawal
policy. The amount of contributed capital returned by a withdrawal restores
deposit capacity under the 100,000 EUR ceiling. The provider withholds 30% on
the taxable gain portion. A loss is recognized on explicit account closure.

Build the ZIP with `node plugins/finnish-ost/build.mjs` from the repository root.
Upload `cashle-account-fi-ost-source.zip` to your personal Cashle plugin
repository. Select the Finnish country tax plugin with the account to calculate
the final annual tax.

The [direct model](doc/direct-model.cashle) closes an OST worth 15,000 EUR with
10,000 EUR in remaining contributed capital. It leaves 13,500 EUR in cash and
records 1,500 EUR in final tax.

```bash
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/finnish-ost/doc/direct-model.cashle --classpath plugins/finnish-ost --classpath plugins/finnish-tax
```
