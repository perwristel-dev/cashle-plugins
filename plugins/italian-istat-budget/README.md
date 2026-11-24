# ISTAT absolute-poverty minimum basket

Add this expense when you want to plan against the Italian absolute-poverty
threshold. It measures the monthly cost of goods and services considered
essential for the selected household. Use the whole basket as a single
expense because it includes housing, food and other essentials. The data set
contains the total threshold, so the model cannot remove specific costs such as
housing. An observed average or a personally comfortable budget will use other
amounts.

Select a region, municipality type and exact household age composition. This
plugin uses the 50 most common compositions published by ISTAT for 2025.
Choose the municipality type as ISTAT defines it. A large municipality includes
suburbs of a metropolitan area as well as municipalities over 50,000 inhabitants.
The municipality choices are the valid types for the selected region. Use the
official calculator for household compositions outside the published list.

The selected composition stays fixed until you change the expense for a later
scenario. The forecast applies case inflation from the midpoint of 2025 and
converts euros to the case currency. It stops applying the Italian benchmark
while the plan indicates that the household is outside Italy.

## Data and direct model

The bundled table is a subset of the official 2025 dataflow
`IT1:34_211_DF_DCCV_SOGLIAPOVA_2(1.0)`. It retains the region, municipality
size, household type and positive observation value from the CSV download.
Blank observations are unavailable region/municipality pairs. Household
descriptions follow the official `CL_TIPOLOGIA_FAMILIARE2` codelist. The bundle
contains 2,450 nonblank values across 20 regions. ISTAT publishes the data
under Creative Commons Attribution 4.0. [ISTAT open data terms](https://www.istat.it/dati/open-data/)
[ISTAT 2025 release](https://www.istat.it/comunicato-stampa/la-poverta-in-italia-anno-2025/) ·
[ISTAT calculator](https://www.istat.it/dati/calcolatori/soglia-di-poverta/) ·
[Official 2025 SDMX data](https://esploradati.istat.it/SDMXWS/rest/data/IT1,34_211_DF_DCCV_SOGLIAPOVA_2,1.0/all?startPeriod=2025&endPeriod=2025) ·
[Household codelist](https://esploradati.istat.it/SDMXWS/rest/codelist/IT1/CL_TIPOLOGIA_FAMILIARE2/1.0)

The [direct example](doc/direct-model.cashle) uses one adult aged 30–59 in a
Lombardy metropolitan centre. It projects €1,256.37 a month with inflation
disabled.

```sh
cashle plugins/italian-istat-budget/doc/direct-model.cashle --classpath plugins/italian-istat-budget
```
