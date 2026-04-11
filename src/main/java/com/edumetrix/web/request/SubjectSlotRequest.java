// Project note: This file defines the request payload for saving subject slot entries.
// It mirrors the fields already used by the current subject slot UI.
package com.edumetrix.web.request;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SubjectSlotRequest(
    String subjectName,
    BigDecimal allocatedHours,
    BigDecimal actualHours,
    LocalDate date
) {
}
