// Project note: This file groups the small request payload records used by auth-related endpoints.
// Validation annotations here keep controller code small and make bad requests fail clearly.
package com.edumetrix.web.request;

import com.edumetrix.domain.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class AuthRequests {

    private AuthRequests() {
    }

    public record RegisterRequest(
        @Email @NotBlank String email,
        @Size(min = 6) String password,
        @NotBlank String name,
        @NotNull UserRole role
    ) {
    }

    public record LoginRequest(
        @Email @NotBlank String email,
        @NotBlank String password
    ) {
    }
}
