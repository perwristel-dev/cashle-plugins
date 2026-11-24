# German residential property tax (Grundsteuer B)

Add **German residential property tax (Grundsteuer B)** in Expenses. Enter the
tax office’s *Steuermessbetrag* and the municipality’s *Hebesatz* for the home
as stated in the post-reform notices. For example, a EUR 96 assessment amount
and a 415% multiplier produce EUR 398.40 of annual property tax. The entered
*Steuermessbetrag* already incorporates the property's valuation and tax
coefficient under the applicable federal or state model.
[Finance Ministry guidance on the Grundsteuer reform](https://www.bundesfinanzministerium.de/Content/DE/FAQ/faq-die-neue-grundsteuer.html)

The default federal calendar charges four installments on February 15, May
15, August 15 and November 15. Select the July 1 annual payment or a reduced
number of installments when the municipality has applied that arrangement.
The small-bill options follow the federal rules of up to EUR 15 in August or
up to EUR 30 in February and August. The forecast allocates any cent-rounding
remainder to the final installment. It uses the statutory calendar dates
without weekend and holiday shifts.
[GrStG §§ 25](https://www.gesetze-im-internet.de/grstg_1973/__25.html) and
[28](https://www.gesetze-im-internet.de/grstg_1973/__28.html)

Enter the first and, if known, last year for which you owe the municipal
assessment. The public liability is determined at the start of the calendar
year. This calendar keeps the billed amount payable through the last entered
year. It holds the assessed amount and multiplier fixed in nominal EUR and
uses the case exchange rate. Enter a separate, nonoverlapping line if a later
bill changes. Private settlement between buyer and seller, notice arrears
and one-off adjustments, local departures from the modeled dates and
real-estate transfer tax are outside this calculation.
[GrStG §§ 9](https://www.gesetze-im-internet.de/grstg_1973/__9.html) and
[27](https://www.gesetze-im-internet.de/grstg_1973/__27.html),
[Finance Ministry overview](https://www.bundesfinanzministerium.de/Content/DE/Downloads/Broschueren_Bestellservice/steuern-von-a-z.pdf?__blob=publicationFile&v=8)

## Direct model

```sh
cashle doc/direct-model.cashle --classpath .
```

The 2026 plan pays four EUR 99.60 installments from the general household budget.
