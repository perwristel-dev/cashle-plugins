# Fixed repayment

Source provider: `cashle.finance.loan-repayment.amount`. The module connects to the loan selected in
its own editor through the [repayment contract](https://github.com/perwristel-dev/cashle/tree/main/plugins/cashle-finance-loan-repayment).

Set `amortizationAmount` per payment period in `loanRepaymentAmount`.
`amortizationBasis` chooses an entered nominal amount or an amount indexed
with plan inflation.

[Run the direct finance model](doc/direct-model.cashle).
