package com.ttcs.ttcsbackend.controller;

import com.ttcs.ttcsbackend.dto.AccountResponse;
import com.ttcs.ttcsbackend.dto.ImportPreviewResponse;
import com.ttcs.ttcsbackend.dto.ImportSummaryResponse;
import com.ttcs.ttcsbackend.entity.Account;
import com.ttcs.ttcsbackend.service.AccountImportService;
import com.ttcs.ttcsbackend.service.AccountService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;
    private final AccountImportService accountImportService;

    public AccountController(AccountService accountService, AccountImportService accountImportService) {
        this.accountService = accountService;
        this.accountImportService = accountImportService;
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

    // Tải tệp mẫu Excel
    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        try {
            byte[] fileBytes = accountImportService.generateAccountTemplate();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"mau_nhap_tai_khoan.xlsx\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(fileBytes);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Xem trước và kiểm tra lỗi theo từng dòng
    @PostMapping("/import/preview")
    public ResponseEntity<?> previewImport(@RequestParam("file") MultipartFile file) {
        try {
            ImportPreviewResponse response = accountImportService.previewAndValidate(file);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi xử lý tệp: " + e.getMessage()));
        }
    }

    // Thực hiện nhập dữ liệu: dòng hợp lệ được nhập, dòng lỗi bị bỏ qua, có báo cáo tổng kết
    @PostMapping("/import/execute")
    public ResponseEntity<?> executeImport(@RequestParam("file") MultipartFile file) {
        try {
            ImportSummaryResponse response = accountImportService.executeImport(file);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi nhập dữ liệu: " + e.getMessage()));
        }
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