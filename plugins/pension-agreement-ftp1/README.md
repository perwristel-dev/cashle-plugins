# FTP 1 occupational pension agreement

FTP 1 is the defined-contribution agreement for the Swedish insurance sector.
Its scheme ID is `FTP1`. Membership usually applies to people born in 1972 or
later. Select the employer’s confirmed scheme when a different rule applies.

Premiums accrue from the month of the 25th birthday through the month before
the 66th birthday under the April 2025 rules. The standard retirement age is 66. The previous cutoff at 65 continues
for people who had turned 65 by March 31, 2025. The model uses half of the
premium as the traditional portion, the minimum required by the agreement.

| From | Up to 7.5 income base amounts | Between 7.5 and 30 |
| --- | ---: | ---: |
| April 2025 | 5.9% | 31.4% |
| April 2026 | 6.1% | 31.6% |
| April 2027 | 6.3% | 31.8% |
| April 2028 | 6.5% | 32.0% |

For April 2025 through March 2026, the model follows the signed agreement,
FAO’s 2026 booklet and Valcentralen’s detailed terms. Valcentralen’s shorter
overview lists 5.6% for January–March 2026. Earlier model years use the
latest preceding published rates of 5.5% and 31.3% as a historical
approximation. The income base is anchored in 2026. The projection covers
regular pensionable pay and standard employer contributions. Individual
agreements to continue paying after 66, insurance deductions and premium
waivers require information from the provider.

Sources are the [FTP agreement, section B §§ 3–4][ftp],
[FAO’s 2026 guide][ftp1-fao] and [Valcentralen’s detailed FTP 1 terms][ftp1-val].

[ftp1-fao]: https://www.fao.se/globalassets/avtalspension/ftp1_final_2026-01-13.pdf
[ftp1-val]: https://www.valcentralen.se/Valcentralen/Page.aspx?page=114
[ftp]: https://www.fao.se/globalassets/kollektivavtal/ftp-avtalet-2025-2027.pdf

## Build and run

Run `node plugins/pension-agreement-ftp1/build.mjs` to build the ZIP from
the repository root. In Cashle Lab, install it alongside the occupational
pension types and the [shared agreement rules](../pension-agreement-rules/README.md).

The [CLI example](doc/direct-model.cashle) generates a balance-sheet report.
With `cli_dir` set to the absolute path of the installed Cashle CLI distribution,
run the following from the plugins repository root.

```sh
plugins_dir="$PWD/plugins"
example_dir="$(mktemp -d)"
agreement_dir="$plugins_dir/pension-agreement-ftp1"
common_dir="$plugins_dir/swedish-pension-rules"
class_path="$cli_dir/lib/*"

java -cp "$class_path" dev.cashle.cli.CompilePluginSource \
  "$agreement_dir/ftp1.cashle" "$example_dir/ftp1.cashlec" \
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
