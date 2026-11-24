# Svensk kapitalförsäkring

Ange depåvärde och planerat sparande i en svensk kapitalförsäkring. Uttag
utlöser ingen separat kapitalvinstskatt. Försäkringsbolagets avkastningsskatt
beräknas på ingångsvärdet och hela premier första halvåret samt halva premier
andra halvåret. Ange värdet vid årets början om prognosen börjar senare än
1 januari. Prognosen bokför försäkringsavgiften vid följande års början.
Historiska insättningar utan datum räknas till hälften. Börja prognosen den
1 januari när hela årets premieflöden ska bedömas i detalj.

Swedish tax v3 uses a single owner's tax-free level across the assets in ISK
and insurance. The 2025 amount is SEK 150,000 at a 2.96% standard income rate.
The 2026 amount is SEK 300,000 at 3.55%. Later years hold that estimate in
reference money. To combine KF and ISK use Swedish tax and ISK version 3 or
later. The account assumes Swedish residence and a domestic private policy.
External policies, owners with special tax status and insurer-specific fees
or collection dates are outside this projection.
[Skatteverket om svensk kapitalförsäkring](https://www.skatteverket.se/privat/skatter/forsakringar/svenskakapitalforsakringarochpensionssparanden.4.71004e4c133e23bf6db800024545.html) ·
[2026 års skattebelopp](https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.html)

The [direct model](doc/direct-model.cashle) expects the compiled `cashle.tax.se`
source from the Swedish tax package beside the example. Compile the package's
source and resources specified in its `plugin.json` or supply the installed
bundle on the Cashle classpath.
