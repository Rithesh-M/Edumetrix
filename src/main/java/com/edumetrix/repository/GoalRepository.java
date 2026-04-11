// Project note: This file provides data access for goals shown on the goals page and dashboards.
// It supports student-scoped goal reads, updates, and deletion.
package com.edumetrix.repository;

import com.edumetrix.domain.Goal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoalRepository extends JpaRepository<Goal, String> {
    List<Goal> findByStudentIdOrderByCreatedAtDesc(String studentId);
    Optional<Goal> findByIdAndStudentId(String id, String studentId);
}
