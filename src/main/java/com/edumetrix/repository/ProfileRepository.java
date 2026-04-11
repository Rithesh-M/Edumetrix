// Project note: This file provides data access for editable profile records and parent-student links.
// It supports profile reads by user and linked-student queries for parent dashboards.
package com.edumetrix.repository;

import com.edumetrix.domain.Profile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, String> {
    Optional<Profile> findByUserId(String userId);
    List<Profile> findByParentIdOrderByNameAscEmailAsc(String parentId);
    Optional<Profile> findByParentIdAndUserId(String parentId, String userId);
}
