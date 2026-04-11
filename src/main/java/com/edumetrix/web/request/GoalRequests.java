// Project note: This file groups the payloads for creating and updating goals.
// It keeps goal controller inputs explicit and aligned with the UI’s current field names.
package com.edumetrix.web.request;

import java.math.BigDecimal;
import java.time.LocalDate;

public final class GoalRequests {

    private GoalRequests() {
    }

    public record CreateGoalRequest(
        String title,
        String description,
        BigDecimal targetValue,
        LocalDate deadline
    ) {
    }

    public record UpdateGoalRequest(Boolean isCompleted) {
    }
}
