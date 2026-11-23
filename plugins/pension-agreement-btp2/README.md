# BTP 2 occupational pension agreement

BTP 2 is a defined-benefit agreement for the Swedish banking sector. Use
`BTP2` for the defined benefit and the separate defined-contribution scheme
`BTPK` for the supplementary premium.

Standard retirement is at age 65. The full benefit is 10%, 65% and 32.5% of
salary in the bands up to 7.5, 7.5–20 and 20–30 income base amounts. The
retirement benefit is proportional to credited service up to 360 months.
Service counts from the month after age 25 through the month before age 65.
BTPK is 2% of pensionable salary up to 30 income base amounts, rising to
4% for people born in 1967 or later under the fully strengthened schedule from
January 2023. Earlier history uses the baseline rate.

The estimate uses the salary in the model as pensionable salary. The shared
income base is anchored to 2026 and projected using the case assumptions.
Late-career salary limits, phased local premium changes, alternative
pension arrangements, early or deferred retirement adjustments and insurance
coverage are outside this estimate. An opening statement can supply accrued
rights and credited service.

Sources are the [2026 banking agreement, BTP 2 §§ 3–4 and 7–10][bank],
[SPK’s retirement benefit guide][spk] and [Valcentralen’s BTPK guide][btpk].

[spk]: https://www.spk.se/arbetsgivare/tjanstepension-hos-spk/btp/alderspension/
[btpk]: https://www.valcentralen.se/Valcentralen/Page.aspx?page=139
[bank]: https://www.finansforbundet.se/globalassets/material---bestall-hem/produkter/pensionsavtal-finansarbetsgivarna-finansforbundet-2026-01-01.pdf

## Build and run

Run `node plugins/pension-agreement-btp2/build.mjs` to build the ZIP from
the repository root. In Cashle Lab, install it alongside the occupational
pension types and the [shared agreement rules](../pension-agreement-rules/README.md).

The [CLI example](doc/direct-model.cashle) generates a balance-sheet report.
With `cli_dir` set to the absolute path of the installed Cashle CLI distribution,
run the following from the plugins repository root.

```sh
plugins_dir="$PWD/plugins"
example_dir="$(mktemp -d)"
agreement_dir="$plugins_dir/pension-agreement-btp2"
common_dir="$plugins_dir/swedish-pension-rules"
class_path="$cli_dir/lib/*"

java -cp "$class_path" dev.cashle.cli.CompilePluginSource \
  "$agreement_dir/btp2.cashle" "$example_dir/btp2.cashlec" \
  "$plugins_dir/pension-agreement-rules/SwedishAgreementRules.groovy"

for kind in dc db; do
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
