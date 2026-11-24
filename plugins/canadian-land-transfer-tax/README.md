# Canadian residential transfer charges

Add this one-time expense for an ordinary residential purchase. Enter the
nominal taxable consideration in CAD and the closing date. In Alberta, use
the land value underlying the registration fee, along with the nominal
mortgage charge amount assessed for a standard mortgage registration if
applicable. The scheduled cost follows the entered closing date. Update the
expense when a property purchase changes or falls through.

- Ontario uses the ordinary provincial marginal schedule in force from
  January 1, 2017. The 2.5% top tier applies to value over CAD 2 million for
  land containing one or two single-family residences.
- The City of Toronto adds municipal land transfer tax to the Ontario tax.
  The plugin uses the schedule effective April 1, 2026, including the higher
  graduated residential bands above CAD 3 million. Select Toronto only for
  a property located within the city.
- For first-time rebates applied at closing, enter the eligible ownership
  share separately for the Ontario and Toronto programs. Each multiplies
  the applicable share by the lesser of the tax and program maximum.
  Maximums are CAD 4,000 and CAD 4,475, respectively.
- Alberta uses the October 20, 2024 registration levy schedule. A standard
  land transfer and an optional mortgage registration each cost CAD 50
  plus CAD 5 per CAD 5,000 or portion of the corresponding assessed value.

Nonresident surtaxes, special exemptions, transitional agreements, Ontario
and Toronto registration or administrative fees, and subsequent rebates are
outside this cashflow. The existing Canadian tax plugin handles principal
residence sales for its Alberta and Ontario scope. The transfer expense
does not modify the purchase cost basis used by that sale assessment.

- [Ontario rates](https://www.ontario.ca/document/land-transfer-tax/calculating-land-transfer-tax)
- [Ontario first-time homebuyer refunds](https://www.ontario.ca/document/land-transfer-tax/land-transfer-tax-refunds-first-time-homebuyers)
- [Toronto rates](https://www.toronto.ca/services-payments/property-taxes-utilities/municipal-land-transfer-tax-mltt/municipal-land-transfer-tax-mltt-rates-and-fees/)
- [Toronto Municipal Code, chapter 760](https://www.toronto.ca/legdocs/municode/1184_760.pdf)
- [Alberta registration fees](https://www.alberta.ca/system/files/sartr-land-titles-and-surveys-common-documents-fee-schedule.pdf)

The [direct model](doc/direct-model.cashle) projects an ordinary Ontario purchase in Toronto.
