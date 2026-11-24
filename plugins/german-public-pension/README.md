# German statutory old-age pension

Add **German statutory old-age pension** in Savings. Enter the gross monthly
EUR amount from Deutsche Rentenversicherung (DRV) for the right already earned
(*bisher erworbene Ansprüche*). The Income row edits the start of the same
pension. The right produces monthly income and has no spendable balance.
[DRV's guide to the pension statement](https://www.deutsche-rentenversicherung.de/SharedDocs/Downloads/DE/Broschueren/national/die_renteninformation_mehr_wissen.pdf?__blob=publicationFile&v=1)

## Eligibility and start

The ordinary *Regelaltersrente* requires a qualifying period of five years.
The model assumes this is satisfied and applies the regular age for the year of
birth. The age rises from 65 for those born before 1947 to 67 for those born
from 1964. Cashle uses the household birth month. Select **Born on the first
day of the month** when applicable so the pension can start in the month the
age threshold is reached. For other birth dates it starts the following month.
[SGB VI §§ 35](https://www.gesetze-im-internet.de/sgb_6/__35.html) and
[235](https://www.gesetze-im-internet.de/sgb_6/__235.html),
[DRV guidance on cohort ages](https://rvrecht.deutsche-rentenversicherung.de/SharedDocs/rvRecht/01_GRA_SGB/06_SGB_VI/pp_0226_250/gra_sgb006_p_0235.html?nn=1503682)

Choose the first eligible month, an age, a date or a case milestone. The model
uses the first eligible month on or after the requested date and assumes a
timely application. An unresolved milestone leaves the claim pending. For a
confirmed early full pension from age 63, enter the earliest eligible month on
the DRV statement. For example, the long-insured route normally requires 35
qualifying years. Use the DRV quote for the intended effective date after any
early reduction or delayed-claim increase. Changing the start can require a
new quote. Special routes below age 63, historical grandfathering, partial
pensions, future accrual, and the recalculation of awards and adjustments are
outside this model.
[SGB VI §§ 36](https://www.gesetze-im-internet.de/sgb_6/__36.html),
[50](https://www.gesetze-im-internet.de/sgb_6/__50.html),
[77](https://www.gesetze-im-internet.de/sgb_6/__77.html) and
[99](https://www.gesetze-im-internet.de/sgb_6/__99.html),
[DRV pension estimates](https://www.deutsche-rentenversicherung.de/DRV/DE/Experten/Arbeitgeber-und-Steuerberater/summa-summarum/Lexikon/R/rentenauskunft)

## Cash flow and tax

The quote is in the plan's starting purchasing power. Cashle holds it constant
in real terms with the case inflation and exchange rates. It books the pension
at calendar month-end, a forecast approximation of DRV's last bank business
day for modern awards. Payments continue through the month of the recipient's
death. The source reports gross receipts under `germanStatutoryPension`. The
[German tax plugin](../german-tax/README.md) covers annual income tax under its
retiree profile. Cases without tax show gross pension receipts. Enter actual
health and care premiums as separate cash expenses when modeling take-home
income. Other countries require support for the source in their own tax rules.
[SGB VI §§ 102](https://www.gesetze-im-internet.de/sgb_6/__102.html) and
[118](https://www.gesetze-im-internet.de/sgb_6/__118.html)

## Direct model

Run from the plugin directory.

```sh
cashle doc/direct-model.cashle --classpath .
```

A person born in September 1961 requests January 15, 2028. The regular age of
66 years and six months puts the start in April. The plan books EUR 1,650 on
April 30 and May 31.
