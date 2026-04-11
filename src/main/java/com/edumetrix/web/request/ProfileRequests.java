// Project note: This file groups request payloads used by the profile endpoints.
// It captures editable profile fields and the student-to-parent linking code.
package com.edumetrix.web.request;

public final class ProfileRequests {

    private ProfileRequests() {
    }

    public record UpdateProfileRequest(
        String name,
        String nickname,
        String bio,
        String gender,
        String pronouns
    ) {
    }

    public record LinkParentRequest(String parentCode) {
    }
}
