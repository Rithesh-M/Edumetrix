// Project note: This file provides a tiny health endpoint for Render checks and quick backend verification.
// It lets deployments confirm that the Spring Boot app has started successfully.
package com.edumetrix.web.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public Map<String, Boolean> health() {
        return Map.of("ok", true);
    }
}
