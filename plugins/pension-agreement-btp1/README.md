# BTP 1 occupational pension agreement

BTP 1 is the defined-contribution agreement for the Swedish banking sector.
Its scheme ID is `BTP1`. Use it for a combined projection, or add both
`BTP1-TRYGG` and `BTP1-VALBAR` to forecast the portions independently.
Using the combined scheme alongside either portion counts that premium twice.

The model applies the agreement from the start of modeled covered employment.
It takes 2.5% up to 7.5 income base amounts for the protected portion.
For members born in 1967 or later, the selectable portion takes 4% up to
7.5 income base amounts and 32% from 7.5 to 30. The older and pre-2023 baseline
uses 2% and 30% for the same bands. The change to the strengthened premium
was phased in locally before January 2023. The model approximates that period
with the baseline and uses the shared indexed 2026 income base for other years.
It projects monthly salary and premiums. Annual reconciliation, local terms,
special pay components and insurance charges require information from the provider.

The normal retirement age is 65. The agreement pays the protected portion for life. Choose a lifetime withdrawal
for that portion in Cashle. The flexible term of the selectable portion can be
modeled independently.

Sources are the [2026 banking agreement, BTP 1 §§ 2–5][bank],
[Finansförbundet’s BTP 1 guide][btp1-union] and
[Valcentralen’s breakdown of the portions][btp1-val].

[btp1-union]: https://www.finansforbundet.se/rad-stod/pension/tjanstepension-fran-din-arbetsgivare2/btp1/
[btp1-val]: https://www.valcentralen.se/Valcentralen/Page.aspx?page=188
[bank]: https://www.finansforbundet.se/globalassets/material---bestall-hem/produkter/pensionsavtal-finansarbetsgivarna-finansforbundet-2026-01-01.pdf

## Build and run

Run `node plugins/pension-agreement-btp1/build.mjs` to build the ZIP from
the repository root. In Cashle Lab, install it alongside the occupational
pension types and the [shared agreement rules](../pension-agreement-rules/README.md).

The [CLI example](doc/direct-model.cashle) generates a balance-sheet report.
With `cli_dir` set to the absolute path of the installed Cashle CLI distribution,
run the following from the plugins repository root.

```sh
plugins_dir="$PWD/plugins"
example_dir="$(mktemp -d)"
agreement_dir="$plugins_dir/pension-agreement-btp1"
common_dir="$plugins_dir/swedish-pension-rules"
class_path="$cli_dir/lib/*"

java -cp "$class_path" dev.cashle.cli.CompilePluginSource \
  "$agreement_dir/btp1.cashle" "$example_dir/btp1.cashlec" \
  "$plugins_dir/pension-agreement-rules/SwedishAgreementRules.groovy"

for kind in dc; do
  type_dir="$plugins_dir/swedish-$kind-pension"
  java -cp "$class_path" dev.cashle.cli.CompilePluginSource \
    "$type_dir/swedish-$kind-pension.cashle" "$example_dir/$kind.cashlec" \
    "$common_dir/swedish-pension-common.cashle" \
    --resource swedish/pension/common_en.properties "$common_dir/swedish/pension/common_en.properties" \
    --resource swedish/pension/common_sv.properties "$common_dir/swedish/pension/common_sv.properties" \
    --resource "swedish/pension/${kind}_en.properties" "$type_dir/swedish/pension/${kind}_en.properties" \
    --resource "swedish/pension/${kind}_sv.properties" "$type_dir/swedish/pension/${kind}_sv.properties"
done

node --input-type=module - "$class_path" "$plugins_dir/swedish-tax" "$example_dir/tax.cashlec" <<'JS'
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const [classPath, directory, output] = process.argv.slice(2);
const { sources } = JSON.parse(readFileSync(join(directory, 'plugin.json'), 'utf8'));
const source = sources.find(entry => entry.providers?.includes('cashle.tax.se'));
execFileSync('java', [
  '-cp', classPath, 'dev.cashle.cli.CompilePluginSource', join(directory, source.path), output,
  ...source.dependencies.map(path => join(directory, path)),
  ...source.resources.flatMap(path => ['--resource', path, join(directory, path)]),
], { stdio: 'inherit' });
JS

cp "$agreement_dir/doc/direct-model.cashle" "$example_dir/"
"$cli_dir/bin/cashle" "$example_dir/direct-model.cashle"
```
