# Italian municipal property tax

Add an IMU expense for Italian residential property that owes municipal
property tax. This includes a typical second home and a principal home in
eligible luxury categories A/1, A/8 and A/9. Ordinary qualifying principal
homes are generally exempt. Municipal rates, cadastral facts, exemptions,
ownership shares and holding months belong in the municipality's or tax
adviser's confirmed computation.

Enter the June advance and December balance for your share in euros. The
ordinary deadlines are 16 June and 16 December, moved to the next weekday
when they fall on a weekend. A payment in full in June uses a zero December
balance. The expense skips deadlines outside the plan.

The default applies the amounts to the selected tax year. To make a forecast
with the same nominal euro amounts, enter the final year. Use separate
entries for different amounts when the rate, ownership, exemption or assessed
property changes. This model covers the ordinary two-installment calendar.
Municipality-specific extensions, the autonomous provincial regimes,
late-payment interest and penalties need their own actual amounts and dates.

The [direct example](doc/direct-model.cashle) books €450 on 16 June 2028 and
€525 on 18 December 2028. The existing Italian income-tax plugin handles
property-sale gain. VAT and registration, mortgage-register and cadastral
charges on acquisition require separate purchase inputs.
[Law 160/2019, Article 1, paragraphs 738–783](https://www.normattiva.it/eli/id/2019/12/30/19G00165/CONSOLIDATED) ·
[Ministry of Economy and Finance IMU rates and regulations](https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/nuova_imu/sceltaregione.htm) ·
[Agenzia delle Entrate home purchase guide](https://www1.agenziaentrate.gov.it/web_app_entrate/guida_acquisto_casa.html)

```sh
cashle plugins/italian-imu/doc/direct-model.cashle --classpath plugins/italian-imu
```
