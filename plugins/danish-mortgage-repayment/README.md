# Danish mortgage amortization

Add **Danish mortgage amortization** to a specific realkredit loan. Set the total remaining loan term and the remaining interest-only months agreed with the lender. For a planned loan, the terms begin when it starts. For a loan already outstanding, enter the months remaining at the start of the Cashle plan.

## Standard rule

Under §§ 3–4 of the Danish Mortgage Credit Loans and Mortgage Credit Bonds Act, ordinary owner-occupied homes and holiday homes have a maximum term of 30 years and must amortize at least as quickly as a 30-year annuity. The lender may agree up to 10 years of interest-only payments within the term. The contract and application of the law determine whether the borrower can use those months. [Current act, LBK nr. 1541 of 2 December 2025](https://www.retsinformation.dk/eli/lta/2025/1541/pdf)

The plugin models one continuous remaining interest-only period of 0–120 months and a total term of 1–360 months. Both use whole loan payment periods and the total term includes the interest-only period. After it ends, the loan amortizes over the remaining term on its existing interest payment dates. Principal payments adapt to the loan’s projected rates and current balance. The existing loan continues to book interest, including during the interest-only period. Cashle’s funding engine handles unpaid principal, extra repayments and limits on the amount that can be repaid.

## Scope

Use this module for the standard retail rule. § 33 c(2) provides an exception to §§ 3–4 for some loans funded by specially covered mortgage bonds or bonds, secured on § 5(1) properties, within a loan limit of 75%. The package models neither that exception nor credit approval, lender-specific limits, refinancing and prior interest-only history, repeated interest-only periods, fees or bond prices. [Statutory covered-bond exception](https://www.retsinformation.dk/eli/lta/2025/1541/pdf) · [Finanstilsynet report on long interest-only loans](https://cdn.finanstilsynet.dk/finanstilsynet/media/52534/Rapport_om_realkreditln_med_langvarig_afdragsfrihed.pdf)

## Direct model

Run the example against the Cashle CLI from this directory.

```sh
cashle doc/direct-model.cashle --classpath .
```

The model repays DKK 1,000 of a DKK 360,000 mortgage each month at zero interest over 30 years. After the three forecast months the remaining loan principal is DKK 357,000.
