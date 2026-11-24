# Dutch bank retirement annuity

Add **Dutch bank retirement annuity** in Investments in a Dutch tax plan. Enter the existing balance, net growth and the verified yearly contribution room available to this policy after allocating room to any policies elsewhere. Add contributions through Cashle’s usual account transfers or savings allocation. The provider uses actual funded deposits up to the declared room for the Box 1 deduction. The forecast applies the same declared nominal room each year and covers one modeled qualifying account per person. Verify jaarruimte or reserveringsruimte with the Belastingdienst calculator. [Contribution deduction and available room](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/werk_en_inkomen/lijfrente/aftrekken-lijfrentepremies/)

The account balance is restricted and stays outside the modeled Box 3 wealth. A policy whose contributions were fully deductible has its ordinary benefits included in Box 1. The Dutch tax provider also includes applicable Zvw on those receipts. The forecast excludes provider payroll withholding and assesses the gross amounts with the annual Dutch tax settings. [Box 3, section 13.3.7](https://www.belastingdienst.nl/wps/wcm/connect/fisin/fisin2026/bezittingen_en_schulden_box_3_) · [Taxable benefits](https://www.belastingdienst.nl/wps/wcm/connect/fisin/fisin2026/loon_pensioen_uitkeringen_en_afkoopsommen) · [Zvw](https://www.belastingdienst.nl/wps/wcm/connect/fisin/fisin2026/inkomensafhankelijke_bijdrage_zorgverzekeringswet)

For a standard bank oudedagslijfrente, enter the bank’s gross monthly amount, first-of-month date, term of at least 20 years and the verified calendar year in which you reach AOW age. The forecast supports starting in that year or within the next five years. Add **Dutch bank annuity payments** under Income and link it to the account. The linked entry pays the agreed amount from the bank balance and stops at the contractual end or life milestone. Cashle records internal capital movements as withdrawals. Leave the date blank for accumulation only. [Official contract and timing requirements](https://www.belastingdienst.nl/wps/wcm/connect/fisin/fisin2026/uitgaven_voor_inkomensvoorzieningen)

Use a sufficiently funded bank quote and an appropriate net return. The model keeps any projected residual balance restricted. It covers fully deductible contributions and a nonnegative Box 1 balance. Early commutation, short temporary annuities, non-deducted premiums, death benefits, loss carry and nonresident treatment require separate rules.

## Direct model

```sh
cashle doc/direct-model.cashle --classpath .:../dutch-tax
```

The example deducts EUR 3,000 in paid premiums and assesses six EUR 1,000 installments in 2026. Annual taxable Box 1 income is EUR 43,000 on EUR 40,000 salary. The modeled income tax, national insurance and Zvw total EUR 4,057.74.
