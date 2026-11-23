# PA16-II-tjanste occupational pension agreement

This Swedish agreement supplies eligibility and defined-contribution premiums to the
Cashle pension engine. It uses the saved scheme ID `PA16-II-tjanste` and the
provider ID `cashle.pension.agreement.PA16-II-tjanste`.

Build the ZIP from the repository root with
`node plugins/pension-agreement-pa16-ii-tjanste/build.mjs`. In Cashle Lab install this
package alongside its occupational pension type and the
[shared rules library](../pension-agreement-rules/README.md).

Run the [direct CLI model](doc/direct-model.cashle) with the standard
Cashle distribution from the repository root.

```sh
cashle-cli/build/install/cashle/bin/cashle plugins/pension-agreement-pa16-ii-tjanste/doc/direct-model.cashle
```

See the [Swedish rules and provenance](../../docs/swedish-pensions.md#regelutgåva-och-utbetalningsantaganden).
