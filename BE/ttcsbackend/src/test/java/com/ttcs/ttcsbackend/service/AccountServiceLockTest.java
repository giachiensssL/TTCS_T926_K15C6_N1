package com.ttcs.ttcsbackend.service;

import com.ttcs.ttcsbackend.entity.Account;
import com.ttcs.ttcsbackend.entity.AccountStatusChange;
import com.ttcs.ttcsbackend.repository.AccountRepository;
import com.ttcs.ttcsbackend.repository.AccountStatusChangeRepository;
import com.ttcs.ttcsbackend.repository.TrainingClassRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountServiceLockTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @Mock
    private AccountStatusChangeRepository statusChangeRepository;

    @Mock
    private TrainingClassRepository trainingClassRepository;

    @InjectMocks
    private AccountService accountService;

    @Test
    void lockAccountRequiresReasonAndRecordsActor() {
        Account admin = account(1L, "admin", "ADMIN", "ACTIVE");
        Account staff = account(2L, "staff", "USER", "ACTIVE");
        when(accountRepository.findById(2L)).thenReturn(Optional.of(staff));
        when(accountRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("admin", "admin"))
                .thenReturn(Optional.of(admin));

        Account locked = accountService.lockAccount(2L, "admin", "  Nhân sự nghỉ việc  ");

        assertEquals("LOCKED", locked.getStatus());
        assertEquals("Nhân sự nghỉ việc", locked.getLockReason());
        assertNotNull(locked.getLockedAt());
        verify(accountRepository).save(staff);

        ArgumentCaptor<AccountStatusChange> auditCaptor =
                ArgumentCaptor.forClass(AccountStatusChange.class);
        verify(statusChangeRepository).save(auditCaptor.capture());
        assertEquals(2L, auditCaptor.getValue().getAccountId());
        assertEquals(1L, auditCaptor.getValue().getActorAccountId());
        assertEquals("LOCK", auditCaptor.getValue().getAction());
        assertEquals("Nhân sự nghỉ việc", auditCaptor.getValue().getReason());
    }

    @Test
    void lockAccountRejectsBlankReason() {
        assertThrows(IllegalArgumentException.class,
                () -> accountService.lockAccount(2L, "admin", "   "));

        verify(accountRepository, never()).save(any(Account.class));
        verify(statusChangeRepository, never()).save(any(AccountStatusChange.class));
    }

    @Test
    void lockAccountCannotLockLastActiveAdministrator() {
        Account actor = account(1L, "admin-one", "ADMIN", "ACTIVE");
        Account target = account(2L, "admin-two", "ADMIN", "ACTIVE");
        when(accountRepository.findById(2L)).thenReturn(Optional.of(target));
        when(accountRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("admin-one", "admin-one"))
                .thenReturn(Optional.of(actor));
        when(accountRepository.countByRoleIgnoreCaseAndStatusIgnoreCase("ADMIN", "ACTIVE"))
                .thenReturn(1L);

        assertThrows(IllegalStateException.class,
                () -> accountService.lockAccount(2L, "admin-one", "Nghỉ việc"));

        verify(accountRepository, never()).save(any(Account.class));
        verify(statusChangeRepository, never()).save(any(AccountStatusChange.class));
    }

    @Test
    void unlockAccountClearsLockDetailsAndRecordsAudit() {
        Account admin = account(1L, "admin", "ADMIN", "ACTIVE");
        Account staff = account(2L, "staff", "USER", "LOCKED");
        staff.setLockReason("Nghỉ việc");
        staff.setLockedAt(java.time.Instant.now());
        when(accountRepository.findById(2L)).thenReturn(Optional.of(staff));
        when(accountRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("admin", "admin"))
                .thenReturn(Optional.of(admin));

        Account unlocked = accountService.unlockAccount(2L, "admin");

        assertEquals("ACTIVE", unlocked.getStatus());
        assertNull(unlocked.getLockReason());
        assertNull(unlocked.getLockedAt());
        verify(accountRepository).save(staff);
        verify(statusChangeRepository).save(any(AccountStatusChange.class));
    }

    private static Account account(Long id, String username, String role, String status) {
        Account account = new Account();
        account.setId(id);
        account.setUsername(username);
        account.setRole(role);
        account.setStatus(status);
        return account;
    }
}
