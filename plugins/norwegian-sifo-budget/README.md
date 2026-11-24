# SIFO:s referensbudget för Norge

Lägg till kostnadsposten för ett norskt hushåll. Den utgår från ålder och
hushållssammansättning i profilen. Prognosen tar med mat, kläder, hygien,
fritid, hushållsvaror, utrustning, möbler, medier och löpande spädbarnsutrustning.
Oslo Ruters kollektivtrafik kan väljas till. Boende, el, bil, förskola,
skolbarnsomsorg och semester lämnas till separata poster.

Beloppen använder 2026 års kalkylblad från SIFO vid OsloMet, i NOK per månad.
Där källan skiljer på kön använder prognosen medelvärdet för åldersgruppen.
SIFO:s matavdrag för två vuxna med fler än två barn ingår. Det delade
hushållsbeloppet räknar halvtidsboende barn som 0,5 personer och avrundar
storleken uppåt till tabellens nästa storlek, högst sju. Barn räknas från
födelsemånaden fram till 18 år. Planens inflation räknas från
februari 2026. Det är ett referensbelopp för löpande och periodisk konsumtion.
[OsloMet:s referensbudget](https://www.oslomet.no/en/about/sifo/reference-budget/) ·
[Alecu och Ansteensen, SIFO-rapport 9-2026 och kalkylblad, CC BY 4.0](https://hdl.handle.net/11250/5517284) ·
[Licens](https://creativecommons.org/licenses/by/4.0/)

[Direktmodell](doc/direct-model.cashle)

```sh
cashle plugins/norwegian-sifo-budget/doc/direct-model.cashle --classpath plugins/norwegian-sifo-budget
```
