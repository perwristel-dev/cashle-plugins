# Swedish investment savings account (ISK)

The package supplies `cashlab.isk` version 1 and the 2025 ISK tax policy.
The policy uses quarterly opening values and eligible deposits to calculate
imputed income. One SEK 150,000 allowance per person is shared with other
ISKs, capital insurance and PEPP. The bundle also defines retained-account
and foreign reporting defaults. The Swedish tax provider assesses the
resulting capital income.

Build the installable ZIP with `node plugins/swedish-isk/build.mjs`. The ZIP
contains the account editor and translations in English and Swedish. Enable
the [Swedish tax plugin](../swedish-tax/) for Swedish assessments.

The [direct model](doc/direct-model.cashle) holds SEK 200,000 in each of two
accounts and assesses SEK 2,220 in final tax.

```sh
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/swedish-isk/doc/direct-model.cashle
```
