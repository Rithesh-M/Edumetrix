// Project note: This file maps the daily student activity table used for the main logging workflow.
// It stores one day-log per student per date so activity saves can update instead of duplicating records.
package com.edumetrix.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "activities", uniqueConstraints = {
    @UniqueConstraint(name = "uq_activities_student_date", columnNames = {"student_id", "date"})
})
public class Activity {

    @Id
    private String id;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "study_hours", nullable = false, precision = 4, scale = 1)
    private BigDecimal studyHours = BigDecimal.ZERO;

    @Column(name = "assignments_completed", nullable = false)
    private Integer assignmentsCompleted = 0;

    @Column(name = "coding_practice_hours", nullable = false, precision = 4, scale = 1)
    private BigDecimal codingPracticeHours = BigDecimal.ZERO;

    @Column(name = "exercise_minutes", nullable = false)
    private Integer exerciseMinutes = 0;

    @Column(name = "productivity_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal productivityScore = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public BigDecimal getStudyHours() {
        return studyHours;
    }

    public void setStudyHours(BigDecimal studyHours) {
        this.studyHours = studyHours;
    }

    public Integer getAssignmentsCompleted() {
        return assignmentsCompleted;
    }

    public void setAssignmentsCompleted(Integer assignmentsCompleted) {
        this.assignmentsCompleted = assignmentsCompleted;
    }

    public BigDecimal getCodingPracticeHours() {
        return codingPracticeHours;
    }

    public void setCodingPracticeHours(BigDecimal codingPracticeHours) {
        this.codingPracticeHours = codingPracticeHours;
    }

    public Integer getExerciseMinutes() {
        return exerciseMinutes;
    }

    public void setExerciseMinutes(Integer exerciseMinutes) {
        this.exerciseMinutes = exerciseMinutes;
    }

    public BigDecimal getProductivityScore() {
        return productivityScore;
    }

    public void setProductivityScore(BigDecimal productivityScore) {
        this.productivityScore = productivityScore;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
