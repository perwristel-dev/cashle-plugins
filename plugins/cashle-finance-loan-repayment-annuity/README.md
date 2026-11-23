# Annuity

Source provider: `cashle.finance.loan-repayment.annuity`. The module connects to the loan selected in
its own editor through the [repayment contract](https://github.com/perwristel-dev/cashle/tree/main/plugins/cashle-finance-loan-repayment).

Set `remainingTerm` and `termUnit` (`months` or `years`) in
`loanRepaymentAnnuity`. The loan supplies its interest payment dates and
interest projections through `AnnuityInterest`. The first installment occurs
on its first interest date on or after the entered start. The payment is
repriced when the balance or rate changes, including after extra repayments.
A loan can have one active annuity. Other principal repayments can coexist.

[Run the direct finance model](doc/direct-model.cashle).
