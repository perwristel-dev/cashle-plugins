import dev.cashle.pension.agreement.PensionAgreement.ContributionInput
import groovy.transform.CompileStatic

import java.time.LocalDate

import static SwedishAgreementRules.age

// Eligibility and the Flex increase apply to both standalone PA16 components and their combined agreements.
@CompileStatic
final class Pa16AgreementRules {
    private static final LocalDate PA16_FLEX_INCREASE = LocalDate.of(2026, 10, 1)

    static boolean pa16IEligible(ContributionInput input) { age(input) < 69d || input.continueAfter69() }
    static boolean pa16IIEligible(ContributionInput input) { age(input) >= 23d && pa16IEligible(input) }

    static double pa16IFlex(ContributionInput input) {
        input.salary() * (input.date().isBefore(PA16_FLEX_INCREASE) ? .016d : .017d)
    }

    static double pa16IIFlex(ContributionInput input) {
        if (input.birth().year >= 1966) return pa16IFlex(input)
        input.salary() * (input.date().isBefore(PA16_FLEX_INCREASE) ? .006d : .007d)
    }
}
