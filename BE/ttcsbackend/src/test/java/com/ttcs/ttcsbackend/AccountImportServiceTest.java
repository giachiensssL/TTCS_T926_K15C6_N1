package com.ttcs.ttcsbackend;

import com.ttcs.ttcsbackend.dto.ImportPreviewResponse;
import com.ttcs.ttcsbackend.dto.ImportSummaryResponse;
import com.ttcs.ttcsbackend.entity.Account;
import com.ttcs.ttcsbackend.repository.AccountRepository;
import com.ttcs.ttcsbackend.service.AccountImportService;
import com.ttcs.ttcsbackend.service.EmailService;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AccountImportServiceTest {

    private AccountRepository accountRepository;
    private PasswordEncoder passwordEncoder;
    private EmailService emailService;
    private AccountImportService importService;

    @BeforeEach
    void setUp() {
        accountRepository = Mockito.mock(AccountRepository.class);
        passwordEncoder = Mockito.mock(PasswordEncoder.class);
        emailService = Mockito.mock(EmailService.class);
        importService = new AccountImportService(accountRepository, passwordEncoder, emailService);

        when(passwordEncoder.encode(any())).thenReturn("encodedPassword123");
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> {
            Account acc = invocation.getArgument(0);
            acc.setId(100L);
            return acc;
        });
    }

    @Test
    void testGenerateTemplate() throws IOException {
        byte[] templateBytes = importService.generateAccountTemplate();
        assertNotNull(templateBytes);
        assertTrue(templateBytes.length > 0);
    }

    @Test
    void testPreviewAndValidateCsv_WithValidAndErrorRows() throws Exception {
        // Mock DB: 'existinguser' và 'existing@mail.com' đã tồn tại
        when(accountRepository.existsByUsername("existinguser")).thenReturn(true);
        when(accountRepository.existsByEmail("existing@mail.com")).thenReturn(true);

        String csvContent = "Username,Email,FullName,Role,Status\n"
                // Dòng 2: Hợp lệ
                + "userone,userone@test.com,Nguyễn Văn One,USER,ACTIVE\n"
                // Dòng 3: Lỗi username đã tồn tại
                + "existinguser,unique@test.com,Người Dùng Cũ,USER,ACTIVE\n"
                // Dòng 4: Lỗi email sai định dạng
                + "userthree,invalid-email,Người Dùng Ba,ADMIN,ACTIVE\n"
                // Dòng 5: Lỗi vai trò không hợp lệ
                + "userfour,userfour@test.com,Người Dùng Bốn,SUPERADMIN,ACTIVE\n"
                // Dòng 6: Hợp lệ với admin
                + "adminone,adminone@test.com,Quản Trị Viên,ADMIN,ACTIVE\n";

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.csv",
                "text/csv",
                csvContent.getBytes(StandardCharsets.UTF_8)
        );

        ImportPreviewResponse preview = importService.previewAndValidate(file);

        assertEquals(5, preview.getTotalRows());
        assertEquals(2, preview.getValidCount());
        assertEquals(3, preview.getErrorCount());

        // Kiểm tra dòng 1 trong danh sách (dòng 2 file) - Hợp lệ
        assertTrue(preview.getRows().get(0).isValid());
        assertEquals("userone", preview.getRows().get(0).getUsername());

        // Kiểm tra dòng 2 trong danh sách (dòng 3 file) - Lỗi tồn tại
        assertFalse(preview.getRows().get(1).isValid());
        assertTrue(preview.getRows().get(1).getErrors().get(0).contains("Username đã tồn tại"));

        // Kiểm tra dòng 3 trong danh sách (dòng 4 file) - Lỗi email
        assertFalse(preview.getRows().get(2).isValid());
        assertTrue(preview.getRows().get(2).getErrors().get(0).contains("Email không đúng định dạng"));
    }

    @Test
    void testExecuteImport_SkipErrorsAndImportValid() throws Exception {
        String csvContent = "Username,Email,FullName,Role,Status\n"
                + "valid1,valid1@test.com,Hợp Lệ Một,USER,ACTIVE\n"
                + ",error@test.com,Thiếu Username,USER,ACTIVE\n"
                + "valid2,valid2@test.com,Hợp Lệ Hai,ADMIN,ACTIVE\n";

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "accounts.csv",
                "text/csv",
                csvContent.getBytes(StandardCharsets.UTF_8)
        );

        ImportSummaryResponse summary = importService.executeImport(file);

        assertEquals(3, summary.getTotalRead());
        assertEquals(2, summary.getSuccessCount());
        assertEquals(1, summary.getSkippedCount());
        assertEquals(2, summary.getSuccessAccounts().size());
        assertEquals(1, summary.getFailedRows().size());

        assertEquals("valid1", summary.getSuccessAccounts().get(0).getUsername());
        assertEquals("valid2", summary.getSuccessAccounts().get(1).getUsername());
        assertEquals(3, summary.getFailedRows().get(0).getRowNumber());
    }

    @Test
    void testImportExcelFormat() throws Exception {
        byte[] excelBytes;
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet();
            Row h = sheet.createRow(0);
            h.createCell(0).setCellValue("Username");
            h.createCell(1).setCellValue("Email");
            h.createCell(2).setCellValue("FullName");
            h.createCell(3).setCellValue("Role");
            h.createCell(4).setCellValue("Status");

            Row r1 = sheet.createRow(1);
            r1.createCell(0).setCellValue("exceluser1");
            r1.createCell(1).setCellValue("excel1@example.com");
            r1.createCell(2).setCellValue("Excel User One");
            r1.createCell(3).setCellValue("USER");
            r1.createCell(4).setCellValue("ACTIVE");

            Row r2 = sheet.createRow(2);
            r2.createCell(0).setCellValue("exceluser2");
            r2.createCell(1).setCellValue("invalid-mail-format");
            r2.createCell(2).setCellValue("Excel User Two");
            r2.createCell(3).setCellValue("USER");
            r2.createCell(4).setCellValue("ACTIVE");

            wb.write(bos);
            excelBytes = bos.toByteArray();
        }

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "accounts.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                excelBytes
        );

        ImportSummaryResponse summary = importService.executeImport(file);

        assertEquals(2, summary.getTotalRead());
        assertEquals(1, summary.getSuccessCount());
        assertEquals(1, summary.getSkippedCount());
        assertEquals("exceluser1", summary.getSuccessAccounts().get(0).getUsername());
    }
}

