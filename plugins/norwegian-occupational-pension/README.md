# Norwegian occupational pension (OTP)

Add **Norwegian occupational pension (OTP)** under Savings. Enter the
capital shown on the provider statement and, if contributions will continue,
the annual pensionable pay covered by that employer. The minimum contribution
is 2% of pay from the first krone up to 12 times the National Insurance base
amount (G). Use the employer's actual base rate up to 7% and, if offered, a
supplementary rate up to 18.1% on the portion between 7.1 G and 12 G.

The account appears as restricted pension capital. It is included in net
worth and the plan cannot spend it before withdrawal. The model projects
monthly contributions on regular pay before withdrawals begin. It uses
NOK 136,549 for G from May 2026 and NOK 130,160 for earlier dates as the
baseline. Projected salary and G follow the case's inflation assumption.
The entered annual return is nominal after fees and applies to the balance
during both accumulation and payments.

The same record appears under Income. Choose withdrawal at an age, on a date,
at retirement or at a milestone. The model starts payments at month-end, no
earlier than the month the owner turns 62, and assumes automatic withdrawal
in the month the owner turns 75. The ordinary term runs for at least 120 months
and through the date the owner turns 77. For a small balance, the optional
shorter term estimates the nearest whole-year term, with a one-year minimum,
aiming for about 20% of G per year. Payments divide the remaining balance
over the remaining months.

The forecast assumes one account and full withdrawal, with no new employer
contributions after withdrawal starts. Use the employer's actual pensionable
pay. The forecast excludes scheme enrollment checks, individual agreements
to defer after 75, partial or lifetime withdrawals, and survivor payments.
Pension income uses Cashle's Norwegian `pension` tax basis. Use the Norwegian
tax package with support for that basis. The separate pension tax credit is
outside the model.

## Run the example

Build the plugin ZIP with
`node plugins/norwegian-occupational-pension/build.mjs` from the repository root.
To run [the CLI model](doc/direct-model.cashle), set `cli_dir` to the absolute
Cashle CLI installation directory and run these commands from this package.

```sh
message_path=dev/cashle/pension/no/occupational/messages
java -cp "$cli_dir/lib/*" dev.cashle.cli.CompilePluginSource \
  norwegian-occupational-pension.cashle norwegian-occupational-pension.cashlec \
  --resource "${message_path}_en.properties" "${message_path}_en.properties" \
  --resource "${message_path}_sv.properties" "${message_path}_sv.properties" \
  --resource "${message_path}_nb.properties" "${message_path}_nb.properties"
"$cli_dir/bin/cashle" doc/direct-model.cashle
```

[OTP law § 4](https://lovdata.no/dokument/NL/lov/2005-12-21-124) ·
[Innskuddspensjonsloven §§ 7-1 to 7-4 and 7-7](https://lovdata.no/nav/lov/2000-11-24-81/kap7) ·
[Employer contribution limits, § 3-2](https://lovdata.no/dokument/SF/forskrift/2000-12-22-1413) ·
[Skatteetaten's OTP guide](https://www.skatteetaten.no/person/skatt/hjelp-til-riktig-skatt/arbeid-trygd-og-pensjon/otp---obligatorisk-tjenestepensjon---nar-du-er-ansatt/) ·
[NAV's base amount history](https://www.nav.no/grunnbelopet)
