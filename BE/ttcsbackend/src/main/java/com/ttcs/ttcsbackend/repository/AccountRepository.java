package com.ttcs.ttcsbackend.repository;

import com.ttcs.ttcsbackend.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByUsernameIgnoreCaseOrEmailIgnoreCase(String username, String email);

    long countByRoleIgnoreCaseAndStatusIgnoreCase(String role, String status);

    Page<Account> findByUsernameContainingIgnoreCaseAndRoleContainingIgnoreCaseAndStatusContainingIgnoreCase(
            String username,
            String role,
            String status,
            Pageable pageable);
}