# Fondo Cometa supplementary pension

Fondo Cometa serves workers in the private metalworking and plant-installation
sector. Use the fund statement or insurer’s quote for the projected individual
position and the lifetime monthly annuity. Enter the date the member first
began continuous qualifying supplementary pension membership and the confirmed
date the mandatory pension requirements are met. The forecast starts no earlier
than both of those requirements, including five years of participation. In
Income, select an age, date, retirement or another milestone. The forecast
rounds the resulting payment date up to the first day of the month.

The ordinary lifetime annuity can include a single capital payment of up to
50% of the projected final position. Enter the gross amount for the cap check
and the net amount expected at payment. In that case, use the insurer’s
monthly quote for the remaining annuity. The case forecasts the net quoted
payments in plan-year EUR and indexes them with the plan. For ordinary
Italian tax residence, use quotes after the fund or insurer’s definitive tax
withholding. The statutory final tax on the applicable portion of ordinary
post-2006 benefits ranges from 15% to 9% depending on membership. Use a separate tax assessment for mixed-period benefits that remain subject to ordinary IRPEF.

The Savings view shows the projected statement position for the claim.
Cashle adds the net payments to wealth when they arrive. Future contributions,
fund growth and changes to the annuity tariff need a refreshed quote.
This model covers the ordinary individual lifetime annuity and the optional
one-time partial capital payment. Full capital exceptions, RITA and survivor
options require separate treatment. The July 2026 fixed-duration annuity and
flexible withdrawals, and the capital paid in instalments from 31 October
2026, are separate Cometa products.

Run the [direct model](doc/direct-model.cashle) with
`cashle plugins/italian-cometa-pension/doc/direct-model.cashle --classpath plugins/italian-cometa-pension`.

- [Fondo Cometa eligible members and contributions](https://www.cometafondo.it/prestazioni-contribuzione/tfr/)
- [Fondo Cometa eligibility and payout FAQ](https://www.cometafondo.it/faq/prestazioni-pensionistiche/)
- [Fondo Cometa tax treatment and lifetime annuities](https://www.cometafondo.it/prestazioni-rendita/faq/)
- [Legislative Decree 252/2005, Art. 11](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.articolo.numero=11&atto.codiceRedazionale=005G0278&atto.dataPubblicazioneGazzetta=2005-12-13)
- [COVIP's current eligibility and payout choices](https://www.covip.it/node/22048)
- [Fondo Cometa notice effective 31 October 2026](https://www.cometafondo.it/comunicazioni/entrata-in-vigore-prestazione-pensionistica-in-forma-di-erogazione-frazionata/)
