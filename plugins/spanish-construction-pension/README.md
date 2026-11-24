# PPESC – tjänstepension för den spanska byggsektorn

Ange kontots aktuella kapital, månatlig avgift enligt arbetsgivarens eller
förvaltarens besked och eventuell förväntad nettoavkastning. Avgiften enligt
byggavtalet kan bero på provins, anställningskategori och avtalad lön.
I prognosen krediteras den angivna avgiften vid månadsslut före första uttaget.
Beloppet dras inte från hushållets lön och prognosen räknar inte om lokala
avgiftstabeller. [Avtalet och planreglerna](https://www.boe.es/buscar/doc.php?id=BOE-A-2023-19903) ·
[Uppdaterade avgiftsregler](https://boe.es/buscar/doc.php?id=BOE-A-2025-25234&lang=es)

Ange först datumet då pensionsuttag får börja enligt planförvaltaren och INSS.
Uttaget kan sedan styras med ålder, datum eller milstolpe. En för tidig begäran
flyttas fram. Under Inkomster kan du välja engångsbelopp eller ett månatligt
uttag om minst två betalningar. Prognosen tar ut kvarvarande kapital delat
med återstående antal betalningar, med eventuell avkastning under tiden.
Kapital och inkomst styrs från samma post. Betalning sker vid månadsslut.
[Planreglerna, artiklarna 34–35](https://www.boe.es/buscar/doc.php?id=BOE-A-2023-19903)

Denna prognos modellerar vanligt pensionsuttag. Kombinerad engångs- och
månadsutbetalning, oregelbundna betalningar, förtida likviditet och efterlevande
följer planens faktiska besked och ingår inte här. Uttag utgör bruttoinkomst
för IRPF, med stöd för pensionsunderlaget i den uppdaterade spanska skatten.

[Direktmodell](doc/direct-model.cashle)

```sh
cashle plugins/spanish-construction-pension/doc/direct-model.cashle --classpath plugins/spanish-construction-pension
```
