# Spanish annual property tax (IBI)

Link the expense to a dwelling in the plan. Enter the household’s annual
amount from the municipal IBI notice, including reductions already applied,
and the date for payment in one instalment. For co-ownership, enter the
amount chargeable to the household on the notice or agreed division. One
entry per dwelling covers that household share.

Articles 61, 63 and 75 of the local-finance law specify the taxable real
right, the taxpayer and the first day of the calendar year as the accrual
date. For the ordinary ownership case, a buyer who acquires the dwelling
after 1 January first owes IBI the following year. A seller who held it on
1 January still owes that year’s municipal charge if the sale precedes the
payment date. In the first plan year, confirm who owed the tax on 1 January
when the plan starts later and the dwelling has no historical acquisition date.

For later years the forecast repeats the notice’s payment month and day and
applies plan inflation to the reference amount. Use the bill of the actual
taxpayer when a preferential real right, such as an usufruct, determines
liability. The module covers the municipal charge in one instalment. Private
reimbursements between seller and buyer, other municipal charges, and
installment or cadastral-value calculations need separate inputs.

Run the [direct model](doc/direct-model.cashle) with
`cashle plugins/spanish-ibi/doc/direct-model.cashle --classpath plugins/spanish-ibi`.

- [Consolidated Spanish local-finance law, articles 61, 63 and 75](https://www.boe.es/buscar/act.php?id=BOE-A-2004-4214)
- [Madrid tax authority on 1 January liability and billing](https://agenciatributaria.madrid.es/portales/contribuyente/es/Informacion-y-documentacion/Preguntas-frecuentes-FAQ-/IBI-y-TRUA/Preguntas-frecuentes-sobre-el-Impuesto-sobre-Bienes-Inmuebles-IBI-/?vgnextchannel=b057fbeab0fe3810VgnVCM2000001f4a900aRCRD&vgnextfmt=default&vgnextoid=b3b0d21bb9589410VgnVCM2000000c205a0aRCRD)
