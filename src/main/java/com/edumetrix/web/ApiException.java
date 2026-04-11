// Project note: This file defines a small HTTP-aware exception used by the Java API layer.
// Controllers and services throw it to return consistent JSON error messages to the frontend.
package com.edumetrix.web;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
