// Project note: This file signs and verifies bearer tokens for the Java API.
// It replaces the previous Node token logic with a built-in HMAC-based token format.
package com.edumetrix.service;

import com.edumetrix.domain.UserRole;
import com.edumetrix.web.ApiException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class AuthTokenService {

    private final ObjectMapper objectMapper;
    private final String secret;

    public AuthTokenService(ObjectMapper objectMapper, @Value("${app.auth.secret}") String secret) {
        this.objectMapper = objectMapper;
        this.secret = secret;
    }

    public String sign(AuthenticatedUser authenticatedUser) {
        try {
            String payload = objectMapper.writeValueAsString(authenticatedUser);
            String encodedPayload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payload.getBytes(StandardCharsets.UTF_8));
            String signature = signValue(encodedPayload);
            return encodedPayload + "." + signature;
        } catch (JsonProcessingException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to generate authentication token.");
        }
    }

    public AuthenticatedUser verify(String token) {
        if (token == null || !token.contains(".")) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }

        String[] parts = token.split("\\.", 2);
        String payload = parts[0];
        String signature = parts[1];
        String expectedSignature = signValue(payload);

        if (!signature.equals(expectedSignature)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }

        try {
            String decodedPayload = new String(Base64.getUrlDecoder().decode(payload), StandardCharsets.UTF_8);
            return objectMapper.readValue(decodedPayload, AuthenticatedUser.class);
        } catch (Exception exception) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
    }

    private String signValue(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to sign authentication token.");
        }
    }

    public record AuthenticatedUser(String id, String email, String name, UserRole role) {
    }
}
