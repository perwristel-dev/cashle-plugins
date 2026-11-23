# Industriens Pension

This Danish occupational pension covers ordinary hourly employees under
**Industriens Overenskomst** between DI and CO-industri. Add one Industriens
Pension from **Savings** in Cashle. Its **Income** view edits the payout
of the same pension.

## Contributions and savings

| Effective date | Employer | Employee | Gross pension contribution |
| --- | ---: | ---: | ---: |
| 1 June 2023 | 10% | 2% | 12% |
| 1 May 2025 | 11% | 2% | 13% |

The rates apply to pensionable pay. Ordinary membership requires age 18
and either prior qualifying pension coverage or two months of eligible
seniority. Enter the first contribution date confirmed by the employer,
including any qualifying prior employment. The forecast credits monthly
amounts at month end from the eligible month, using the 13% rate after
May 2025 as a forecast assumption. Use reported opening capital to account
for earlier savings. The module uses entered nominal DKK amounts and an
unchanging pensionable wage. Enter salary cash flow separately with the
employee contribution already reflected.
[Collective agreement § 34](https://www.co-industri.dk/sites/default/files/2025-08/Industriens-Overenskomst-2025-2028-2025_07_31.pdf)
[Industriens Pension employer guidance](https://www.industrienspension.dk/ForVirksomheder/AltOmIndberetning/Overenskomster)

The net savings credit is the gross contribution less the entered monthly
deductions. Enter the difference between the gross payroll contribution
and the amount credited to the modeled pension components. It may include
AM-bidrag, administration and insurance charges, and any allocation to
other components. The insurer's default allocation prioritizes
aldersopsparing, then divides the remainder between ratepension and
lifetime pension, subject to limits and individual choices. The published
2026 administration fee is DKK 29 per month and insurance charges vary.
The module uses the statement deduction and excludes capital growth,
policy-specific charges after entry, transfers and individually negotiated
premiums. Setting pensionable pay to zero uses the opening capital alone.
[Industriens Pension savings allocation](https://www.industrienspension.dk/ForMedlemmer/Opsparing/Opsparingstyper)
[Costs and returns](https://www.industrienspension.dk/ForMedlemmer/Opsparing/AfkastOgOmkostninger)
[Insurance costs](https://www.industrienspension.dk/ForMedlemmer/Forsikring/PrisForsikring)

## Income

Enter the earliest payout date shown by Industriens Pension and the gross
monthly amounts it quotes for the selected start and duration. Set the
start by age, calendar date or milestone. The forecast starts monthly
payments when eligible, rounding dates to the same or next month's first
day, and assumes contributions stop at payout. A ratepension lasts at least
10 years and must end within 30 years of the earliest eligible date. The
default is 15 years. A dynamically resolved start outside this window
keeps the savings balance in place and leaves payouts unscheduled. Lifetime
payments continue through the forecast until death. Cashle books both as taxable pension income.
[Industriens Pension start rules](https://www.industrienspension.dk/ForMedlemmer/Seniorer/UdbetaltPension)
[Rate and lifetime pension conditions](https://www.industrienspension.dk/ForMedlemmer/Opsparing/Opsparingstyper)

The modeled opening capital and net credits represent pre-payout savings
for the quoted pension components. When payments start, the forecast
represents those rights as the entered income stream instead of a savings
balance. It leaves the remaining ratepension capital, aldersopsparing
payments, survivor benefits, special eligibility categories, overlap with
work after public pension age, and statutory ATP outside this projection.

Build the ZIP with `node plugins/danish-industriens-pension/build.mjs`.
Run the [direct model](doc/direct-model.cashle) from the repository root.

```sh
cashle plugins/danish-industriens-pension/doc/direct-model.cashle --classpath plugins/danish-industriens-pension
```
