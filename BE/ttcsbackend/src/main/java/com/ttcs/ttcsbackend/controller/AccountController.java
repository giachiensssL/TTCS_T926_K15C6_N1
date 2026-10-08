package com.ttcs.ttcsbackend.controller;

import com.ttcs.ttcsbackend.dto.AccountResponse;
import com.ttcs.ttcsbackend.entity.Account;
import com.ttcs.ttcsbackend.service.AccountService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    // Phân trang + tìm kiếm + lọc
    @GetMapping
    public ResponseEntity<Page<AccountResponse>> searchAccounts(
            @RequestParam(defaultValue = "") String username,
            @RequestParam(defaultValue = "") String role,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page) {
        Page<Account> accounts = accountService.searchAccounts(username, role, status, page);

        Page<AccountResponse> response = accounts.map(this::toResponse);

        return ResponseEntity.ok(response);
    }

    // Lấy tài khoản theo ID
    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccountById(
            @PathVariable Long id) {
        return accountService.getAccountById(id)
                .map(this::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Tạo tài khoản
    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @RequestBody Account account) {
        // Không cho phép người dùng tự nhập mật khẩu khi tạo tài khoản
        account.setPassword(null);

        Account created = accountService.createAccount(account);

        return ResponseEntity.ok(toResponse(created));
    }

    // Cập nhật tài khoản
    @PutMapping("/{id}")
    public ResponseEntity<AccountResponse> updateAccount(
            @PathVariable Long id,
            @RequestBody Account account) {
        Account updatedAccount = accountService.updateAccount(id, account);

        if (updatedAccount == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(toResponse(updatedAccount));
    }

    // Xóa tài khoản
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(
            @PathVariable Long id) {
        if (!accountService.deleteAccount(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    // Chuyển Account -> AccountResponse
    private AccountResponse toResponse(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getUsername(),
                account.getEmail(),
                account.getFullName(),
                account.getRole(),
                account.getStatus());
    }
}