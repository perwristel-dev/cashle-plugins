# Norwegian ASK source plugin

This bundle provides `cashlab.no-ask` version 1. The account pays out
contributed capital first, applies the shielding allowance to taxable gains
and recognizes losses when the account closes. The forecast shielding rate follows the plan’s Low return profile, including
its uncertainty in Monte Carlo simulations. The deduction uses rates between
0% and 100%.

Build the ZIP from the repository root with
`node plugins/norwegian-ask/build.mjs`. Upload
`cashle-account-no-ask-source.zip` to the Cashle plugin repository and enable
it alongside the [Norwegian tax plugin](../norwegian-tax/README.md). The package
includes the account editor and both Swedish and English translations.

The [direct model](doc/direct-model.cashle) closes an ASK on 1 June 2026 and
records NOK 146,074.60 in final tax and NOK 468,925.40 in closing cash.

```bash
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/norwegian-ask/doc/direct-model.cashle --classpath plugins/norwegian-ask --classpath plugins/norwegian-tax
```
