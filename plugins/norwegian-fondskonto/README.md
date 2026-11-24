# Norwegian fondskonto

Use this account for individual Norwegian unit-linked endowment insurance with
a small insurance element. Enter the market value and the still-invested premium
basis from the insurer. A withdrawal realizes the same proportion of the account's
remaining premium and unrealized gain or loss. Capital returned as premium is
outside income tax. The result is realized even on a partial withdrawal. Gains
inside the insurance arise for personal tax only on withdrawal. Model cash taken
out of the policy as a withdrawal, and keep policy returns inside the account.

Enter the insurer's effective average equity percentage for the relevant withdrawal
period. The insurer applies the annual equity thresholds before averaging over the
ownership period. Use the resulting percentage once. The same entered split is
held for the forecast. Equity gains and losses use Norway's 2026 uplift factor of
1.72. The remainder uses the capital-income or capital-loss basis. The existing
Norwegian tax plugin assesses those bases under its 2026 rules.

Enter verified unused shielding at the start of the plan if available. At each
profitable withdrawal the model applies it first to the equity gain, then to the
remaining interest gain. Unused amounts carry forward while the account remains
open. If including realized gains from before the plan started, enter them gross
with any already-applied shielding by component. The verified unused amount should
exclude those deductions. The forecast leaves future new shielding, wealth tax,
foreign residence and any separate insurance-payment rules outside its scope.

- [Skatteetaten fondskonto rules and withdrawal examples](https://www.skatteetaten.no/en/person/taxes/get-the-taxes-right/shares-and-securities/about-shares-and-securities/tax-rules-for-investing-in-shares-and-other-securities-through-endowment-insurance-securities-account/)
- [Skatteetaten reporting and 2026 rates](https://www.skatteetaten.no/bedrift-og-organisasjon/rapportering-og-bransjer/tredjepartsopplysninger/bank-finans-og-forsikring/fondskonto/rettledning/)

Build with `node plugins/norwegian-fondskonto/build.mjs`. Run the [direct
model](doc/direct-model.cashle) with the Cashle CLI and the fondskonto and
Norwegian tax folders on its classpath. That example closes a NOK 15,000 account
with NOK 10,000 remaining basis, a 60% effective equity share and NOK 1,000 of
verified unused shielding.
