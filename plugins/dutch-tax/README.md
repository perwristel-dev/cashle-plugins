# Dutch tax plugin

The plugin provides the Netherlands' 2026 employment tax, national insurance,
provisional Box 3 deemed-return assessment and property-sale treatment.
The residence and property editors include Swedish and English catalogues.
Enter external wealth separately from investment accounts already in the plan.
The [Dutch bank annuity plugin](../dutch-bancaire-lijfrente/README.md) contributes
verified paid premiums and regular bank annuity receipts to Box 1.

Build the installation ZIP with Node.js and `zip` from the repository root.

```sh
node plugins/dutch-tax/build.mjs
```

Install and enable `cashle-tax-nl-source.zip` in Cashle's plugin repository and
reload. The plugin retains the `NL` country code and existing saved input keys.

The [direct model](doc/direct-model.cashle) uses EUR 40,000 in employment income
and no Box 3 wealth in 2026. It accrues EUR 1,748.70 in income tax and
EUR 4,537.18 in national insurance.

```sh
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/dutch-tax/doc/direct-model.cashle --classpath plugins/dutch-tax
```

[Rule provenance](../../docs/tax-germany-netherlands-research.md)

The 2026 Box 1 estimate includes domestic gross pensions, the partial-year
AOW premium, ordinary older-person credit, and the pensioner's 4.85% Zvw
contribution up to the remaining salary-adjusted cap. It estimates the general
and labour credits by reducing their AOW insurance share. It leaves out the
additional single elderly credit, individual deductions and international
insurance exceptions. Later years hold the 2026 fiscal rates fixed and apply
the published cohort ages or SVB's projections where the age is pending.
[Belastingdienst Box 1](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/boxen_en_tarieven/box_1/) ·
[2026 credits](https://www.belastingdienst.nl/wps/wcm/connect/nl/voorlopige-aanslag/content/voorlopige-aanslag-tarieven-en-heffingskortingen) ·
[Zvw](https://www.belastingdienst.nl/wps/wcm/connect/fisin/fisin2026/inkomensafhankelijke_bijdrage_zorgverzekeringswet)
