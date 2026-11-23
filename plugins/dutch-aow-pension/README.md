# AOW – nederländsk allmän pension

Ange andelen AOW som SVB bedömer att du har tjänat in vid AOW-åldern och
vilken boendesituation SVB använder. Varje helt försäkringsår ger två procent
av full pension under den 50-åriga intjänandeperioden. Posten visar en pensionsrätt
under Sparande och den livsvariga utbetalningen under Inkomster.
[SVB om intjäning](https://www.svb.nl/nl/aow/wat-is-aow/hoe-gaat-de-opbouw-van-de-aow) ·
[SVB om boendesituation](https://www.svb.nl/en/aow-pension/living-situations/which-aow-pension-rate-applies-in-your-situation)

AOW börjar på den lagstadgade dagen. Inkomstvyn kan använda det exakta datum
som SVB meddelat. Utan det datumet bokförs ett fullt månadsbelopp vid slutet
av månaden då personen når AOW-åldern. Födda från oktober 1965 använder SVB:s
åldersprognos och födda efter 2000 använder det sista prognosvärdet. Den som
redan fått AOW enligt äldre åldersregler kan ange sitt verkliga startdatum.
[SVB:s kohortåldrar](https://www.svb.nl/en/aow-pension/aow-pension-age/your-aow-pension-age) ·
[SVB om start och betalning](https://www.svb.nl/en/aow-pension/payment-of-aow-pension)

Prognosen använder bruttobeloppen från juli 2026 och planens inflation.
Den använder kalenderdagar för en ofullständig första månad när exakt start
anges. Intjänat semestertillägg för maj–april bokförs i maj. Prognosen lägger
inga separata slutbetalningar efter död och innehåller inte det behovsprövade
AIO-tillägget. Nederländsk skatt bedömer pensionen som Box 1-inkomst.
[SVB:s bruttobelopp](https://www.svb.nl/en/aow-pension/aow-pension-rates/aow-pension-rates) ·
[SVB:s semestertillägg](https://svb.nl/en/aow-pension/aow-pension-rates/veelgestelde-vragen-vakantiegeld)

Kör den [direkta modellen](doc/direct-model.cashle) från katalogens rot.

```sh
cashle plugins/dutch-aow-pension/doc/direct-model.cashle --classpath plugins/dutch-aow-pension
```
