# KTP 1 occupational pension agreement

Select the applicable KTP 1 option in a Swedish defined-contribution pension.
KTP 1 remains in force for covered white-collar employees. Fremia–PTK has
separate ITP 1 coverage. Employer agreements, hiring dates, birth cohorts
and earlier individual elections determine coverage. Use the agreement on
the pension statement.
[Pensionsvalet agreement areas](https://www.pensionsvalet.se/arbetsgivare/avtal/ktp1/)
[Folksam coverage overview](https://www.folksam.se/sparande/tjanstepension/kooperativa-tjanstepensioner)
[PTK on Fremia–PTK](https://www.ptk.se/sakfragor/pension-och-forsakring/tjanstepension-ktp/val-och-villkor-inom-ktp/)

## 2026 ordinary old-age premiums

| Agreement area | Scheme ID | Through 7.5 IBB | Above 7.5 IBB | Ordinary accrual |
| --- | --- | ---: | ---: | --- |
| ABF–Handels, where the insurer’s published 2026 premium applies | `KTP1-ABF-HANDELS` | 6.3% | 31.8% | Month turning 22 through month before 65 |
| AFO–Handels | `KTP1-AFO-HANDELS` | 6.3% | 31.8% | Month turning 22 through month before 67 |
| Fremia–Handels, including its folkrörelse agreement | `KTP1-FREMIA-HANDELS` | 4.5% | 30.0% | Month turning 25 through month before 65 |
| Fremia–Forena/Handels/Akademikerförbunden | `KTP1-FREMIA-FORENA` | 5.7% | 31.3% | Month turning 25 through month before 66 |
| Same area with the published part-time pension premium | `KTP1-FREMIA-FORENA-DELTID` | 6.1% | 31.7% | Month turning 25 through month before 66 |

The rates apply to pensionable pay with monthly thresholds of 7.5
income base amounts (IBB) divided by 12. The Fremia–Forena/Handels/
Akademikerförbunden plan also caps pensionable pay at 30 IBB from 2026,
with the pre-2026 age-65 limit retained for employees already 65 by
1 January 2026. The model assigns its required minimum 50% to the
traditional portion. The complementary portion is selectable with the
insurer. Cashle credits premiums after Pensionsvalet's 1.5% fee.
[Pensionsvalet’s dated 2026 premium table](https://www.pensionsvalet.se/globalassets/pdf/premier-for-ktp-1-2026-1.0.pdf)
[KTP plan §§ 7.1–7.3](https://www.akavia.se/siteassets/03-rad-och-stod/kollektivavtal-privat-sektor/fremia/ktp-folksam-med-flera-2026.pdf)
[Pensionsvalet’s administration fee](https://www.pensionsvalet.se/arbetsgivare/avtal/ktp1/)

Folksam LO Pension identifies the 2026 ABF–Handels rates separately from
older administrator material, which lists a 4.5%/30% premium. Select the
ABF–Handels option for a confirmed match to the 2026 premium shown in the
table. Folksam’s traditional insurance terms give its normal age as 65.
[Folksam LO Pension’s AFO and ABF guidance](https://www.folksamlopension.se/hur-fungerar-tjanstepension/anstalld-inom-kooperationen)
[Folksam’s traditional insurance terms](https://s7g10.scene7.com/is/content/folksam/S11210_1138pdf)
[Pensionsvalet’s earlier ABF–Handels brochure](https://s7g10.scene7.com/is/content/folksam/PV1057_87pdf)

Historical estimates reuse the 2026 premiums and the stated entry ages.
Use a pension statement for actual opening capital. Optional continued
accrual beyond the ordinary age, other individual supplements, insurer
fees and risk cover sit outside the calculation.

Provider IDs use the `cashle.pension.agreement.` prefix followed by the
scheme ID. Build the source bundle with
`node plugins/pension-agreement-ktp1/build.mjs`. Install it alongside the
[Swedish DC pension type](../swedish-dc-pension/README.md) and
[shared agreement library](../pension-agreement-rules/README.md).
The [direct CLI model](doc/direct-model.cashle) uses AFO–Handels.
