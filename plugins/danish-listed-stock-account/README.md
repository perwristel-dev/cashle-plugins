# Danish taxable listed-share depot

Add **Danish taxable listed-share depot** in Savings for an ordinary holding
of Danish shares admitted to trading. Use one row per security at each depot.
Enter the Danish security identifier (ISIN), quantity, current market value
and total nominal tax acquisition cost for that row. Include every ordinary
holding of the same company for the owner at a common price and use the same
identifier across depots. This profile covers one class of shares per company
with purchases from 2006 onward.
[Danish Tax Agency average cost guidance](https://skat.dk/borger/aktier-og-andre-vaerdipapirer/skat-af-aktier/gevinst-og-tab-opgoeres-efter-gennemsnitsmetoden),
[Act on Taxation of Share Gains, § 26](https://www.retsinformation.dk/eli/lta/2025/1098)

The pool updates as shares are purchased or sold. The sale uses the average
cost per share across the whole pool before the sale, allocated by the
quantity sold. Only realized gains and cash dividends enter share income.
The domestic dividend withholding rate is 27% of gross cash dividends.
Realized gains are assessed annually without transaction withholding.
Use the updated Danish tax plugin for the annual assessment and reconciliation.
[Danish Tax Agency share income guidance](https://skat.dk/en-us/borger/aktier-og-andre-vaerdipapirer/skat-af-aktier),
[2026 dividend withholding guidance](https://info.skat.dk/data.aspx?oid=2289037)

Confirm reporting if the Tax Agency received the acquisition information on
time and the loss is reported by the deadline. Eligible losses offset eligible
listed dividends and gains for the same individual. The remainder carries
forward. Existing verified losses can be entered once in the Danish residence
tax settings. Other positive share income still uses the same tax bands.
Denmark's tax profile uses 2026 rules. It supports individual assessment
and full-year residence. Share classes with different rights, custody transfers
in kind, corporate actions, foreign dividend withholding credits, shares from
before 2006, funds, pension accounts, ASK and spousal transfers are outside
this model. Cash transfers involving a depot represent purchases or sales.
[Act on Taxation of Share Gains, §§ 13 A and 14](https://www.retsinformation.dk/eli/lta/2025/1098)

## Direct model

```sh
cashle doc/direct-model.cashle --classpath . --classpath ../danish-tax
```

Two depots together hold 100 shares with a total basis of DKK 7,000. The first
depot closes at DKK 5,000. Its 50 shares use DKK 3,500 of the shared basis, so
the taxable gain is DKK 1,500 and the annual assessment is DKK 405.

Enter a verified opening loss carry in the depot’s tax settings, in nominal
DKK. Enter each balance only once across depots and existing tax settings.
