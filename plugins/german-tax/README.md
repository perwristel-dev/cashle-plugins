# German tax source plugin

This bundle installs Germany's existing 2026 individual income tax and private
home sale policies. The same package contributes the residence and property
settings in English and Swedish. It preserves the existing DE inputs, supported
listed-share classifications, assessment notices and separate loss balances.

Build the source ZIP with Node.js 24 and `zip`:

```sh
node plugins/german-tax/build.mjs
```

Install `cashle-tax-de-source.zip` in the Cashle plugin repository and enable it
in the app. Germany will appear in the tax residence and property settings.

The [direct model](doc/direct-model.cashle) books EUR 263.75 of tax on EUR 2,000
of capital income. The EUR 1,000 saver allowance leaves EUR 250 of capital tax
and EUR 13.75 of solidarity levy.

```sh
cashle-cli/build/install/cashle/bin/cashle plugins/german-tax/doc/direct-model.cashle --classpath plugins/german-tax
```

See the [rule provenance](../../docs/tax-germany-netherlands-research.md) for the
statutory sources and the assumptions of the supported forecast.

## Pension income

Choose `single-retiree` for an individually assessed, full-year German resident
whose ordinary income consists of German statutory pension or VBLklassik.
The profile also supports the existing listed-share and other capital-income
assessment. Mixed wages and pension in the same tax year, taxable private sales
during retirement, other pension types, joint assessment, Günstigerprüfung,
retiree insurance calculations and additional age relief are outside this
profile.

- For GRV, enter the actual first calendar year as `statutoryPensionStartYear`.
  That year's actual gross payments use the statutory taxable percentage
  (84% for a 2026 start). Later years subtract the fixed nominal EUR
  `statutoryPensionExemptAmount` from the tax notice or an estimate based on
  the calendar year following the start. Enter the applicable amount if a
  statutory recalculation is needed. The model keeps the entered nominal
  amount fixed across years. [EStG § 22 no. 1](https://www.gesetze-im-internet.de/estg/__22.html)
- For VBLklassik, enter `vblTaxableShare` as a decimal from 0 to 1 using the
  provider's tax statement or a provider-supported forecast. The share can be
  1 when the whole payment is taxable. The forecast keeps the share constant.
  [EStG § 22 no. 5](https://www.gesetze-im-internet.de/estg/__22.html),
  [VBL's tax guidance](https://www.vbl.de/en/vblklassik1)
- Enter actual annual deductible health and long-term care premiums as
  `pensionInsurancePaid`, or zero. Model the premium cash payments separately.
  The annual assessment also applies the shared EUR 102 pension expense
  allowance and the same ordinary tariff, solidarity and church tax as the
  employee profile. [EStG §§ 9a](https://www.gesetze-im-internet.de/estg/__9a.html),
  [10](https://www.gesetze-im-internet.de/estg/__10.html) and
  [32a](https://www.gesetze-im-internet.de/estg/__32a.html)
- Pension receipts are included in the annual assessment without source
  income-tax withholding. Use actual notice dates or an explicit recurring
  forecast for settlement. The forecast carries the 2026 tariff parameters
  forward using the case's price assumptions. [DRV tax guidance](https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Allgemeine-Informationen/Wissenswertes-zur-Rente/FAQs/Rente/Rente_Rentenabzuege_Steuern/Rente_Rentenabzuege_Steuern.html)
