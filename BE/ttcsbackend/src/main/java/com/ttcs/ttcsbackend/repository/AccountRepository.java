package com.ttcs.ttcsbackend.repository;

import com.ttcs.ttcsbackend.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, Long> {

    Page<Account> findByUsernameContainingIgnoreCaseAndRoleContainingIgnoreCaseAndStatusContainingIgnoreCase(
            String username,
            String role,
            String status,
            Pageable pageable);
}