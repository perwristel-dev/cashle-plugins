# Straight-line repayment

Source provider: `cashle.finance.loan-repayment.straight`. The module connects to the loan selected in
its own editor through the [repayment contract](https://github.com/perwristel-dev/cashle/tree/main/plugins/cashle-finance-loan-repayment).

Set `remainingTerm` and `termUnit` (`months` or `years`) in
`loanRepaymentStraight`. The term must cover a whole number of payment
periods. Each payment divides the then-outstanding principal by the number of
installments left.

[Run the direct finance model](doc/direct-model.cashle).
