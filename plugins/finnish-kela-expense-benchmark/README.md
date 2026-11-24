# FPA:s referens för nödvändiga utgifter

Kostnadsposten använder FPA:s oreducerade grunddel för nödvändiga
vardagsutgifter från mars 2026. Referensen omfattar till exempel mat,
kläder, hygien, lokaltrafik, kommunikation och mindre vårdutgifter.
Boende, el och andra särskilt prövade utgifter anges separat.

Beräkningen använder planen för att välja ensamstående, ensamförälder eller
par. Minderåriga barns belopp beror på ålder och ordning bland syskon.
Halvtidsboende ger halvt belopp. Planens inflation räknas från mars 2026.
Vuxna som bor hos föräldrar och andra särskilda hushåll beräknas utanför den
här modellen. Utgiftsreferensen ger ingen beräkning av bidrag eller villkor.
[FPA:s grunddel](https://www.kela.fi/social-assistance-basic-amount) ·
[FPA:s förteckning över utgifter](https://www.kela.fi/social-assistance-for-what-expenses)

[Direktmodell](doc/direct-model.cashle)

```sh
cashle plugins/finnish-kela-expense-benchmark/doc/direct-model.cashle --classpath plugins/finnish-kela-expense-benchmark
```
