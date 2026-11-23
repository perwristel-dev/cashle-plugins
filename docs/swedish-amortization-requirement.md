# Svenskt amorteringskrav i Cashle

Det svenska källpluginet använder tre allmänna SDK-kontrakt för att fylla i
underlaget från bostaden. Reglerna och översättningarna finns i pluginet.

## Regler för prognosen

Sedan den 1 april 2026 är det lagstadgade årsbeloppet normalt 2 procent vid
belåningsgrad över 70 procent, 1 procent över 50 och upp till 70 procent,
och 0 procent vid högst 50 procent. Belåningsgraden använder aktuell
sammanlagd skuld och det marknadsvärde som används för amorteringskravet.
Årsbeloppet beräknas på den sammanlagda skulden när den varit som högst sedan
den senaste värderingen. Krediter med samma bostad som säkerhet räknas
tillsammans även när de tillhör olika personer eller kreditgivare.
[Lag (2026:226), 2, 7 och 13 §§](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-2026226-om-begransning-av-bostadskrediter_sfs-2026-226/)
[Prop. 2025/26:119, kommentar till 7 §](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/proposition/utveckling-av-makrotillsynsomradet_hd03119/html/)

Vid förvärv används marknadsvärdet då. Femårsperioden räknas från förvärvet
eller den senaste omvärdering som ändrade amorteringsbeloppet eller
låneutrymmet. Lagen medger en tidigare omvärdering vid en avsevärd
värdeförändring av andra skäl än den allmänna prisutvecklingen. En framtida
omvärdering som använder prognosens bostadsvärde är ett antagande om att
kreditgivaren tillämpar värdet. Ett manuellt värde behöver datumet då det
började gälla. Det ersätts av nästa tillämpliga omvärdering.
[Lag (2026:226), 13 §](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-2026226-om-begransning-av-bostadskrediter_sfs-2026-226/)
[Prop. 2025/26:119, kommentar till 13 §](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/proposition/utveckling-av-makrotillsynsomradet_hd03119/html/)

Ett manuellt skuldunderlag är ett ingående högsta samlat kreditbelopp för
värderingsperioden. Om de samlade krediterna senare når ett högre belopp
uppdateras högstanivån. När en ny värdering blir underlag börjar en ny
värderingsperiod. Om skuldunderlaget är tomt kan prognosen använda högstanivån
i den kända kredithistoriken. Finns bara saldon vid planstart kan deras summa
användas som ett uttalat startantagande. En manuell skuld får därför ingen egen
femårig giltighetstid. Med automatisk sänkning aktiverad får prognosen sänka
betalningen när belåningsgraden passerar en gräns genom amortering, även
mellan omvärderingar. Kreditgivarens betalningsvillkor kan vara högre än
lagens miniminivå.
[Prop. 2025/26:119, kommentar till 7 och 13 §§](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/proposition/utveckling-av-makrotillsynsomradet_hd03119/html/)

## Publika kontrakt och underlag

1. **Bostadens säkerheter och krediter.** `FinanceContext.findCollateralAsset`
   ger tillgångens typ, ägarstatus och kredit-ID:n. Varje kredits tillgänglighet
   och kapital läses genom `FinanceContext.findRepayableDebt`. I redigeraren
   läser `relationTargetIds` säkerhetsrelationen från den aktuella
   modulversionen. `hasModuleCapability` identifierar moduler som publicerar
   bostadskapaciteten. En amorteringsplan kan visas under varje kopplat lån
   och hör fortfarande till bostaden om ett av lånen tas bort.
   [Kontot för amorterbar skuld](https://github.com/perwristel-dev/cashle/blob/main/plugins/cashle-finance/sdk/cashle-finance-sdk/src/main/java/dev/cashle/sdk/finance/RepayableDebt.java)
   [Bostadens interna lånelänk](https://github.com/perwristel-dev/cashle/blob/main/plugins/cashle-finance-assets/src/main/java/dev/cashle/finance/assets/AssetModule.java)
2. **Marknadsvärden på en bestämd dag.** `CollateralAsset` ger förvärvsdatum
   när det är känt och nominellt marknadsvärde för den begärda dagen inom
   planen. Pluginet kan läsa förvärvsvärdet när bostaden köps i planen. För
   en bostad som redan ägs används planens första kända värde tills det finns
   ett angivet bankunderlag eller en ny prognosvärdering blir tillämplig.
   [AssetLifecycle](https://github.com/perwristel-dev/cashle/blob/main/plugins/cashle-finance/sdk/cashle-finance-sdk/src/main/java/dev/cashle/sdk/finance/AssetLifecycle.java)
3. **Kreditbelopp vid värdering och förändringar.** Med
   `ModelBuilder.beforeBalanceChange` uppdaterar pluginet det samlade
   kapitalet när ett berört konto faktiskt bokförs. Beräkningen sparar
   högstanivån i simuleringsvariabler som återställs vid omspelning. Ett
   historiskt kreditbelopp kan anges som öppningsfakta. Äldre krediter och
   undantag från huvudregeln behöver också uppgifter som ursprungligt
   kreditdatum och kreditgivarens beslut.
   [FinanceContext](https://github.com/perwristel-dev/cashle/blob/main/plugins/cashle-finance/sdk/cashle-finance-sdk/src/main/java/dev/cashle/sdk/finance/FinanceContext.java)
   [Lag (2026:226), 8–14 §§ och övergångsbestämmelser](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-2026226-om-begransning-av-bostadskrediter_sfs-2026-226/)

Pluginet beräknar minimibeloppet vid månadsbetalningarna och använder SDK:ts
finansiering per lån för att fördela det. Bostadsuppgifter och
saldoförändringar kan även användas av andra moduler.
