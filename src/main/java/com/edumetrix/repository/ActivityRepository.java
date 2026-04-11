// Project note: This file provides data access for daily activity logs.
// It supports the date-based upsert logic and ordered history queries used across dashboards.
package com.edumetrix.repository;

import com.edumetrix.domain.Activity;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityRepository extends JpaRepository<Activity, String> {
    List<Activity> findByStudentIdOrderByDateAsc(String studentId);
    Optional<Activity> findByStudentIdAndDate(String studentId, LocalDate date);
}
