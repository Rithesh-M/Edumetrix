// Project note: This file converts Hibernate entities into JSON-friendly maps with the exact field names expected by the UI.
// It preserves the existing frontend contract so the static bundle can keep working unchanged.
package com.edumetrix.web;

import com.edumetrix.domain.Activity;
import com.edumetrix.domain.Goal;
import com.edumetrix.domain.Profile;
import com.edumetrix.domain.Streak;
import com.edumetrix.domain.SubjectSlot;
import com.edumetrix.domain.UserAccount;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

public final class ApiMapper {

    private ApiMapper() {
    }

    public static Map<String, Object> user(UserAccount userAccount, Profile profile) {
        Map<String, Object> values = new LinkedHashMap<>();
        values.put("id", userAccount.getId());
        values.put("email", userAccount.getEmail());
        values.put("name", profile.getName());
        values.put("role", userAccount.getRole().name());
        return values;
    }

    public static Map<String, Object> profile(Profile profile, UserAccount userAccount) {
        Map<String, Object> values = new LinkedHashMap<>();
        values.put("user_id", profile.getUserId());
        values.put("name", profile.getName());
        values.put("email", profile.getEmail());
        values.put("gender", profile.getGender());
        values.put("nickname", profile.getNickname());
        values.put("bio", profile.getBio());
        values.put("pronouns", profile.getPronouns());
        values.put("parent_id", profile.getParentId());
        values.put("role", userAccount.getRole().name());
        return values;
    }

    public static Map<String, Object> parentStudent(Profile profile) {
        Map<String, Object> values = new LinkedHashMap<>();
        values.put("id", profile.getId());
        values.put("user_id", profile.getUserId());
        values.put("name", profile.getName());
        values.put("email", profile.getEmail());
        values.put("parent_id", profile.getParentId());
        return values;
    }

    public static Map<String, Object> activity(Activity activity) {
        Map<String, Object> values = new LinkedHashMap<>();
        values.put("id", activity.getId());
        values.put("student_id", activity.getStudentId());
        values.put("date", activity.getDate());
        values.put("study_hours", decimal(activity.getStudyHours()));
        values.put("assignments_completed", activity.getAssignmentsCompleted());
        values.put("coding_practice_hours", decimal(activity.getCodingPracticeHours()));
        values.put("exercise_minutes", activity.getExerciseMinutes());
        values.put("productivity_score", decimal(activity.getProductivityScore()));
        values.put("notes", activity.getNotes());
        return values;
    }

    public static Map<String, Object> streak(Streak streak) {
        if (streak == null) {
            return null;
        }

        Map<String, Object> values = new LinkedHashMap<>();
        values.put("id", streak.getId());
        values.put("student_id", streak.getStudentId());
        values.put("current_streak", streak.getCurrentStreak());
        values.put("longest_streak", streak.getLongestStreak());
        values.put("last_active_date", streak.getLastActiveDate());
        return values;
    }

    public static Map<String, Object> goal(Goal goal) {
        Map<String, Object> values = new LinkedHashMap<>();
        values.put("id", goal.getId());
        values.put("student_id", goal.getStudentId());
        values.put("title", goal.getTitle());
        values.put("description", goal.getDescription());
        values.put("target_value", decimal(goal.getTargetValue()));
        values.put("current_value", decimal(goal.getCurrentValue()));
        values.put("goal_type", goal.getGoalType());
        values.put("deadline", goal.getDeadline());
        values.put("is_completed", goal.getIsCompleted());
        values.put("created_at", goal.getCreatedAt());
        return values;
    }

    public static Map<String, Object> subjectSlot(SubjectSlot subjectSlot) {
        Map<String, Object> values = new LinkedHashMap<>();
        values.put("id", subjectSlot.getId());
        values.put("student_id", subjectSlot.getStudentId());
        values.put("subject_name", subjectSlot.getSubjectName());
        values.put("allocated_hours", decimal(subjectSlot.getAllocatedHours()));
        values.put("actual_hours", decimal(subjectSlot.getActualHours()));
        values.put("date", subjectSlot.getDate());
        values.put("created_at", subjectSlot.getCreatedAt());
        return values;
    }

    private static BigDecimal decimal(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value.stripTrailingZeros();
    }
}
