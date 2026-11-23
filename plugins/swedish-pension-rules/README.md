# Swedish pension source library

This plugin exports the shared pension ledger, monthly calendar and Swedish plan
assumptions. It has no model tasks or individual pension rules. Each pension
plugin imports `swedish-pension-common.cashle` through `cashle.finance.pension.rules`.

Build the source archive with `node plugins/swedish-pension-rules/build.mjs <output.zip>`.
Install the library with the pension type that requires it.
