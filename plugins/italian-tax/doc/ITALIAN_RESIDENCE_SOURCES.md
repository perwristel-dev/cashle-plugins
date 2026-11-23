# Italian annual tax residence

The Italian provider exposes a whole-calendar-year residence test separately
from the residence location on an individual income-payment date.

Primary source: [Agenzia delle Entrate — Residence for tax purposes](https://www.agenziaentrate.gov.it/portale/web/english/residence-for-tax-purposes),
reviewed for this implementation on 2026-10-31.

Italy generally treats an individual as resident for the whole tax year when
one of the statutory residence conditions applies for the greater part of the
calendar year. For the model's physical-presence input this means at least
183 days in a 365-day year or 184 days in a leap year. A move in the middle
of a year does not by itself split Italian resident taxation at the move
date. The official guidance identifies split-year treaty provisions with
Germany and Switzerland; this implementation does not automatically apply
either treaty or a split-year election.

The source policy declares `usesWholeYearResidenceTest true`.
`isWholeYearResident(taxYear, residentDays)` implements only the physical-day
majority test, including the leap-year boundary and validation that days
are within the calendar-year length. The host supplies the resolved days
from the model's residence timeline. When annual residence is established,
worldwide annual income must be accumulated for that year's assessment,
including income received before physical arrival or after departure.
Other countries keep their existing provider-defined residence treatment.

The timeline is assumed to provide complete physical presence for this
planning test. It does not independently investigate domicile, civil-law
residence, registration presumptions, family/economic ties, partial days
spent in another country, or treaty tie-breakers. Falling below the physical
day threshold does not establish legal nonresidence under all other tests.
Where the model includes Italian presence but fails the majority test, its
existing ordinary full-year resident assessment cannot serve as a complete
Italian nonresident calculation; that profile requires an explicit unsupported
case error rather than applying resident brackets only to post-move income.

The existing Italian income-tax edition remains the 2025 planning engine.
Actual INPS contribution inputs and verified local-rate or local-schedule
requirements remain in force. Foreign tax credit entitlement and treaty
relief are not automatically inferred from this annual residence test.
