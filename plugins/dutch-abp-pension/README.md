# ABP – nederländsk tjänstepension för offentlig sektor och utbildning

Ange det bruttobelopp per månad som MijnABP har beräknat för önskad uttagstid.
Använd prognosen från ABP om beloppet ska omfatta fortsatt intjäning. Ändra
beloppet om uttagsvalet ändras. Ange uppskattad rättighet och utbetalning i samma post under Inkomster.
[ABP:s pensionsbesked](https://www.abp.nl/pensioen-bij-abp/pensioenreglement/pensioen-1-2-3/laag2)

Fyll i verkligt eller prognostiserat AOW-datum från SVB. Välj uttagsstart via
ålder, datum eller en milstolpe. Tjänstepensionen kan börja från första dagen
i månaden personen fyller 60, med sista start fem år efter AOW-datumet.
Prognosen använder närmaste tillåtna datum när ett val hamnar utanför perioden.
Den bokför månadsvis vid månadsslut och beräknar en ofullständig första månad
proportionellt efter kalenderdagar. [ABP:s uttagsregler](https://www.abp.nl/uw-situatie-verandert/met-pensioen-gaan/pensioen-aanvragen)

Modellen avser ordinarie fullt, livsvarigt uttag. ABP:s individuella omräkning,
deluttag, efterlevande, tidsbegränsade höga/låga belopp och engångslösen ingår
utanför den här uppskattningen. Prognosen använder planens inflation och räknar
med bruttopension i Box 1 när nederländsk skatt används. För övergångsår krävs
uppdaterad nederländsk skatt från AOW-PR:n.
[ABP:s pensionsregler 2026 och övergång 2027](https://www.abp.nl/over-abp/het-vernieuwde-pensioenstelsel/met-pensioen-gaan)

Kör den [direkta modellen](doc/direct-model.cashle) från katalogens rot.

```sh
cashle plugins/dutch-abp-pension/doc/direct-model.cashle --classpath plugins/dutch-abp-pension
```
