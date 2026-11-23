# GTP occupational pension agreement

Gemensam tjänstepension (GTP) is the Fremia–LO defined-contribution pension
for workers in cooperatives and popular movements. Select **GTP (Fremia–LO)**
in a Swedish defined-contribution pension when GTP is the applicable agreement.
The saved scheme ID is `GTP` and the provider ID is
`cashle.pension.agreement.GTP`.

The ordinary monthly employer premium is 4.5% up to 7.5 income base amounts
per year divided by 12, and 30% on pay above that threshold. Cashle credits
98.8% of the gross premium after Pensionsvalet's 1.2% administration fee.
With SEK 60,000 in pensionable monthly pay and the 2026 threshold of SEK
52,125 per month, that credits SEK 4,651.63 before insurer charges.
[Pensionsvalet’s GTP rules and fee](https://www.pensionsvalet.se/privatperson/avtal/gtp/)

Ordinary accrual starts in the month of the 22nd birthday from 2023.
Historical estimates apply the published entry ages of 25 through 2020,
24 in 2021 and 23 in 2022, starting with GTP in 2011. The shared income-base
assumption projects the 2026 base across forecast and estimated history.
[2021–2023 phase-in from Avtalat](https://www.ptk.se/wp-content/uploads/2021/03/avtalat-handbok-kollektivavtalad-tjanstepension-forsakring-2021-1.pdf)
[Earlier reporting rules from Pensionsvalet](https://www.pensionsvalet.se/globalassets/PVExtranat/InrapporteringKFO/handledning-for-inrapportering.pdf)
[GTP and earlier pensions from Folksam](https://www.folksam.se/sparande/tjanstepension/kooperativa-tjanstepensioner/gtp)

The forecast ends ordinary accrual before the month of the 65th birthday
and leaves earlier or continued contributions by arrangement, industry
supplements, insurer fees, risk cover and legacy KAP/STPK benefits outside
the formula. The editor offers withdrawal from age 55 and uses a five-year
minimum duration for an ordinary temporary withdrawal. Use a pension
statement for accumulated past capital.
[Fremia–LO agreement §§ 4–7](https://www.pensionsvalet.se/globalassets/pdf/produktblad-andra-bolag/avtalsforsakringar-fremia-lo-202301017.pdf)
[Pensionsvalet withdrawal information](https://www.pensionsvalet.se/privatperson/avtal/gtp/anmal/)

Build the source bundle from the repository root with
`node plugins/pension-agreement-gtp/build.mjs`. Install it alongside the
[Swedish DC pension type](../swedish-dc-pension/README.md) and
[shared agreement library](../pension-agreement-rules/README.md).
The [direct CLI model](doc/direct-model.cashle) uses those providers.
