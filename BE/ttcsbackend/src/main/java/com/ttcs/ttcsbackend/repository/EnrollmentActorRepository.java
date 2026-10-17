package com.ttcs.ttcsbackend.repository;

import com.ttcs.ttcsbackend.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/** Isolated to KNJ-71 so AccountRepository owned by another feature need not change. */
public interface EnrollmentActorRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByUsernameIgnoreCase(String username);
}
