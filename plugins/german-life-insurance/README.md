# German unit-linked life insurance

Add **German unit-linked life insurance** in Savings for a paid-up or
single-premium, fully unit-linked private contract beginning in 2018 or later.
Enter the current gross surrender value as the balance, the sum of historical
premiums paid as the nominal cost basis, and the contract date. The premiums
include charges already paid through them. For an eventual lump sum, enable
closure on the surrender or cash maturity date. Use one account per contract.

Internal fund returns accrue in the policy value. At a full cash payout, the
tax difference is the proceeds less premiums. Cashle applies the 15% exclusion
to the whole difference for this fully investment-derived profile. The
remaining difference normally goes into Germany's separate capital tax
assessment, including its saver allowance and capital losses rules.
[Income Tax Act § 20 (1) no. 6](https://www.gesetze-im-internet.de/estg/__20.html),
[BMF guidance on life insurance](https://ao.bundesfinanzministerium.de/esth/2025/B-Anhaenge/Anhang-22a/I/inhalt.html)

For the qualifying half-gain route, enter the first eligible date confirmed
by the insurer. It must take account of the minimum contract duration of 12
years, age 62 and the contract's qualifying protection. The annual
assessment taxes half of the gain after the 15% exclusion at the ordinary
progressive tariff. Germany's saver allowance is applied to this gain first.
An empty eligibility date keeps the ordinary separate capital treatment.
[Income Tax Act §§ 32d](https://www.gesetze-im-internet.de/estg/__32d.html) and
[52](https://www.gesetze-im-internet.de/estg/__52.html),
[BMF guidance on saver allowance allocation, paragraph 129](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Abgeltungsteuer/2025-05-14-einzelfragen-zur-abgeltungsteuer.pdf?__blob=publicationFile&v=6)

With German tax enabled, the model books the standard domestic insurer
withholding of 25% plus the solidarity surcharge on the full gain after the
15% exclusion, including a payout that qualifies for the half-gain assessment.
The annual notice reconciles those payments. Withholding assumes no church
withholding at the insurer and no exemption order. Final assessment uses the
owner’s German tax profile. The account stays available for full closure
only. Install the updated German tax bundle to model the annual liability.
Contracts with ongoing premiums, earlier withdrawals, hybrid investments,
death benefits, foreign residence or insurers, annuity elections and losses
under the half-gain rule are outside the calculation.
[BMF insurer tax certificate guidance](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Abgeltungsteuer/2025-05-16-kapitalertragSt-steuerbescheinigung.pdf?__blob=publicationFile&v=3)

## Direct model

Run from this directory.

```sh
cashle doc/direct-model.cashle --classpath . --classpath ../german-tax
```

The full EUR 15,000 surrender of a policy with EUR 10,000 in premiums produces
a EUR 5,000 gain. The tax base after the fund exclusion is EUR 4,250 and the
ordinary EUR 1,000 saver allowance applies at annual assessment.
