# Swedish public pension

Install or build this versioned pension separately from other pension types.
To build the ZIP, run `node plugins/swedish-public-pension/build.mjs <output.zip>`.
It contains the provider source and its localizations. Install the shared
[Swedish pension source library](../swedish-pension-rules/README.md) as well.

With the source plugin installed, run the named block in the [direct model](doc/direct-model.cashle):

```sh
cashle-cli/build/install/cashle/bin/cashle plugins/swedish-public-pension/doc/direct-model.cashle
```
