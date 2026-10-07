package com.ttcs.ttcsbackend.service;

import com.ttcs.ttcsbackend.entity.Account;
import com.ttcs.ttcsbackend.repository.AccountRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AccountService(
            AccountRepository accountRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {

        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
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
        existing.setStatus(account.getStatus());

        return accountRepository.save(existing);
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