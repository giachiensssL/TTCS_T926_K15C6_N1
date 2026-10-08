package com.ttcs.ttcsbackend;

import com.ttcs.ttcsbackend.entity.Account;
import com.ttcs.ttcsbackend.entity.TrainingClass;
import com.ttcs.ttcsbackend.entity.TrainingProgram;
import com.ttcs.ttcsbackend.repository.AccountRepository;
import com.ttcs.ttcsbackend.repository.TrainingClassRepository;
import com.ttcs.ttcsbackend.repository.TrainingProgramRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@SpringBootApplication
public class TtcsBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(TtcsBackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(
            AccountRepository accountRepository,
            TrainingProgramRepository programRepository,
            TrainingClassRepository classRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed sample accounts if empty
            if (accountRepository.count() == 0) {
                Account admin = new Account();
                admin.setUsername("admin");
                admin.setEmail("admin@example.com");
                admin.setFullName("Quản Trị Viên");
                admin.setRole("ADMIN");
                admin.setStatus("ACTIVE");
                admin.setPassword(passwordEncoder.encode("Admin@123"));
                accountRepository.save(admin);

                Account user = new Account();
                user.setUsername("user1");
                user.setEmail("user1@example.com");
                user.setFullName("Nguyễn Văn A");
                user.setRole("USER");
                user.setStatus("ACTIVE");
                user.setPassword(passwordEncoder.encode("User@123"));
                accountRepository.save(user);
            }

            // Seed sample training programs if empty
            if (programRepository.count() == 0) {
                // Chương trình 1: Có lớp đang chạy (RUNNING) -> Khi xoá sẽ bị chặn và báo lỗi
                TrainingProgram p1 = new TrainingProgram(
                        "CT-JAVA-FS",
                        "Lập trình Java Fullstack Web Chuyên Nghiệp",
                        "Khóa học chuyên sâu Java Spring Boot kết hợp React và PostgreSQL.",
                        120,
                        new BigDecimal("8500000"),
                        "ACTIVE"
                );
                TrainingProgram savedP1 = programRepository.save(p1);

                TrainingClass c1 = new TrainingClass("LOP-JAVA-01", "Lớp Java Fullstack Tối 2-4-6", "RUNNING", savedP1);
                classRepository.save(c1);

                // Chương trình 2: Lớp đã kết thúc (COMPLETED) -> Được phép xoá
                TrainingProgram p2 = new TrainingProgram(
                        "CT-REACT-TS",
                        "Phát triển Frontend Hiện Đại với React & TypeScript",
                        "Học chuyên sâu xây dựng Single Page Application với React 19, TypeScript và Vite.",
                        90,
                        new BigDecimal("6000000"),
                        "ACTIVE"
                );
                TrainingProgram savedP2 = programRepository.save(p2);

                TrainingClass c2 = new TrainingClass("LOP-REACT-01", "Lớp React K14", "COMPLETED", savedP2);
                classRepository.save(c2);

                // Chương trình 3: Chưa có lớp nào -> Được phép xoá
                TrainingProgram p3 = new TrainingProgram(
                        "CT-AI-ML",
                        "Khoa học Dữ liệu và Học máy với Python",
                        "Nền tảng trí tuệ nhân tạo, xử lý dữ liệu lớn với Pandas, Scikit-learn và PyTorch.",
                        150,
                        new BigDecimal("12000000"),
                        "ACTIVE"
                );
                programRepository.save(p3);

                // Chương trình 4: Ngừng áp dụng
                TrainingProgram p4 = new TrainingProgram(
                        "CT-LEGACY-PHP",
                        "Lập trình PHP Laravel Cũ",
                        "Chương trình đào tạo phiên bản cũ đã ngừng áp dụng tuyển sinh.",
                        80,
                        new BigDecimal("4500000"),
                        "INACTIVE"
                );
                programRepository.save(p4);
            }
        };
    }
}