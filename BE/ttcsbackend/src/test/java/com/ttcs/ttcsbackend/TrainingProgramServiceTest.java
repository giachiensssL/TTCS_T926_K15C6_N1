package com.ttcs.ttcsbackend;

import com.ttcs.ttcsbackend.dto.TrainingClassRequest;
import com.ttcs.ttcsbackend.dto.TrainingProgramRequest;
import com.ttcs.ttcsbackend.dto.TrainingProgramResponse;
import com.ttcs.ttcsbackend.repository.TrainingClassRepository;
import com.ttcs.ttcsbackend.repository.TrainingProgramRepository;
import com.ttcs.ttcsbackend.service.TrainingProgramService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class TrainingProgramServiceTest {

    @Autowired
    private TrainingProgramService trainingProgramService;

    @Autowired
    private TrainingProgramRepository programRepository;

    @Autowired
    private TrainingClassRepository classRepository;

    @BeforeEach
    void setUp() {
        classRepository.deleteAll();
        programRepository.deleteAll();
    }

    @Test
    @DisplayName("Khai báo chương trình đào tạo thành công")
    void testCreateProgramSuccess() {
        TrainingProgramRequest req = new TrainingProgramRequest(
                "CT-NODEJS",
                "Lập trình Node.js Backend",
                "Khóa học Node.js và NestJS",
                100,
                new BigDecimal("7000000"),
                "ACTIVE"
        );

        TrainingProgramResponse response = trainingProgramService.createProgram(req);

        assertNotNull(response.getId());
        assertEquals("CT-NODEJS", response.getCode());
        assertEquals("Lập trình Node.js Backend", response.getName());
        assertEquals(100, response.getTotalDuration());
        assertEquals(new BigDecimal("7000000"), response.getStandardTuition());
        assertEquals("ACTIVE", response.getStatus());
        assertEquals(0, response.getRunningClassesCount());
    }

    @Test
    @DisplayName("Quy tắc: Mã chương trình là duy nhất - Báo lỗi khi tạo mã đã tồn tại")
    void testCreateProgramDuplicateCodeThrowsException() {
        TrainingProgramRequest req1 = new TrainingProgramRequest(
                "CT-DUPLICATE",
                "Chương trình 1",
                "Mô tả 1",
                80,
                new BigDecimal("5000000"),
                "ACTIVE"
        );
        trainingProgramService.createProgram(req1);

        TrainingProgramRequest req2 = new TrainingProgramRequest(
                "CT-DUPLICATE",
                "Chương trình 2 (Trùng mã)",
                "Mô tả 2",
                90,
                new BigDecimal("6000000"),
                "ACTIVE"
        );

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            trainingProgramService.createProgram(req2);
        });

        assertTrue(exception.getReason().contains("đã tồn tại"));
    }

    @Test
    @DisplayName("Quy tắc: Mã chương trình là duy nhất - Báo lỗi khi cập nhật trùng mã chương trình khác")
    void testUpdateProgramDuplicateCodeThrowsException() {
        TrainingProgramResponse p1 = trainingProgramService.createProgram(new TrainingProgramRequest(
                "CODE-01", "Chương trình A", "Mô tả", 60, BigDecimal.ZERO, "ACTIVE"
        ));

        TrainingProgramResponse p2 = trainingProgramService.createProgram(new TrainingProgramRequest(
                "CODE-02", "Chương trình B", "Mô tả", 60, BigDecimal.ZERO, "ACTIVE"
        ));

        // Cập nhật p2 để có mã trùng với p1
        TrainingProgramRequest updateReq = new TrainingProgramRequest(
                "CODE-01", "Chương trình B đổi tên", "Mô tả", 60, BigDecimal.ZERO, "ACTIVE"
        );

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            trainingProgramService.updateProgram(p2.getId(), updateReq);
        });

        assertTrue(exception.getReason().contains("đã tồn tại"));
    }

    @Test
    @DisplayName("Quy tắc: Chương trình đang có lớp chạy KHÔNG được xoá, chỉ được ngừng áp dụng")
    void testDeleteProgramWithRunningClassFails() {
        // Tạo chương trình
        TrainingProgramResponse p = trainingProgramService.createProgram(new TrainingProgramRequest(
                "CT-RUNNING-CHECK",
                "Chương trình có lớp chạy",
                "Mô tả",
                120,
                new BigDecimal("8000000"),
                "ACTIVE"
        ));

        // Thêm lớp đang chạy (RUNNING)
        trainingProgramService.addClassToProgram(p.getId(), new TrainingClassRequest(
                "CLASS-RUNNING-01", "Lớp đang hoạt động", "RUNNING"
        ));

        // Thử xóa -> Phải bị từ chối và ném exception
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            trainingProgramService.deleteProgram(p.getId());
        });

        assertTrue(exception.getReason().contains("Chương trình đang có lớp chạy không được xoá, chỉ được ngừng áp dụng"));

        // Thay vào đó, cho phép chuyển sang trạng thái ngừng áp dụng (INACTIVE)
        TrainingProgramResponse updated = trainingProgramService.updateStatus(p.getId(), "INACTIVE");
        assertEquals("INACTIVE", updated.getStatus());
    }

    @Test
    @DisplayName("Chương trình không có lớp chạy (hoặc lớp đã COMPLETED) thì được phép xoá")
    void testDeleteProgramWithoutRunningClassSuccess() {
        // Tạo chương trình
        TrainingProgramResponse p = trainingProgramService.createProgram(new TrainingProgramRequest(
                "CT-COMPLETED-CHECK",
                "Chương trình có lớp đã kết thúc",
                "Mô tả",
                80,
                new BigDecimal("4000000"),
                "ACTIVE"
        ));

        // Thêm lớp đã kết thúc (COMPLETED)
        trainingProgramService.addClassToProgram(p.getId(), new TrainingClassRequest(
                "CLASS-OLD-01", "Lớp đã hoàn thành", "COMPLETED"
        ));

        // Xóa chương trình -> Thành công không có lỗi
        assertDoesNotThrow(() -> {
            trainingProgramService.deleteProgram(p.getId());
        });

        // Xác nhận đã bị xóa khỏi database
        assertFalse(programRepository.existsById(p.getId()));
    }
}
