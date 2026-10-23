package com.ttcs.ttcsbackend.service;

import com.ttcs.ttcsbackend.dto.AccountResponse;
import com.ttcs.ttcsbackend.dto.ImportPreviewResponse;
import com.ttcs.ttcsbackend.dto.ImportRowDto;
import com.ttcs.ttcsbackend.dto.ImportSummaryResponse;
import com.ttcs.ttcsbackend.entity.Account;
import com.ttcs.ttcsbackend.repository.AccountRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class AccountImportService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AccountImportService(
            AccountRepository accountRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    /**
     * Tạo file mẫu Excel (.xlsx) với các cột chuẩn và dữ liệu mẫu hướng dẫn.
     */
    public byte[] generateAccountTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Danh sách tài khoản");
            sheet.setDisplayGridlines(true);

            // Font & Styles
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setFontHeightInPoints((short) 11);

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);

            CellStyle noteStyle = workbook.createCellStyle();
            Font noteFont = workbook.createFont();
            noteFont.setItalic(true);
            noteFont.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
            noteStyle.setFont(noteFont);

            // Header row
            Row headerRow = sheet.createRow(0);
            headerRow.setHeightInPoints(28);

            String[] headers = {
                    "Username (*)",
                    "Email (*)",
                    "Họ và tên (*)",
                    "Vai trò (ADMIN/USER)",
                    "Trạng thái (ACTIVE/INACTIVE)"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Dữ liệu mẫu
            String[][] sampleData = {
                    {"nguyenvana", "nguyenvana@example.com", "Nguyễn Văn A", "USER", "ACTIVE"},
                    {"tranthib", "tranthib@example.com", "Trần Thị B", "ADMIN", "ACTIVE"},
                    {"lequangc", "lequangc@example.com", "Lê Quang C", "USER", "INACTIVE"}
            };

            for (int i = 0; i < sampleData.length; i++) {
                Row row = sheet.createRow(i + 1);
                row.setHeightInPoints(20);
                for (int j = 0; j < sampleData[i].length; j++) {
                    Cell cell = row.createCell(j);
                    cell.setCellValue(sampleData[i][j]);
                    cell.setCellStyle(dataStyle);
                }
            }

            // Sheet 2: Hướng dẫn nhập
            Sheet guideSheet = workbook.createSheet("Hướng dẫn");
            guideSheet.setDisplayGridlines(true);

            Row guideTitleRow = guideSheet.createRow(0);
            Cell guideTitleCell = guideTitleRow.createCell(0);
            guideTitleCell.setCellValue("HƯỚNG DẪN NHẬP DỮ LIỆU TÀI KHOẢN TỪ TỆP");

            String[] rules = {
                    "1. Các cột có dấu (*) là bắt buộc không được để trống.",
                    "2. Username: Viết liền không dấu cách, tối thiểu 3 ký tự, không được trùng với tài khoản đã có.",
                    "3. Email: Phải đúng định dạng email (VD: abc@domain.com) và chưa tồn tại trong hệ thống.",
                    "4. Họ và tên: Nhập đầy đủ họ tên người dùng.",
                    "5. Vai trò: Chỉ chấp nhận 'ADMIN' hoặc 'USER' (để trống mặc định là USER).",
                    "6. Trạng thái: Chỉ chấp nhận 'ACTIVE' hoặc 'INACTIVE' (để trống mặc định là ACTIVE).",
                    "7. Nguyên tắc nhập:",
                    "   - Hệ thống sẽ kiểm tra và hiển thị danh sách xem trước từng dòng.",
                    "   - Các dòng bị lỗi sẽ tự động BỎ QUA, các dòng hợp lệ vẫn sẽ được NHẬP vào hệ thống.",
                    "   - Báo cáo chi tiết kết quả sẽ được hiển thị sau khi hoàn tất."
            };

            for (int i = 0; i < rules.length; i++) {
                Row r = guideSheet.createRow(i + 2);
                Cell c = r.createCell(0);
                c.setCellValue(rules[i]);
            }

            // Auto size columns cho cả 2 sheet
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, Math.max(sheet.getColumnWidth(i) + 1200, 4500));
            }
            guideSheet.autoSizeColumn(0);

            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Đọc và kiểm tra lỗi từng dòng của file (Preview).
     */
    public ImportPreviewResponse previewAndValidate(MultipartFile file) throws Exception {
        List<ImportRowDto> rows = parseAndValidateRows(file);

        int validCount = 0;
        int errorCount = 0;

        for (ImportRowDto row : rows) {
            if (row.isValid()) {
                validCount++;
            } else {
                errorCount++;
            }
        }

        return new ImportPreviewResponse(rows.size(), validCount, errorCount, rows);
    }

    /**
     * Thực hiện nhập các dòng hợp lệ, bỏ qua dòng lỗi và trả về báo cáo tổng kết.
     */
    public ImportSummaryResponse executeImport(MultipartFile file) throws Exception {
        List<ImportRowDto> rows = parseAndValidateRows(file);

        List<AccountResponse> successAccounts = new ArrayList<>();
        List<ImportRowDto> failedRows = new ArrayList<>();

        for (ImportRowDto row : rows) {
            if (!row.isValid()) {
                // Dòng lỗi bị bỏ qua
                failedRows.add(row);
                continue;
            }

            try {
                // Dòng hợp lệ được nhập vào hệ thống
                Account account = new Account();
                account.setUsername(row.getUsername());
                account.setEmail(row.getEmail());
                account.setFullName(row.getFullName());
                account.setRole(row.getRole());
                account.setStatus(row.getStatus());

                String temporaryPassword = UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 10);

                account.setPassword(passwordEncoder.encode(temporaryPassword));

                Account saved = accountRepository.save(account);

                // Gửi email kích hoạt (không để lỗi mail làm hỏng transaction import)
                try {
                    emailService.sendActivationEmail(
                            saved.getEmail(),
                            saved.getUsername(),
                            temporaryPassword);
                } catch (Exception ex) {
                    System.err.println("Không thể gửi email cho " + saved.getEmail() + ": " + ex.getMessage());
                }

                successAccounts.add(new AccountResponse(
                        saved.getId(),
                        saved.getUsername(),
                        saved.getEmail(),
                        saved.getFullName(),
                        saved.getRole(),
                        saved.getStatus()
                ));
            } catch (Exception ex) {
                // Nếu có lỗi phát sinh trong quá trình lưu DB
                row.setValid(false);
                row.getErrors().add("Lỗi khi lưu vào cơ sở dữ liệu: " + ex.getMessage());
                failedRows.add(row);
            }
        }

        int totalRead = rows.size();
        int successCount = successAccounts.size();
        int skippedCount = failedRows.size();

        String message = String.format(
                "Đã hoàn thành nhập dữ liệu! Tổng số: %d dòng. Thành công: %d dòng. Bỏ qua do lỗi: %d dòng.",
                totalRead, successCount, skippedCount);

        return new ImportSummaryResponse(
                totalRead,
                successCount,
                skippedCount,
                message,
                successAccounts,
                failedRows
        );
    }

    /**
     * Phân tích tệp (Excel hoặc CSV) và kiểm tra lỗi từng dòng.
     */
    private List<ImportRowDto> parseAndValidateRows(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn tệp để tải lên.");
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            fileName = "";
        }
        fileName = fileName.toLowerCase();

        List<RawRow> rawRows;
        if (fileName.endsWith(".csv")) {
            rawRows = parseCsv(file.getInputStream());
        } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
            rawRows = parseExcel(file.getInputStream());
        } else {
            throw new IllegalArgumentException("Định dạng tệp không được hỗ trợ. Vui lòng sử dụng tệp .xlsx, .xls hoặc .csv.");
        }

        Set<String> seenUsernames = new HashSet<>();
        Set<String> seenEmails = new HashSet<>();
        List<ImportRowDto> resultRows = new ArrayList<>();

        for (RawRow raw : rawRows) {
            ImportRowDto dto = new ImportRowDto();
            dto.setRowNumber(raw.rowNumber);
            dto.setUsername(raw.username != null ? raw.username.trim() : "");
            dto.setEmail(raw.email != null ? raw.email.trim() : "");
            dto.setFullName(raw.fullName != null ? raw.fullName.trim() : "");

            String roleInput = raw.role != null ? raw.role.trim().toUpperCase() : "";
            if (roleInput.isEmpty()) {
                roleInput = "USER";
            }
            dto.setRole(roleInput);

            String statusInput = raw.status != null ? raw.status.trim().toUpperCase() : "";
            if (statusInput.isEmpty()) {
                statusInput = "ACTIVE";
            }
            dto.setStatus(statusInput);

            List<String> errors = new ArrayList<>();

            // 1. Kiểm tra Username
            if (dto.getUsername().isEmpty()) {
                errors.add("Username không được để trống.");
            } else {
                if (dto.getUsername().contains(" ")) {
                    errors.add("Username không được chứa khoảng trắng.");
                }
                if (dto.getUsername().length() < 3) {
                    errors.add("Username phải có ít nhất 3 ký tự.");
                }
                String usernameLower = dto.getUsername().toLowerCase();
                if (seenUsernames.contains(usernameLower)) {
                    errors.add("Username bị trùng lặp với dòng khác trong tệp.");
                } else {
                    seenUsernames.add(usernameLower);
                }
                if (accountRepository.existsByUsername(dto.getUsername())) {
                    errors.add("Username đã tồn tại trên hệ thống.");
                }
            }

            // 2. Kiểm tra Email
            if (dto.getEmail().isEmpty()) {
                errors.add("Email không được để trống.");
            } else {
                if (!EMAIL_PATTERN.matcher(dto.getEmail()).matches()) {
                    errors.add("Email không đúng định dạng (VD: name@domain.com).");
                }
                String emailLower = dto.getEmail().toLowerCase();
                if (seenEmails.contains(emailLower)) {
                    errors.add("Email bị trùng lặp với dòng khác trong tệp.");
                } else {
                    seenEmails.add(emailLower);
                }
                if (accountRepository.existsByEmail(dto.getEmail())) {
                    errors.add("Email đã tồn tại trên hệ thống.");
                }
            }

            // 3. Kiểm tra Họ và tên
            if (dto.getFullName().isEmpty()) {
                errors.add("Họ và tên không được để trống.");
            }

            // 4. Kiểm tra Vai trò
            if (!dto.getRole().equals("ADMIN") && !dto.getRole().equals("USER")) {
                errors.add("Vai trò không hợp lệ (chỉ chấp nhận 'ADMIN' hoặc 'USER').");
            }

            // 5. Kiểm tra Trạng thái
            if (!dto.getStatus().equals("ACTIVE") && !dto.getStatus().equals("INACTIVE")) {
                errors.add("Trạng thái không hợp lệ (chỉ chấp nhận 'ACTIVE' hoặc 'INACTIVE').");
            }

            dto.setValid(errors.isEmpty());
            dto.setErrors(errors);
            resultRows.add(dto);
        }

        return resultRows;
    }

    private List<RawRow> parseExcel(InputStream is) throws Exception {
        List<RawRow> list = new ArrayList<>();
        DataFormatter formatter = new DataFormatter();

        try (Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) {
                return list;
            }

            int lastRowNum = sheet.getLastRowNum();
            for (int r = 1; r <= lastRowNum; r++) { // Bắt đầu từ dòng 1 (bỏ header ở dòng 0)
                Row row = sheet.getRow(r);
                if (row == null) {
                    continue;
                }

                String username = getCellValue(row.getCell(0), formatter);
                String email = getCellValue(row.getCell(1), formatter);
                String fullName = getCellValue(row.getCell(2), formatter);
                String role = getCellValue(row.getCell(3), formatter);
                String status = getCellValue(row.getCell(4), formatter);

                // Nếu cả dòng đều trống thì bỏ qua
                if (username.isEmpty() && email.isEmpty() && fullName.isEmpty() && role.isEmpty() && status.isEmpty()) {
                    continue;
                }

                list.add(new RawRow(r + 1, username, email, fullName, role, status));
            }
        }
        return list;
    }

    private String getCellValue(Cell cell, DataFormatter formatter) {
        if (cell == null) {
            return "";
        }
        return formatter.formatCellValue(cell).trim();
    }

    private List<RawRow> parseCsv(InputStream is) throws Exception {
        List<RawRow> list = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            String line;
            int lineNumber = 0;
            boolean isFirstLine = true;

            while ((line = reader.readLine()) != null) {
                lineNumber++;
                // Xử lý BOM UTF-8 ở đầu file nếu có
                if (lineNumber == 1 && line.startsWith("\uFEFF")) {
                    line = line.substring(1);
                }

                if (isFirstLine) {
                    isFirstLine = false;
                    continue; // Bỏ qua header
                }

                if (line.trim().isEmpty()) {
                    continue;
                }

                // Tách theo dấu phẩy hoặc chấm phẩy
                String delimiter = line.contains(";") ? ";" : ",";
                String[] tokens = line.split(delimiter, -1);

                String username = tokens.length > 0 ? tokens[0].trim().replaceAll("^\"|\"$", "") : "";
                String email = tokens.length > 1 ? tokens[1].trim().replaceAll("^\"|\"$", "") : "";
                String fullName = tokens.length > 2 ? tokens[2].trim().replaceAll("^\"|\"$", "") : "";
                String role = tokens.length > 3 ? tokens[3].trim().replaceAll("^\"|\"$", "") : "";
                String status = tokens.length > 4 ? tokens[4].trim().replaceAll("^\"|\"$", "") : "";

                if (username.isEmpty() && email.isEmpty() && fullName.isEmpty() && role.isEmpty() && status.isEmpty()) {
                    continue;
                }

                list.add(new RawRow(lineNumber, username, email, fullName, role, status));
            }
        }
        return list;
    }

    private static class RawRow {
        int rowNumber;
        String username;
        String email;
        String fullName;
        String role;
        String status;

        public RawRow(int rowNumber, String username, String email, String fullName, String role, String status) {
            this.rowNumber = rowNumber;
            this.username = username;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
            this.status = status;
        }
    }
}

