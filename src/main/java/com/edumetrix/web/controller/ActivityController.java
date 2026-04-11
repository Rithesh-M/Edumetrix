// Project note: This file handles activity history reads and day-log saves for students.
// It performs the by-date update-or-create behavior required to prevent duplicate log rows.
package com.edumetrix.web.controller;

import com.edumetrix.domain.Activity;
import com.edumetrix.domain.UserRole;
import com.edumetrix.repository.ActivityRepository;
import com.edumetrix.service.AuthService;
import com.edumetrix.service.StreakService;
import com.edumetrix.web.ApiException;
import com.edumetrix.web.ApiMapper;
import com.edumetrix.web.request.ActivityRequest;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final AuthService authService;
    private final ActivityRepository activityRepository;
    private final StreakService streakService;

    public ActivityController(AuthService authService, ActivityRepository activityRepository, StreakService streakService) {
        this.authService = authService;
        this.activityRepository = activityRepository;
        this.streakService = streakService;
    }

    @GetMapping
    public Map<String, Object> listActivities(HttpServletRequest request) {
        var currentUser = authService.requireUser(request);
        List<Map<String, Object>> activities = activityRepository.findByStudentIdOrderByDateAsc(currentUser.id()).stream()
            .map(ApiMapper::activity)
            .toList();
        return Map.of("activities", activities);
    }

    @PostMapping
    @Transactional
    public Map<String, Object> saveActivity(HttpServletRequest request, @RequestBody ActivityRequest activityRequest) {
        var currentUser = authService.requireUser(request);
        authService.requireRole(currentUser, UserRole.student, UserRole.admin);

        if (activityRequest.date() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A valid date is required.");
        }

        Activity activity = activityRepository.findByStudentIdAndDate(currentUser.id(), activityRequest.date())
            .orElseGet(() -> {
                Activity created = new Activity();
                created.setId(UUID.randomUUID().toString());
                created.setStudentId(currentUser.id());
                created.setDate(activityRequest.date());
                return created;
            });

        activity.setStudyHours(valueOrZero(activityRequest.studyHours()));
        activity.setAssignmentsCompleted(integerOrZero(activityRequest.assignmentsCompleted()));
        activity.setCodingPracticeHours(valueOrZero(activityRequest.codingPracticeHours()));
        activity.setExerciseMinutes(integerOrZero(activityRequest.exerciseMinutes()));
        activity.setProductivityScore(valueOrZero(activityRequest.productivityScore()));
        activity.setNotes(blankToNull(activityRequest.notes()));

        Activity savedActivity = activityRepository.save(activity);
        var streak = streakService.recalculate(currentUser.id());

        return Map.of(
            "message", "Activity saved successfully.",
            "activity", ApiMapper.activity(savedActivity),
            "streak", ApiMapper.streak(streak)
        );
    }

    private BigDecimal valueOrZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private Integer integerOrZero(Integer value) {
        return value == null ? 0 : value;
    }

    private String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }
}
