# Swedish investment savings account (ISK)

The package supplies `cashlab.isk` version 1 and the Swedish ISK tax policy.
The policy uses quarterly opening values and eligible deposits to calculate
imputed income. Swedish tax version 3 pools the annual allowance across
the owner's ISKs and capital insurance. The allowance is SEK 150,000 for
2025 and SEK 300,000 from 2026. The bundle also defines retained-account
and foreign reporting defaults. The Swedish tax provider assesses the
resulting capital income.

Build the installable ZIP with `node plugins/swedish-isk/build.mjs`. The ZIP
contains the account editor and translations in English and Swedish. Enable
the [Swedish tax plugin](../swedish-tax/) for Swedish assessments.

The [direct model](doc/direct-model.cashle) holds SEK 200,000 in each of two
accounts and assesses SEK 1,065 in final tax for 2026. Put the compiled
Swedish tax bundle beside the example before running it.

```sh
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/swedish-isk/doc/direct-model.cashle
```
