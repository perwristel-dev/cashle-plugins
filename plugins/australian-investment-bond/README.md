# Australian investment bond

Add **Australian investment bond** under Investments in an Australian tax plan. Use it for an eligible domestic tax-paid life-insurance policy held by its original Australian-resident individual owner. Enter the insurer’s surrender value, total premiums paid as the cost basis, and anticipated growth net of insurance charges and fund tax. Set a full surrender date to forecast cash proceeds and personal tax. [ATO investment income](https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/income-you-must-declare/investment-income)

For a policy with no previous surrender or paid bonus, the part of full surrender proceeds above total premiums is the bonus used in the calculation. The first eight years include all of that bonus in assessable income, the ninth year includes two-thirds, and the tenth year includes one-third. Full surrender on or after the tenth anniversary contributes no section 26AH bonus to assessable income. For this tax-paid policy scope, the [Australian tax provider](../australian-tax/README.md) applies the 30% non-refundable offset to the included amount. Losses on surrender do not offset capital gains. [Income Tax Assessment Act 1936, sections 26AH and 160AAB](https://www.legislation.gov.au/C1936A00027/2026-07-01/2026-07-01/text) · [ATO ruling IT 2346](https://www.ato.gov.au/law/view/document?LocID=%22ITR%2FIT2346%2FNAT%2FATO%22&PiT=99991231235958)

The assurance year starts on each anniversary of the insurer’s commencement-of-risk date. When premiums exceed 125% of the immediately preceding assurance year’s total, the ten-year period restarts from the first day of that assurance year. If the previous year’s premium was zero, any positive new premium restarts the period. Enter the insurer-confirmed start of the latest historical period if a restart has already occurred. For projected top-ups to an existing policy, enter the latest recorded assurance year number and premiums for that and the preceding assurance year. The first assurance year is 1. Cashle tracks subsequently posted premiums against those balances. [Section 26AH(13)](https://www.legislation.gov.au/C1936A00027/2026-07-01/2026-07-01/text/original/epub/OEBPS/document_1/document_1.html)

The forecast covers full surrender only. Policy assignments, withdrawals or bonuses paid previously, foreign policies, death benefits, and other statutory exceptions require separate treatment. The fund’s own tax is reflected in the entered net return.

## Direct model

```sh
cashle doc/direct-model.cashle --classpath .:../australian-tax
```

The policy pays AUD 15,000 on its eighth anniversary, entering assurance year nine. Two-thirds of the AUD 5,000 bonus, or AUD 3,333.33, is included in assessable income. The approximate AUD 1,000 offset is applied alongside AUD 60,000 earned income. The modeled 2026/27 tax and Medicare levy total AUD 9,401.67.
