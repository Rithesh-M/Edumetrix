// Project note: This file handles subject slot reads and writes for the Java API.
// It supports the subject planning page and the insight calculations that use recent slot history.
package com.edumetrix.web.controller;

import com.edumetrix.domain.SubjectSlot;
import com.edumetrix.domain.UserRole;
import com.edumetrix.repository.SubjectSlotRepository;
import com.edumetrix.service.AuthService;
import com.edumetrix.web.ApiException;
import com.edumetrix.web.ApiMapper;
import com.edumetrix.web.request.SubjectSlotRequest;
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
@RequestMapping("/api/subject-slots")
public class SubjectSlotController {

    private final AuthService authService;
    private final SubjectSlotRepository subjectSlotRepository;

    public SubjectSlotController(AuthService authService, SubjectSlotRepository subjectSlotRepository) {
        this.authService = authService;
        this.subjectSlotRepository = subjectSlotRepository;
    }

    @GetMapping
    public Map<String, Object> listSubjectSlots(HttpServletRequest request) {
        var currentUser = authService.requireUser(request);
        List<Map<String, Object>> slots = subjectSlotRepository.findTop50ByStudentIdOrderByDateDescCreatedAtDesc(currentUser.id())
            .stream()
            .map(ApiMapper::subjectSlot)
            .toList();
        return Map.of("subjectSlots", slots);
    }

    @PostMapping
    @Transactional
    public Map<String, Object> createSubjectSlot(HttpServletRequest request, @RequestBody SubjectSlotRequest subjectSlotRequest) {
        var currentUser = authService.requireUser(request);
        authService.requireRole(currentUser, UserRole.student, UserRole.admin);

        String subjectName = subjectSlotRequest.subjectName() == null ? "" : subjectSlotRequest.subjectName().trim();
        if (subjectName.isBlank() || subjectSlotRequest.date() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Subject name and date are required.");
        }

        SubjectSlot subjectSlot = new SubjectSlot();
        subjectSlot.setId(UUID.randomUUID().toString());
        subjectSlot.setStudentId(currentUser.id());
        subjectSlot.setSubjectName(subjectName);
        subjectSlot.setAllocatedHours(subjectSlotRequest.allocatedHours() == null ? BigDecimal.ZERO : subjectSlotRequest.allocatedHours());
        subjectSlot.setActualHours(subjectSlotRequest.actualHours() == null ? BigDecimal.ZERO : subjectSlotRequest.actualHours());
        subjectSlot.setDate(subjectSlotRequest.date());

        SubjectSlot savedSubjectSlot = subjectSlotRepository.save(subjectSlot);
        return Map.of("subjectSlot", ApiMapper.subjectSlot(savedSubjectSlot), "message", "Subject slot saved successfully.");
    }
}
