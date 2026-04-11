// Project note: This file provides data access for subject slot history.
// It supports recent slot fetches for the subject page and student insight calculations.
package com.edumetrix.repository;

import com.edumetrix.domain.SubjectSlot;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectSlotRepository extends JpaRepository<SubjectSlot, String> {
    List<SubjectSlot> findTop50ByStudentIdOrderByDateDescCreatedAtDesc(String studentId);
}
