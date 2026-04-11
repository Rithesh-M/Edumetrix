// Project note: This file handles registration, login, token-based request auth, and role checks.
// It is the shared auth entry point used by every secured Java API controller.
package com.edumetrix.service;

import com.edumetrix.domain.Profile;
import com.edumetrix.domain.Streak;
import com.edumetrix.domain.UserAccount;
import com.edumetrix.domain.UserRole;
import com.edumetrix.repository.ProfileRepository;
import com.edumetrix.repository.StreakRepository;
import com.edumetrix.repository.UserAccountRepository;
import com.edumetrix.web.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final ProfileRepository profileRepository;
    private final StreakRepository streakRepository;
    private final PasswordService passwordService;
    private final AuthTokenService authTokenService;

    public AuthService(
        UserAccountRepository userAccountRepository,
        ProfileRepository profileRepository,
        StreakRepository streakRepository,
        PasswordService passwordService,
        AuthTokenService authTokenService
    ) {
        this.userAccountRepository = userAccountRepository;
        this.profileRepository = profileRepository;
        this.streakRepository = streakRepository;
        this.passwordService = passwordService;
        this.authTokenService = authTokenService;
    }

    @Transactional
    public AuthResponse register(String email, String password, String name, UserRole role) {
        String normalizedEmail = normalizeEmail(email);
        String trimmedName = safeTrim(name);

        if (trimmedName.isBlank() || password == null || password.length() < 6 || role == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Name, email, password, and a valid role are required.");
        }

        if (userAccountRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        String userId = UUID.randomUUID().toString();

        UserAccount userAccount = new UserAccount();
        userAccount.setId(userId);
        userAccount.setEmail(normalizedEmail);
        userAccount.setPasswordHash(passwordService.hash(password));
        userAccount.setRole(role);
        userAccountRepository.save(userAccount);

        Profile profile = new Profile();
        profile.setId(UUID.randomUUID().toString());
        profile.setUserId(userId);
        profile.setEmail(normalizedEmail);
        profile.setName(trimmedName);
        profileRepository.save(profile);

        Streak streak = new Streak();
        streak.setId(UUID.randomUUID().toString());
        streak.setStudentId(userId);
        streakRepository.save(streak);

        return buildAuthResponse(userAccount, profile);
    }

    public AuthResponse login(String email, String password) {
        String normalizedEmail = normalizeEmail(email);
        UserAccount userAccount = userAccountRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        if (!passwordService.matches(password == null ? "" : password, userAccount.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        Profile profile = profileRepository.findByUserId(userAccount.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Profile record was not found."));

        return buildAuthResponse(userAccount, profile);
    }

    public AuthTokenService.AuthenticatedUser requireUser(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }

        AuthTokenService.AuthenticatedUser principal = authTokenService.verify(authorization.substring(7).trim());
        UserAccount userAccount = userAccountRepository.findById(principal.id())
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required."));
        Profile profile = profileRepository.findByUserId(userAccount.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required."));

        return new AuthTokenService.AuthenticatedUser(
            userAccount.getId(),
            userAccount.getEmail(),
            profile.getName(),
            userAccount.getRole()
        );
    }

    public void requireRole(AuthTokenService.AuthenticatedUser user, UserRole... roles) {
        List<UserRole> allowedRoles = List.of(roles);
        if (!allowedRoles.contains(user.role())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have permission to perform this action.");
        }
    }

    public Profile requireProfile(String userId) {
        return profileRepository.findByUserId(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Profile was not found."));
    }

    public UserAccount requireAccount(String userId) {
        return userAccountRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User account was not found."));
    }

    private AuthResponse buildAuthResponse(UserAccount userAccount, Profile profile) {
        AuthTokenService.AuthenticatedUser principal = new AuthTokenService.AuthenticatedUser(
            userAccount.getId(),
            userAccount.getEmail(),
            profile.getName(),
            userAccount.getRole()
        );

        return new AuthResponse(
            authTokenService.sign(principal),
            principal,
            userAccount.getRole().name()
        );
    }

    private String normalizeEmail(String email) {
        return safeTrim(email).toLowerCase();
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }

    public record AuthResponse(String token, AuthTokenService.AuthenticatedUser user, String role) {
    }
}
