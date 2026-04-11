// Project note: This file bundles student and parent dashboard data into the JSON shapes the UI already uses.
// It collects activities, streaks, goals, linked students, and subject slots for the dashboard screens.
package com.edumetrix.web.controller;

import com.edumetrix.domain.UserRole;
import com.edumetrix.repository.ActivityRepository;
import com.edumetrix.repository.GoalRepository;
import com.edumetrix.repository.ProfileRepository;
import com.edumetrix.repository.StreakRepository;
import com.edumetrix.repository.SubjectSlotRepository;
import com.edumetrix.service.AuthService;
import com.edumetrix.web.ApiException;
import com.edumetrix.web.ApiMapper;
import jakarta.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final AuthService authService;
    private final ActivityRepository activityRepository;
    private final StreakRepository streakRepository;
    private final GoalRepository goalRepository;
    private final SubjectSlotRepository subjectSlotRepository;
    private final ProfileRepository profileRepository;

    public DashboardController(
        AuthService authService,
        ActivityRepository activityRepository,
        StreakRepository streakRepository,
        GoalRepository goalRepository,
        SubjectSlotRepository subjectSlotRepository,
        ProfileRepository profileRepository
    ) {
        this.authService = authService;
        this.activityRepository = activityRepository;
        this.streakRepository = streakRepository;
        this.goalRepository = goalRepository;
        this.subjectSlotRepository = subjectSlotRepository;
        this.profileRepository = profileRepository;
    }

    @GetMapping("/student")
    public Map<String, Object> studentDashboard(HttpServletRequest request) {
        var currentUser = authService.requireUser(request);
        return dashboardForStudent(currentUser.id());
    }

    @GetMapping("/parent/students")
    public Map<String, Object> parentStudents(HttpServletRequest request) {
        var currentUser = authService.requireUser(request);
        authService.requireRole(currentUser, UserRole.parent, UserRole.admin);

        List<Map<String, Object>> students = profileRepository.findByParentIdOrderByNameAscEmailAsc(currentUser.id()).stream()
            .map(ApiMapper::parentStudent)
            .toList();

        return Map.of("students", students);
    }

    @GetMapping("/parent/students/{studentId}")
    public Map<String, Object> parentStudentDashboard(HttpServletRequest request, @PathVariable String studentId) {
        var currentUser = authService.requireUser(request);
        authService.requireRole(currentUser, UserRole.parent, UserRole.admin);

        var linkedProfile = profileRepository.findByParentIdAndUserId(currentUser.id(), studentId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "That student is not linked to this parent account."));

        Map<String, Object> dashboard = dashboardForStudent(studentId);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("student", ApiMapper.parentStudent(linkedProfile));
        response.put("activities", dashboard.get("activities"));
        response.put("streak", dashboard.get("streak"));
        response.put("goals", dashboard.get("goals"));
        response.put("subjectSlots", dashboard.get("subjectSlots"));
        return response;
    }

    private Map<String, Object> dashboardForStudent(String studentId) {
        List<Map<String, Object>> activities = activityRepository.findByStudentIdOrderByDateAsc(studentId).stream()
            .map(ApiMapper::activity)
            .toList();
        List<Map<String, Object>> goals = goalRepository.findByStudentIdOrderByCreatedAtDesc(studentId).stream()
            .map(ApiMapper::goal)
            .toList();
        List<Map<String, Object>> subjectSlots = subjectSlotRepository.findTop50ByStudentIdOrderByDateDescCreatedAtDesc(studentId)
            .stream()
            .map(ApiMapper::subjectSlot)
            .toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("activities", activities);
        response.put("streak", ApiMapper.streak(streakRepository.findByStudentId(studentId).orElse(null)));
        response.put("goals", goals);
        response.put("subjectSlots", subjectSlots);
        return response;
    }
}
