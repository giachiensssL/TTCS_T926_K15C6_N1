package com.ttcs.ttcsbackend.repository;

import com.ttcs.ttcsbackend.entity.AccountStatusChange;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountStatusChangeRepository extends JpaRepository<AccountStatusChange, Long> {
}
