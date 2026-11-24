# Norwegian property purchase duty (dokumentavgift)

Add **Norwegian property purchase duty (dokumentavgift)** in Expenses for
a planned title transfer. Enter the taxable market value of the interest
being transferred in NOK and the title registration date. The market value
is measured at registration and includes permanent structures where applicable.
For a partial conveyance, enter the value of the share conveyed. Use the
market value even if the purchase price differs.
[Kartverket’s guidance on document duty](https://www.kartverket.no/eiendom/dokumentavgift-og-gebyr/dokumentavgift-ved-overforing-av-fast-eigedom)

Cashle rounds the basis down to the nearest NOK 1,000, applies 2.5%, and
rounds the duty down to the nearest NOK 10, subject to the NOK 250 minimum.
It estimates one payment 14 days after registration. Enter the actual payment
date from the invoice to override that estimate. The entered basis is nominal
NOK and the payment uses the case exchange rate. The model uses the 2026
rules as a forecast for later conveyances.
[2026 Storting resolution § 1](https://lovdata.no/dokument/LTI/forskrift/2025-12-18-2777),
[Document Duty Regulations § 2-3](https://lovdata.no/dokument/SF/forskrift/1975-12-16-1#%C2%A72-3)

Housing cooperative shares (*borettslagsandeler*) produce zero duty. The
model covers the ordinary rate and the cooperative exclusion. Exempt spousal
and qualifying inheritance transfers, special rates for dissolving a
cooperative, the special basis for certain new buildings, leasehold
exceptions, registration fees, and other transaction costs are outside this
calculation. The expense has its own date and value and is entered separately
from the house purchase.
[Kartverket’s exemptions and special cases](https://www.kartverket.no/eiendom/dokumentavgift-og-gebyr/fritak-for-dokumentavgift)

## Direct model

```sh
cashle doc/direct-model.cashle --classpath .
```

A property interest valued at NOK 4,051,999.75 is registered on July 10, 2026.
The rounded duty is NOK 101,270, due in the forecast on July 24.
