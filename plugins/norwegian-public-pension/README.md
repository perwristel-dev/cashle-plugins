# Folketrygdens alderspensjon

Välj **Norsk allmän ålderspension** under Sparande. Ange ett saldo från NAV
vid planstarten och vid behov en uppskattad årsinkomst fram till uttaget.
Pensionsbehållningen är en bunden pensionsrätt och ingår inte i nettoförmögenhet
eller arv. För äldre årskullar, pågående utbetalningar eller särskilda förmåner
kan du i stället ange NAV:s bruttobelopp per månad vid fullt uttag.

Samma pension visas under Inkomster. Välj start utifrån ålder, datum,
pensionering eller en milstolpe. Prognosen använder den första möjliga
kalendermånaden på eller efter önskad start och bokför vid månadens slut.
Uttagsgraderna är 20, 40, 50, 60, 80 och 100 procent. Pensionen betalas
livsvarigt med vald grad. För tidigt uttag kan du ange ett startdatum som NAV
bekräftat för vald uttagsgrad. Utan sådant besked tillåts uttag före 67 endast
när de beräknade inkomstpensionsrättigheterna ensamma klarar den höga
garantinivån. En otillåten start skjuts fram.

Prognosen använder 18,1 procent av årsinkomsten upp till 7,1 genomsnittliga G
med 2026 års värde som bas. Den tjänar in detta månadsvis fram till första
uttag, längst till och med året personen fyller 75. NAV:s månatliga delingstal
för 1963–2040 finns i ZIP-paketet och läses lokalt. För yngre årskullar används
2040 års rad som prognosantagande. Efter 75 används delingstalet vid 75. För
garantipension används angiven trygdetid och vald 2026-sats samt avräkning med
80 procent av inkomstpensionsrättigheterna. Prognosen antar att värdena följer
planens inflation. Framtida regeländringar, rättigheter från AFP, tid enligt utländska
socialförsäkringsavtal eller pension under utbetalning med senare ändrad uttagsgrad räknas
utanför den förenklade modellen. Använd kontrollerat underlag från NAV i de
fallen.

Norska bruttobelopp klassificeras som pension i den valda skattemodellen.
Cashles NO-skatt stöder den ordinarie skatten och trygdeavgiften på pension.
Det särskilda skatteavdraget för pension kan sänka den verkliga skatten.

## Direktmodell

Bygg först källarkivet med NAV-tabellen från pluginets katalog. Sätt
`CASHLE_CLASSPATH` till din Cashle-distributions `lib/*`.

```sh
java -cp "$CASHLE_CLASSPATH" dev.cashle.cli.CompilePluginSource \
  norwegian-public-pension.cashle norwegian-public-pension.cashlec \
  --resource dev/cashle/pension/no/delingstall.tsv dev/cashle/pension/no/delingstall.tsv \
  --resource dev/cashle/pension/no/messages_en.properties dev/cashle/pension/no/messages_en.properties \
  --resource dev/cashle/pension/no/messages_sv.properties dev/cashle/pension/no/messages_sv.properties
cashle doc/direct-model.cashle
```

[Ålderspension och garantipension hos NAV](https://www.nav.no/alderspensjon) ·
[NAV:s delingstal](https://www.nav.no/levealdersjustering/nn) ·
[Grunnbeløpet](https://www.nav.no/grunnbelopet) ·
[Folketrygdloven kapitel 20](https://lovdata.no/nav/folketrygdloven/kap20) ·
[Remissen om framtida uttagsåldrar](https://www.regjeringen.no/no/dokumenter/horing-endringer-i-folketrygdloven-sosialtjenesteloven-og-lov-om-supplerende-stonad-til-personer-med-kort-botid-samt-noen-tilhorende-forskrifter-normert-pensjonsalder/id3193247/)
