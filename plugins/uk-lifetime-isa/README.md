# UK Lifetime ISA

Add an individual Lifetime ISA in Savings. Enter its opening balance and
original first payment date. For a new account, use the first planned deposit
date. The owner must be at least 18 and under 40 at opening and normally a UK
resident while contributing. Eligible Crown servants and their spouses or civil
partners may contribute while abroad. Enter a contribution end date if
eligibility changes. Contributions stop on the 50th birthday. Enter the birth
day when the exact date matters. Otherwise the last day of the birth month applies.

Scheduled deposits use available shared cash. A 25% bonus is credited on each
funded subscription in the forecast. Deposits stop at £4,000 each tax year
(6 April to 5 April) or the remaining part of the £20,000 ISA allowance, if
smaller. Enter deposits already made into the Lifetime ISA this tax year and
annual subscriptions assigned to other ISAs. If using multiple ISA modules,
allocate the shared limit consistently in their inputs. Withdrawals do not
restore subscription room. The bonus is accrued with the deposit in this model.
Providers claim it later, so check credited balances for an imminent purchase.
The bonus is rounded up and withdrawal charges down to the nearest penny.

You can enter one planned gross withdrawal. Withdrawing the whole account closes
it. Withdrawals from age 60 are charge-free, as are withdrawals with a confirmed
terminal-illness exemption. For a first-home withdrawal, confirm that the saver
qualifies, the purchase is with an eligible mortgage and the conveyancer will
receive the withdrawal. The model verifies there are at least 12 months from
first payment. A qualifying first home up to £450,000 carries no charge. For an
otherwise qualifying purchase above that cap, the rate fell from 25% to 20% on
29 October 2026. The ordinary withdrawal charge before age 60 is 25%.

The model books the net withdrawal into plan cash. For a qualifying home, record
the matching purchase in the plan. The calculation assumes the confirmed
purchase goes ahead. It does not model solicitor returns, transfers, estate
settlement or bonus corrections. Gains, bonuses and withdrawals stay outside
income tax. The government announced a successor First Time Buyer ISA for April
2029 with existing Lifetime ISAs able to continue. This source uses the current
Lifetime ISA rules.

- [GOV.UK Lifetime ISA and limits](https://www.gov.uk/lifetime-isa)
- [Eligibility](https://www.gov.uk/lifetime-isa/who-can-open-a-lifetime-isa)
- [First residential purchase conditions](https://www.gov.uk/guidance/lifetime-isa-withdrawals-for-a-first-time-residential-purchase)
- [Withdrawal and charge-free rules](https://www.gov.uk/lifetime-isa/withdrawing-money-from-your-lifetime-isa)
- [October 2026 rates amendment](https://www.legislation.gov.uk/uksi/2026/1130/made)
- [HMRC reporting and rounding](https://www.gov.uk/guidance/digital-reporting-for-lifetime-isas)
- [First Time Buyer ISA consultation response](https://www.gov.uk/government/consultations/first-time-buyer-isa-consultation/outcome/first-time-buyer-isa-consultation-government-response)

Build with `node plugins/uk-lifetime-isa/build.mjs`. Run the [direct
model](doc/direct-model.cashle) through the Cashle CLI with
`--classpath plugins/uk-lifetime-isa`. The example funds £4,000 of deposits,
credits a £1,000 bonus and deducts a £1,000 charge on a qualifying £500,000
first-home withdrawal after the October 2026 change.
