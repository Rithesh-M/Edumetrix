// Project note: This file provides Hibernate-backed data access for user accounts.
// It supports auth lookups by email and identity checks by user id.
package com.edumetrix.repository;

import com.edumetrix.domain.UserAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, String> {
    Optional<UserAccount> findByEmail(String email);
}
