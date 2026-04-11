// Project note: This file exposes register, login, and current-session endpoints for the static UI.
// It returns the same auth response contract the existing frontend bundle already expects.
package com.edumetrix.web.controller;

import com.edumetrix.service.AuthService;
import com.edumetrix.web.request.AuthRequests.LoginRequest;
import com.edumetrix.web.request.AuthRequests.RegisterRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthService.AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request.email(), request.password(), request.name(), request.role());
    }

    @PostMapping("/login")
    public AuthService.AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.email(), request.password());
    }

    @GetMapping("/me")
    public Map<String, Object> me(HttpServletRequest request) {
        var user = authService.requireUser(request);
        return Map.of("user", user, "role", user.role().name());
    }
}
