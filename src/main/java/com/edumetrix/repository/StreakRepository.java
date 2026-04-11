// Project note: This file provides data access for current and longest streak records.
// It lets the service update a student’s streak after each activity change.
package com.edumetrix.repository;

import com.edumetrix.domain.Streak;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StreakRepository extends JpaRepository<Streak, String> {
    Optional<Streak> findByStudentId(String studentId);
}
