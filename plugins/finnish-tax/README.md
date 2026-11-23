# Finnish tax source plugin

This bundle supplies Cashle's 2026 mainland Finnish tax policy and editors. It
covers earned income, foreign listed shares and private-home sales. Salary and
pension can be assessed together. Other benefits require a separate assessment.
Foreign investment losses can carry for ten years. The separate property loss
carry lasts five years.

Annual wages in the year a social-insurance age limit is reached are treated as
earned before the cutoff. The forecast uses calendar-year totals, so a person who
continues working past a birthday that ends a contribution can see excess
contributions in that year. The health insurance increment uses taxable earned
income less wages subject to the daily allowance contribution.
[Vero health insurance examples](https://www.vero.fi/syventavat-vero-ohjeet/ohje-hakusivu/338472/vakuutetun-sairausvakuutusmaksu2/) ·
[Vero 2026 deductions](https://www.vero.fi/henkiloasiakkaat/vahennykset/mita-voi-vahentaa/verohallinto-laskee-nama-vahennykset-automaattisesti/) ·
[ETK age limits for pension insurance](https://www.etk.fi/suomen-elakejarjestelma/elaketurva/tyoelaketurvan-kattavuus-ja-vakuuttaminen/palkansaajat/)

Build the source ZIP with `node plugins/finnish-tax/build.mjs` from the repository
root. Upload `cashle-tax-fi-source.zip` to your personal plugin repository in
Cashle and enable it. The host will select the source provider for plans using
Finnish tax residence or Finnish property tax.

The [direct model](doc/direct-model.cashle) uses a 50,000 EUR annual salary and
the pinned 2026 assessment with municipal and church rates of 5.3% and 1%.
It accrues 9,361.96 EUR in assessed tax and 4,095 EUR in social contributions.

```bash
./gradlew :cashle-cli:installDist
cashle-cli/build/install/cashle/bin/cashle plugins/finnish-tax/doc/direct-model.cashle --classpath plugins/finnish-tax
```

See [rule provenance](doc/rule-provenance.json) for the official sources.
