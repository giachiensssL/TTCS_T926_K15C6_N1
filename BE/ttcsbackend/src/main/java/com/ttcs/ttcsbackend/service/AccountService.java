package com.ttcs.ttcsbackend.service;

import com.ttcs.ttcsbackend.entity.Account;
import com.ttcs.ttcsbackend.entity.AccountStatusChange;
import com.ttcs.ttcsbackend.repository.AccountRepository;
import com.ttcs.ttcsbackend.repository.AccountStatusChangeRepository;
import com.ttcs.ttcsbackend.repository.TrainingClassRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AccountStatusChangeRepository statusChangeRepository;
    private final TrainingClassRepository trainingClassRepository;

    public AccountService(
            AccountRepository accountRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            AccountStatusChangeRepository statusChangeRepository,
            TrainingClassRepository trainingClassRepository) {

        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.statusChangeRepository = statusChangeRepository;
        this.trainingClassRepository = trainingClassRepository;
    }

    // Lấy tất cả tài khoản
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    // Lấy tài khoản theo ID
    public Optional<Account> getAccountById(Long id) {
        return accountRepository.findById(id);
    }

    // Phân trang + tìm kiếm + lọc
    public Page<Account> searchAccounts(
            String username,
            String role,
            String status,
            int page) {
        int pageSize = 20;

        Pageable pageable = PageRequest.of(page, pageSize);

        return accountRepository
                .findByUsernameContainingIgnoreCaseAndRoleContainingIgnoreCaseAndStatusContainingIgnoreCase(
                        username,
                        role,
                        status,
                        pageable);
    }

    // Tạo tài khoản mới
    public Account createAccount(Account account) {
        if ("LOCKED".equalsIgnoreCase(account.getStatus())) {
            throw new IllegalArgumentException("Dùng chức năng khóa tài khoản để bắt buộc lưu lý do khóa.");
        }

        // Sinh mật khẩu tạm nếu người dùng không gửi mật khẩu
        String temporaryPassword = account.getPassword();

        if (temporaryPassword == null || temporaryPassword.isBlank()) {
            temporaryPassword = UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 10);
        }

        // Mã hóa mật khẩu trước khi lưu database
        account.setPassword(
                passwordEncoder.encode(temporaryPassword));
        if (account.getStatus() == null || account.getStatus().isBlank()) {
            account.setStatus("ACTIVE");
        }

        Account savedAccount = accountRepository.save(account);

        emailService.sendActivationEmail(
                savedAccount.getEmail(),
                savedAccount.getUsername(),
                temporaryPassword);

        return savedAccount;
    }

    // Cập nhật tài khoản
    public Account updateAccount(Long id, Account account) {

        Optional<Account> existingAccount = accountRepository.findById(id);

        if (existingAccount.isEmpty()) {
            return null;
        }

        Account existing = existingAccount.get();
        if ("LOCKED".equalsIgnoreCase(account.getStatus())
                && !"LOCKED".equalsIgnoreCase(existing.getStatus())) {
            throw new IllegalArgumentException("Dùng chức năng khóa tài khoản để bắt buộc lưu lý do khóa.");
        }

        existing.setUsername(account.getUsername());
        existing.setEmail(account.getEmail());

        // Chỉ mã hóa mật khẩu mới nếu người dùng gửi mật khẩu
        if (account.getPassword() != null
                && !account.getPassword().isBlank()) {

            existing.setPassword(
                    passwordEncoder.encode(account.getPassword()));
        }

        existing.setFullName(account.getFullName());
        existing.setRole(account.getRole());
        if (!"LOCKED".equalsIgnoreCase(existing.getStatus())) {
            existing.setStatus(account.getStatus());
        }

        return accountRepository.save(existing);
    }

    @Transactional
    public Account lockAccount(Long id, String actorUsername, String reason) {
        String normalizedReason = reason == null ? "" : reason.trim();
        if (normalizedReason.isEmpty()) {
            throw new IllegalArgumentException("Lý do khóa tài khoản là bắt buộc.");
        }

        Account target = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Không tìm thấy tài khoản."));
        Account actor = accountRepository
                .findByUsernameIgnoreCaseOrEmailIgnoreCase(actorUsername, actorUsername)
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy tài khoản quản trị."));

        if (target.getId().equals(actor.getId())) {
            throw new IllegalStateException("Không thể khóa tài khoản đang đăng nhập.");
        }
        if ("LOCKED".equalsIgnoreCase(target.getStatus())) {
            throw new IllegalStateException("Tài khoản đã bị khóa.");
        }
        if ("ADMIN".equalsIgnoreCase(target.getRole())
                && accountRepository.countByRoleIgnoreCaseAndStatusIgnoreCase("ADMIN", "ACTIVE") <= 1) {
            throw new IllegalStateException("Không thể khóa quản trị viên cuối cùng đang hoạt động.");
        }

        Instant now = Instant.now();
        target.setStatus("LOCKED");
        target.setLockReason(normalizedReason);
        target.setLockedAt(now);
        accountRepository.save(target);
        statusChangeRepository.save(new AccountStatusChange(
                target.getId(), actor.getId(), "LOCK", normalizedReason, now));
        return target;
    }

    @Transactional
    public Account unlockAccount(Long id, String actorUsername) {
        Account target = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Không tìm thấy tài khoản."));
        Account actor = accountRepository
                .findByUsernameIgnoreCaseOrEmailIgnoreCase(actorUsername, actorUsername)
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy tài khoản quản trị."));

        if (!"LOCKED".equalsIgnoreCase(target.getStatus())) {
            throw new IllegalStateException("Tài khoản hiện không bị khóa.");
        }

        target.setStatus("ACTIVE");
        target.setLockReason(null);
        target.setLockedAt(null);
        accountRepository.save(target);
        statusChangeRepository.save(new AccountStatusChange(
                target.getId(), actor.getId(), "UNLOCK", "Mở khóa tài khoản", Instant.now()));
        return target;
    }

    public List<String> getClassesToHandover(Long accountId) {
        return trainingClassRepository.findByInstructorIdOrderByName(accountId).stream()
                .map(trainingClass -> trainingClass.getName())
                .toList();
    }

    public static class AccountNotFoundException extends RuntimeException {
        public AccountNotFoundException(String message) {
            super(message);
        }
    }

    // Xóa tài khoản
    public boolean deleteAccount(Long id) {

        if (!accountRepository.existsById(id)) {
            return false;
        }

        accountRepository.deleteById(id);
        return true;
    }
}