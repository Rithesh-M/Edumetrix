// Project note: This file exposes goal CRUD endpoints for the Java backend.
// It keeps the existing goals page behavior by returning the same goal JSON field names.
package com.edumetrix.web.controller;

import com.edumetrix.domain.Goal;
import com.edumetrix.domain.UserRole;
import com.edumetrix.repository.GoalRepository;
import com.edumetrix.service.AuthService;
import com.edumetrix.web.ApiException;
import com.edumetrix.web.ApiMapper;
import com.edumetrix.web.request.GoalRequests.CreateGoalRequest;
import com.edumetrix.web.request.GoalRequests.UpdateGoalRequest;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final AuthService authService;
    private final GoalRepository goalRepository;

    public GoalController(AuthService authService, GoalRepository goalRepository) {
        this.authService = authService;
        this.goalRepository = goalRepository;
    }

    @GetMapping
    public Map<String, Object> listGoals(HttpServletRequest request) {
        var currentUser = authService.requireUser(request);
        List<Map<String, Object>> goals = goalRepository.findByStudentIdOrderByCreatedAtDesc(currentUser.id()).stream()
            .map(ApiMapper::goal)
            .toList();
        return Map.of("goals", goals);
    }

    @PostMapping
    @Transactional
    public Map<String, Object> createGoal(HttpServletRequest request, @RequestBody CreateGoalRequest createGoalRequest) {
        var currentUser = authService.requireUser(request);
        authService.requireRole(currentUser, UserRole.student, UserRole.admin);

        String title = createGoalRequest.title() == null ? "" : createGoalRequest.title().trim();
        if (title.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A goal title is required.");
        }

        Goal goal = new Goal();
        goal.setId(UUID.randomUUID().toString());
        goal.setStudentId(currentUser.id());
        goal.setTitle(title);
        goal.setDescription(blankToNull(createGoalRequest.description()));
        goal.setTargetValue(createGoalRequest.targetValue() == null ? BigDecimal.valueOf(100) : createGoalRequest.targetValue());
        goal.setDeadline(createGoalRequest.deadline());

        Goal savedGoal = goalRepository.save(goal);
        return Map.of("goal", ApiMapper.goal(savedGoal), "message", "Goal created successfully.");
    }

    @PatchMapping("/{goalId}")
    @Transactional
    public Map<String, Object> updateGoal(
        HttpServletRequest request,
        @PathVariable String goalId,
        @RequestBody UpdateGoalRequest updateGoalRequest
    ) {
        var currentUser = authService.requireUser(request);
        authService.requireRole(currentUser, UserRole.student, UserRole.admin);

        Goal goal = goalRepository.findByIdAndStudentId(goalId, currentUser.id())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Goal was not found."));
        goal.setIsCompleted(Boolean.TRUE.equals(updateGoalRequest.isCompleted()));
        Goal savedGoal = goalRepository.save(goal);
        return Map.of("goal", ApiMapper.goal(savedGoal));
    }

    @DeleteMapping("/{goalId}")
    @Transactional
    public Map<String, String> deleteGoal(HttpServletRequest request, @PathVariable String goalId) {
        var currentUser = authService.requireUser(request);
        authService.requireRole(currentUser, UserRole.student, UserRole.admin);

        Goal goal = goalRepository.findByIdAndStudentId(goalId, currentUser.id())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Goal was not found."));
        goalRepository.delete(goal);
        return Map.of("message", "Goal deleted successfully.");
    }

    private String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }
}
