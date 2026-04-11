// Project note: This file defines the application roles shared across auth, dashboards, and access checks.
// It keeps role values aligned with the frontend behavior for students, parents, and admins.
package com.edumetrix.domain;

public enum UserRole {
    student,
    parent,
    admin
}
