# Danskt rådighedsbeløb för levnadskostnader

Utgiftsreferensen bygger på Gældsstyrelsens 2026-belopp för bedömning
av betalningsförmåga vid offentlig skuld. Den använder 7 880 DKK per månad
för en vuxen och 13 360 DKK för ett par. Barn har belopp för åldrarna 0–1,
2–6 och 7–17 år. Halvtidsboende räknas med halvt belopp i prognosen.
Beloppen räknas om med planens inflation från januari 2026.

Referensen avser disponibelt belopp för löpande konsumtion. Separat bedömda
utgifter som boende, arbetsresor och barnomsorg läggs till som egna poster.
Prognosen beräknar varken betalningsförmåga eller individuell skuldreglering.
[Gældsstyrelsens satser för 2026](https://info.skat.dk/data.aspx?oid=2460007) ·
[§§ 19, 21 och 26](https://www.retsinformation.dk/eli/lta/2024/1110)

[Direktmodell](doc/direct-model.cashle)

```sh
cashle plugins/danish-living-cost-benchmark/doc/direct-model.cashle --classpath plugins/danish-living-cost-benchmark
```
