# Dutch property transfer tax

Add **Dutch property transfer tax** under Expenses and link it to a Dutch residential purchase in the plan. Use the notarial transfer date for the linked purchase. The tax expense follows that acquisition and the forecast records it only if the purchase goes through. Enter the notary’s taxable value for the whole property in nominal EUR. It normally reflects market value at transfer and includes relevant appurtenances. [Belastingdienst payment timing](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/woning/overdrachtsbelasting/hoe_betaalt_u_overdrachtsbelasting/hoe_betaalt_u_overdrachtsbelasting) · [Taxable value](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/woning/overdrachtsbelasting/over_welk_bedrag_betaalt_u_overdrachtsbelasting/u_wordt_eigenaar_van_een_onroerende_zaak)

The 2026 rates are 2% for a home the buyers will occupy long term and 8% for another residential property, such as a second home or rental. When all buyers will occupy the home, enter the combined ownership share of buyers who qualify for the starter exemption. An eligible buyer is at least 18 and younger than 35 at transfer, will occupy the home long term, has never used the exemption and signs the declaration. They may have owned a home before. The EUR 555,000 ceiling applies to the full taxable home value, including applicable appurtenances. At the ceiling or below, the declared qualifying share is exempt and the remaining share is taxed at 2%. [2026 transfer tax rates](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/woning/overdrachtsbelasting/tarieven_overdrachtsbelasting/het_tarief_van_de_overdrachtbelasting) · [Starter exemption eligibility](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/woning/overdrachtsbelasting/startersvrijstelling/startersvrijstelling)

The forecast applies the 2026 rates and nominal ceiling to future purchases. It covers ordinary residential acquisitions with a common use across buyers. Mixed-use buyers, non-residential property, separate economic and legal transfers, new-build VAT cases, rapid resale relief and other special exemptions need their own treatment. The duty is a purchase expense separate from the existing Dutch home sale and annual Box 3 assessment. [Belastingdienst transfer tax overview](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/woning/overdrachtsbelasting/)

## Direct model

```sh
cashle doc/direct-model.cashle --classpath .
```

The purchase of a EUR 400,000 owner-occupied home on 1 August 2026 incurs EUR 8,000 of duty on acquisition.
