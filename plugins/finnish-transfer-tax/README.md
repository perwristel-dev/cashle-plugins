# Finnish residential transfer tax

Add a one-time expense for an ordinary Finnish home purchase with a deed
signed from January 1, 2024. First-time-buyer relief ended on that date.
Use the buyer's verified ownership share. If buying with someone else,
enter a separate tax expense for each buyer's share. The expense uses the
entered values and dates. Update them if the purchase changes.

| Property | Taxable value | Rate | Payment used in the plan |
| --- | --- | --- | --- |
| Existing housing-company shares with an agent | Purchase price plus the allocated housing-company debt | 1.5% | Agreement signing |
| Existing housing-company shares without an agent | Purchase price plus the allocated housing-company debt | 1.5% | Within two months of signing |
| New-build housing-company shares | Purchase price plus the allocated housing-company debt | 1.5% | Within two months of ownership transfer |
| Direct real estate or building | Taxable consideration | 3% | At signing by default, or on an entered date before applying for title, within the six-month deadline |

Enter nominal euro amounts. Housing-company debt counts even when paid in
instalments. The plan uses the legal deadline for the two-month variants
unless an earlier payment date is entered. Weekend and Finnish public
holiday deadline rules apply. A tax below EUR 10 per buyer omits the payment.
A transfer tax return can still be required.

The Finnish tax plugin handles eligible principal residence disposals
under the two-year ownership and continuous residence rule. Owner-occupied
mortgage interest is non-deductible. The new acquisition expense is entered
separately from the home purchase and from sale cost basis. This expense
covers the ordinary acquisition duty. Late charges, special exemptions,
registration fees, VAT and annual real estate tax are outside its scope.

- [Vero transfer tax rates](https://www.vero.fi/en/individuals/property/transfer-tax/)
- [Vero housing-company shares and debt-free price](https://www.vero.fi/en/individuals/property/transfer-tax/buyer-of-a-flat/)
- [Vero filing and payment deadlines](https://www.vero.fi/en/individuals/property/transfer-tax/instructions-for-filing-and-paying-transfer-tax/table-of-filing-and-payment-deadlines/)
- [Vero first-home exemption cutoff](https://www.vero.fi/en/individuals/property/transfer-tax/buying_your_first_hom/)
- [Finnish statutory deadline rules](https://www.finlex.fi/fi/lainsaadanto/1930/150)

The [direct model](doc/direct-model.cashle) shows a buyer's share of a brokered housing-company purchase.

Run the DSL regression test from the repository root with an installed Cashle CLI:

```sh
CASHLE_CLI=/path/to/cashle node --test plugins/finnish-transfer-tax/test/transfer-tax.test.js
```

When `cashle` is on your PATH, omit `CASHLE_CLI`.
