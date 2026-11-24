# Jubilación – spansk allmän ålderspension

Ange det ordinarie bruttobeloppet per utbetalning från INSS och beräknade hela
avgiftsmånader vid uttag. Ange pensionsrätt och utbetalning i samma post under Inkomster. En standardpension kräver minst 15 års avgifter
varav två under de sista 15 åren. Ett bekräftat datum från INSS kan användas
vid individuella villkor. Ange ett besked som motsvarar det valda uttaget.
[Seguridad Social om villkoren](https://prestaciones.seg-social.es/servicio/pension-jubilacion.html?categoria=jubilacion)

Uttaget kan anges med ålder, datum eller milstolpe och justeras till tidigaste
tillåtna datum. År 2026 får den som har minst 38 år och tre månaders avgifter
börja vid 65. Annars gäller 66 år och tio månader. Från 2027 är gränserna
38 år och sex månader, respektive 67 års ålder vid kortare avgiftstid.
Födelsedagen antas vara månadens första dag när startdatum beräknas från ålder.
[Seguridad Social om åldersgränser](https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10963/28393/28396/28472?changeLanguage=es)

Modellen bokför ordinarie pension vid månadsslut och extra utbetalningar i juni
och november, inklusive sextedelar första året. Hela avgifts- och beloppshistoriken
hämtas från beskedet. Prognosen använder planens inflation och lämnar slutavräkning
vid död, arbete tillsammans med pension och individens tidig- eller senuttagsfaktorer
utanför prognosen. Utbetalningar klassificeras som pension för spansk IRPF.
[Seguridad Social om utbetalningar](https://www.seg-social.es/wps/portal/wss/internet/Pensionistas/GestionPago/33468)

[Direktmodell](doc/direct-model.cashle)

```sh
cashle plugins/spanish-public-pension/doc/direct-model.cashle --classpath plugins/spanish-public-pension
```
