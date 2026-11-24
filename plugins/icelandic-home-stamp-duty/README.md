# Icelandic home stamp duty

Link this expense to a planned residential acquisition by individuals. Enter
the official property valuation in ISK applicable to the chargeable document.
The registry valuation reflects the building stage at delivery. The calculation
uses the individual rate of 0.8%, reduced to 0.4% on the qualifying first-buyer
ownership share. Enter the confirmed eligible share after any spouse or partner
restriction. Use zero for ordinary purchases. Enter the entire confirmed value
and share for the purchase once.

The expense is budgeted on the linked acquisition date. The chargeable document
and registration rules determine the actual liability and payment. A subsequent
deed for the same buyer is exempt if stamp duty was paid on the purchase
agreement. The model covers a single ordinary home purchase. It excludes
separate registration fees, penalties, entity acquisitions and specialist
exemptions. The existing Icelandic tax source handles residential sales
separately.

- [Act 138/2013, articles 2, 4 and 5](https://www.althingi.is/lagas/nuna/2013138.html)
- [Ísland.is registration and first-purchase guidance](https://island.is/en/registration-of-documents)

Build with `node plugins/icelandic-home-stamp-duty/build.mjs`. Run the [direct
model](doc/direct-model.cashle) with the Cashle CLI and
`--classpath plugins/icelandic-home-stamp-duty`. The example books ISK 240,000
on a qualifying first purchase with an official valuation of ISK 60 million.
