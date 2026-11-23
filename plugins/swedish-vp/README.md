# Swedish securities account (VP)

The package supplies `cashlab.vp` version 1 and the 2025 VP tax policy.
Deposits and reinvested dividends increase cost basis, and withdrawals or
planned sales realize gains or losses. Same-class shares are pooled across
each owner's identified holdings. Capital losses first offset gains and the
remaining loss enters the owner's annual capital income at 70 percent. The
policy can also normalize foreign listed shares for Swedish assessment.

Build the installable ZIP with `node plugins/swedish-vp/build.mjs`. The ZIP
contains the account editor and translations in English and Swedish. Enable
the [Swedish tax plugin](../swedish-tax/) for Swedish assessments.

The [direct model](doc/direct-model.cashle) uses two accounts to demonstrate
how a purchase on the same day changes the basis of the next withdrawal. It
assesses SEK 6,878 in final tax.

```sh
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/swedish-vp/doc/direct-model.cashle
```
