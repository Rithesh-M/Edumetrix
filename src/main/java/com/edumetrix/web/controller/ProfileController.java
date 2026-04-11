// Project note: This file handles profile reads, profile updates, and student-parent linking.
// It keeps the profile page working with the same field names and success/error behavior.
package com.edumetrix.web.controller;

import com.edumetrix.domain.UserRole;
import com.edumetrix.repository.ProfileRepository;
import com.edumetrix.service.AuthService;
import com.edumetrix.web.ApiException;
import com.edumetrix.web.ApiMapper;
import com.edumetrix.web.request.ProfileRequests.LinkParentRequest;
import com.edumetrix.web.request.ProfileRequests.UpdateProfileRequest;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final AuthService authService;
    private final ProfileRepository profileRepository;

    public ProfileController(AuthService authService, ProfileRepository profileRepository) {
        this.authService = authService;
        this.profileRepository = profileRepository;
    }

    @GetMapping
    public Map<String, Object> getProfile(HttpServletRequest request) {
        var currentUser = authService.requireUser(request);
        var account = authService.requireAccount(currentUser.id());
        var profile = authService.requireProfile(currentUser.id());
        return Map.of("profile", ApiMapper.profile(profile, account));
    }

    @PutMapping
    public Map<String, Object> updateProfile(HttpServletRequest request, @RequestBody UpdateProfileRequest updateProfileRequest) {
        var currentUser = authService.requireUser(request);
        var account = authService.requireAccount(currentUser.id());
        var profile = authService.requireProfile(currentUser.id());

        profile.setName(valueOrDefault(updateProfileRequest.name(), profile.getName()));
        profile.setNickname(blankToNull(updateProfileRequest.nickname()));
        profile.setBio(blankToNull(updateProfileRequest.bio()));
        profile.setGender(blankToNull(updateProfileRequest.gender()));
        profile.setPronouns(blankToNull(updateProfileRequest.pronouns()));
        profileRepository.save(profile);

        return Map.of(
            "message", "Profile updated successfully.",
            "profile", ApiMapper.profile(profile, account)
        );
    }

    @PostMapping("/link-parent")
    public Map<String, String> linkParent(HttpServletRequest request, @RequestBody LinkParentRequest linkParentRequest) {
        var currentUser = authService.requireUser(request);
        authService.requireRole(currentUser, UserRole.student, UserRole.admin);

        String parentCode = linkParentRequest.parentCode() == null ? "" : linkParentRequest.parentCode().trim();
        if (parentCode.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A parent code is required.");
        }

        var parentAccount = authService.requireAccount(parentCode);
        if (parentAccount.getRole() != UserRole.parent) {
            throw new ApiException(HttpStatus.NOT_FOUND, "That parent code was not found.");
        }

        var profile = authService.requireProfile(currentUser.id());
        profile.setParentId(parentCode);
        profileRepository.save(profile);

        return Map.of("message", "Parent linked successfully.");
    }

    private String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private String valueOrDefault(String value, String defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        String trimmed = value.trim();
        return trimmed.isBlank() ? defaultValue : trimmed;
    }
}
