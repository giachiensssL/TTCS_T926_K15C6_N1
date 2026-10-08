package com.ttcs.ttcsbackend.service;

import com.ttcs.ttcsbackend.dto.TrainingClassRequest;
import com.ttcs.ttcsbackend.dto.TrainingClassResponse;
import com.ttcs.ttcsbackend.dto.TrainingProgramRequest;
import com.ttcs.ttcsbackend.dto.TrainingProgramResponse;
import com.ttcs.ttcsbackend.entity.TrainingClass;
import com.ttcs.ttcsbackend.entity.TrainingProgram;
import com.ttcs.ttcsbackend.repository.TrainingClassRepository;
import com.ttcs.ttcsbackend.repository.TrainingProgramRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TrainingProgramService {

    private final TrainingProgramRepository trainingProgramRepository;
    private final TrainingClassRepository trainingClassRepository;

    public TrainingProgramService(
            TrainingProgramRepository trainingProgramRepository,
            TrainingClassRepository trainingClassRepository) {
        this.trainingProgramRepository = trainingProgramRepository;
        this.trainingClassRepository = trainingClassRepository;
    }

    // Danh sách phân trang và tìm kiếm
    public Page<TrainingProgramResponse> searchPrograms(String keyword, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<TrainingProgram> programs = trainingProgramRepository.search(keyword, status, pageable);
        return programs.map(this::toResponse);
    }

    // Lấy chi tiết theo ID
    public TrainingProgramResponse getProgramById(Long id) {
        TrainingProgram program = trainingProgramRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chương trình đào tạo với ID: " + id));
        return toResponse(program);
    }

    // Khai báo / Tạo mới chương trình đào tạo
    public TrainingProgramResponse createProgram(TrainingProgramRequest request) {
        validateRequest(request);

        String code = request.getCode().trim().toUpperCase();

        // Kiểm tra ràng buộc: Mã chương trình là duy nhất
        if (trainingProgramRepository.existsByCodeIgnoreCase(code)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã chương trình '" + code + "' đã tồn tại trên hệ thống!");
        }

        TrainingProgram program = new TrainingProgram();
        program.setCode(code);
        program.setName(request.getName().trim());
        program.setDescription(request.getDescription());
        program.setTotalDuration(request.getTotalDuration());
        program.setStandardTuition(request.getStandardTuition() != null ? request.getStandardTuition() : BigDecimal.ZERO);
        program.setStatus(request.getStatus() != null && !request.getStatus().isBlank() ? request.getStatus().trim().toUpperCase() : "ACTIVE");

        TrainingProgram saved = trainingProgramRepository.save(program);
        return toResponse(saved);
    }

    // Cập nhật chương trình đào tạo
    public TrainingProgramResponse updateProgram(Long id, TrainingProgramRequest request) {
        validateRequest(request);

        TrainingProgram program = trainingProgramRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chương trình đào tạo với ID: " + id));

        String code = request.getCode().trim().toUpperCase();

        // Kiểm tra ràng buộc: Mã chương trình là duy nhất (không trùng với chương trình khác)
        if (trainingProgramRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã chương trình '" + code + "' đã tồn tại trên hệ thống!");
        }

        program.setCode(code);
        program.setName(request.getName().trim());
        program.setDescription(request.getDescription());
        program.setTotalDuration(request.getTotalDuration());
        program.setStandardTuition(request.getStandardTuition() != null ? request.getStandardTuition() : BigDecimal.ZERO);

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            program.setStatus(request.getStatus().trim().toUpperCase());
        }

        TrainingProgram updated = trainingProgramRepository.save(program);
        return toResponse(updated);
    }

    // Cập nhật trạng thái (Áp dụng / Ngừng áp dụng)
    public TrainingProgramResponse updateStatus(Long id, String status) {
        TrainingProgram program = trainingProgramRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chương trình đào tạo với ID: " + id));

        program.setStatus(status.trim().toUpperCase());
        TrainingProgram updated = trainingProgramRepository.save(program);
        return toResponse(updated);
    }

    // Xoá chương trình đào tạo
    // Ràng buộc nghiệp vụ: Chương trình đang có lớp chạy không được xoá, chỉ được ngừng áp dụng
    public void deleteProgram(Long id) {
        TrainingProgram program = trainingProgramRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chương trình đào tạo với ID: " + id));

        long runningClasses = trainingClassRepository.countByProgramIdAndStatusIgnoreCase(id, "RUNNING");
        if (runningClasses > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Chương trình đang có lớp chạy không được xoá, chỉ được ngừng áp dụng. (Hiện có " + runningClasses + " lớp đang chạy)"
            );
        }

        // Xoá các lớp học liên quan (đã kết thúc/huỷ) trước khi xoá chương trình
        List<TrainingClass> relatedClasses = trainingClassRepository.findByProgramId(id);
        if (!relatedClasses.isEmpty()) {
            trainingClassRepository.deleteAll(relatedClasses);
        }

        trainingProgramRepository.delete(program);
    }

    // Quản lý lớp học của chương trình (Hỗ trợ demo/kiểm thử)
    public List<TrainingClassResponse> getClassesByProgramId(Long programId) {
        if (!trainingProgramRepository.existsById(programId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chương trình đào tạo.");
        }
        return trainingClassRepository.findByProgramId(programId).stream()
                .map(this::toClassResponse)
                .collect(Collectors.toList());
    }

    public TrainingClassResponse addClassToProgram(Long programId, TrainingClassRequest request) {
        TrainingProgram program = trainingProgramRepository.findById(programId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chương trình đào tạo."));

        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã lớp học không được để trống.");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên lớp học không được để trống.");
        }

        String classCode = request.getCode().trim().toUpperCase();
        if (trainingClassRepository.existsByCodeIgnoreCase(classCode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã lớp học '" + classCode + "' đã tồn tại!");
        }

        TrainingClass trainingClass = new TrainingClass();
        trainingClass.setCode(classCode);
        trainingClass.setName(request.getName().trim());
        trainingClass.setStatus(request.getStatus() != null && !request.getStatus().isBlank() ? request.getStatus().trim().toUpperCase() : "RUNNING");
        trainingClass.setProgram(program);

        TrainingClass saved = trainingClassRepository.save(trainingClass);
        return toClassResponse(saved);
    }

    public TrainingClassResponse updateClassStatus(Long classId, String status) {
        TrainingClass trainingClass = trainingClassRepository.findById(classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lớp học."));

        trainingClass.setStatus(status.trim().toUpperCase());
        TrainingClass saved = trainingClassRepository.save(trainingClass);
        return toClassResponse(saved);
    }

    public void deleteClass(Long classId) {
        if (!trainingClassRepository.existsById(classId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lớp học.");
        }
        trainingClassRepository.deleteById(classId);
    }

    // Helper kiểm tra dữ liệu đầu vào
    private void validateRequest(TrainingProgramRequest request) {
        if (request.getCode() == null || request.getCode().trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã chương trình không được để trống.");
        }
        if (request.getName() == null || request.getName().trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên chương trình không được để trống.");
        }
        if (request.getTotalDuration() != null && request.getTotalDuration() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tổng thời lượng phải là số nguyên dương.");
        }
        if (request.getStandardTuition() != null && request.getStandardTuition().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Học phí chuẩn không được nhỏ hơn 0.");
        }
    }

    // Helper map Entity sang Response DTO
    public TrainingProgramResponse toResponse(TrainingProgram program) {
        long runningClasses = trainingClassRepository.countByProgramIdAndStatusIgnoreCase(program.getId(), "RUNNING");
        long totalClasses = trainingClassRepository.countByProgramId(program.getId());

        return new TrainingProgramResponse(
                program.getId(),
                program.getCode(),
                program.getName(),
                program.getDescription(),
                program.getTotalDuration(),
                program.getStandardTuition(),
                program.getStatus(),
                runningClasses,
                totalClasses,
                program.getCreatedAt(),
                program.getUpdatedAt()
        );
    }

    private TrainingClassResponse toClassResponse(TrainingClass tc) {
        return new TrainingClassResponse(
                tc.getId(),
                tc.getCode(),
                tc.getName(),
                tc.getStatus(),
                tc.getProgram().getId(),
                tc.getProgram().getCode(),
                tc.getProgram().getName(),
                tc.getCreatedAt()
        );
    }
}
