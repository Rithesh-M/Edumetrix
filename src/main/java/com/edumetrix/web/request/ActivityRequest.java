// Project note: This file defines the request payload for saving a student day-log entry.
// It carries the same fields the current UI already posts when a user saves or updates a date.
package com.edumetrix.web.request;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ActivityRequest(
    LocalDate date,
    BigDecimal studyHours,
    Integer assignmentsCompleted,
    BigDecimal codingPracticeHours,
    Integer exerciseMinutes,
    BigDecimal productivityScore,
    String notes
) {
}
