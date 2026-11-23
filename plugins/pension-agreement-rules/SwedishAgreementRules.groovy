import dev.cashle.core.i18n.Messages
import dev.cashle.pension.agreement.PensionAgreement.ContributionInput
import dev.cashle.pension.agreement.PensionAgreement.Metadata
import groovy.transform.CompileStatic

import java.time.LocalDate
import java.time.temporal.ChronoUnit

// Shared arithmetic and income-base assumptions for the 2026 Swedish agreement sources.
@CompileStatic
final class SwedishAgreementRules {
    static Closure<Metadata> localized(String id, int minAge, int minYears, int assessmentMonths = 1,
            int remittanceMonths = 1, double firstShare = 1d, String pending = 'openingPendingPremium',
            boolean continueAfter69 = false, String firstSwedish = ' – bundet kapital',
            String firstEnglish = ' – restricted capital') {
        Metadata swedish = new Metadata(id, minAge, minYears, assessmentMonths, remittanceMonths, firstShare,
                firstSwedish, ' – valbar del', pending, continueAfter69)
        Metadata english = new Metadata(id, minAge, minYears, assessmentMonths, remittanceMonths, firstShare,
                firstEnglish, ' – selectable portion', pending, continueAfter69)
        return { String language ->
            language == null || language.isBlank() || Messages.language(language) == 'sv' ? swedish : english
        }
    }

    static double band(double salary, double floor, double ceiling, double rate) {
        Math.max(0d, Math.min(salary, ceiling) - floor) * rate
    }

    static double incomeBase(ContributionInput input) { yearlyIncomeBase(input.date(), input.baseGrowth()) }

    static double yearlyIncomeBase(LocalDate date, double growth) {
        83_400d * Math.pow(1d + growth / 100d, date.year - 2026)
    }

    static double[] thresholds(ContributionInput input, double... multiples) {
        double base = incomeBase(input)
        double[] amounts = new double[multiples.length]
        for (int index = 0; index < multiples.length; index++) amounts[index] = multiples[index] * base
        return amounts
    }

    static double age(ContributionInput input) {
        ChronoUnit.MONTHS.between(input.birth().withDayOfMonth(1), input.date().withDayOfMonth(1)) / 12d
    }

    static double cappedPremium(ContributionInput input, double rate) {
        band(input.salary(), 0d, 30d * incomeBase(input), rate)
    }

    static double uncappedPremium(ContributionInput input, double lowerRate, double upperRate) {
        double threshold = 7.5d * incomeBase(input)
        band(input.salary(), 0d, threshold, lowerRate) + band(input.salary(), threshold, Double.MAX_VALUE, upperRate)
    }
}
