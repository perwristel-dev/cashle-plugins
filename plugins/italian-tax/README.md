# Italian tax source plugin

This bundle provides Italy's existing 2025 individual tax and property sale
policies. It includes residence, payroll, pension, investment and property settings
in English and Swedish.

Ordinary pension and wage income share the 2025 national IRPEF and the entered
regional and municipal schedules. The Art. 13 wage and pension credits use the
combined ordinary income and their eligible days. For a sequential retirement
during the year, enter the actual employment credit days in the transition
field. Remaining days default to pension days, or enter the actual pension
credit days when there is a gap. The combined count cannot exceed 365. In a
pension-only assessment, the model defaults to 365 pension days unless
specified. Resolved employee INPS contributions apply only to gross salary.
The tax forecast retains the 2025 edition of IRPEF.

- [Art. 13 TUIR, ordinary wage and pension credits](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.articolo.numero=13&atto.codiceRedazionale=086U0917&atto.dataPubblicazioneGazzetta=1986-12-31)
- [Agenzia delle Entrate guidance on credit days](https://infoprecompilata.agenziaentrate.gov.it/portale/web/guest/semplificata-mod-lavoro-dipendente-e-pensioni)

Build the source ZIP with Node.js and `zip`.

```sh
node plugins/italian-tax/build.mjs
```

Install `cashle-tax-it-source.zip` in the Cashle plugin repository and enable it
in the app. Italy will appear in the tax residence and property settings.

The [direct model](doc/direct-model.cashle) books EUR 260 of tax on EUR 1,000
of capital income. The [pinned assessment](doc/pinned-assessment.cashle)
checks the annual posting date, tax, contributions and closing cash.

```sh
cashle-cli/build/install/cashle/bin/cashle plugins/italian-tax/doc/direct-model.cashle --classpath plugins/italian-tax
```

See the [rule provenance](doc/ITALIAN_RESIDENCE_SOURCES.md) for the official
sources and forecast assumptions.
