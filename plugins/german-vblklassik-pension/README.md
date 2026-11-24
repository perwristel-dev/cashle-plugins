# German public-sector occupational pension (VBLklassik)

Add **German public-sector occupational pension (VBLklassik)** in Income.
Enter the gross monthly EUR amount quoted in the VBL pension information or
award for the intended start. Set the payment start in the same record.
The entitlement produces lifetime income and has no spendable balance.
[VBL pension information](https://www.vbl.de/de/-/allgemeine-fragen-zur-renteninformation-vblklassik)

VBLklassik is the compulsory supplementary scheme for eligible employees of
participating public-sector employers. The normal qualifying period is 60
months. Vested rights and some special situations qualify under other rules.
The settlement amount typically comes from pension points multiplied by
EUR 4, with a possible reduction for early retirement of 0.3% per month up to
10.8%. Cashle uses the quoted right for an eligible person and takes any
reduction from the quote. New contributions, VBLextra, other supplementary
funds, disability, survivors, commuted small benefits and substitute evidence
for people outside statutory pension insurance are outside the model.
[VBLklassik customer information](https://www.vbl.de/documents/d/vbl/kundeninformation_vblklassik?download=true)

## Claim and payments

Enter the first qualifying month of the full DRV old-age pension (*Vollrente*).
The default start uses this month. For forecasts, choose an age, a date or a
case milestone to model a change to the start of the full DRV pension. A
request before eligibility moves to the entered full pension month. Other
dates round forward to the first of a month, and an unresolved milestone
leaves the claim pending. Keep both pension starts and the VBL quote aligned
when changing the scenario. The model assumes the necessary claims are filed.
[VBL rules on the insurance event and waiting period](https://www.vbl.de/de/leistungen1)

Cashle books the gross monthly payment on the first of each active month,
including the month of death. The quote is an amount in the plan's starting
purchasing power. For a future start, the first payment is converted to
nominal EUR using case inflation. For an award already in payment, enter its
current amount at the plan start. From that nominal baseline the model
applies VBL's 1% uplift each subsequent July 1. Bank holiday adjustments and
arrears are outside the forecast.
[VBL statute §§ 39, 42 and 47](https://www.vbl.de/documents/20142/119789/VBL-Satzung_34-Aenderung.pdf/d28b16cf-fbef-799d-7df7-5e5305f23800?download=true)

## Tax and premiums

The source emits gross `germanVblPension` income. Germany's retiree tax profile
assesses the taxable share entered from the provider's tax statement. The taxable
share depends on the funding history. Cases without tax retain the gross
receipts. Enter health and care premiums separately for a net cash forecast.
The annual tax assessment supports German residence through the German tax
package with retiree support.
[VBL tax and insurance guidance](https://www.vbl.de/en/vblklassik1)

## Direct model

Run from the plugin directory.

```sh
cashle doc/direct-model.cashle --classpath .
```

A request for February 15 moves to April 1, the first qualifying month for the
full DRV pension. The plan books EUR 420 each month through June and EUR 424.20
on July 1.
