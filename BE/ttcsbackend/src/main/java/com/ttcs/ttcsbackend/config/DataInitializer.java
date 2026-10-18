package com.ttcs.ttcsbackend.config;

import com.ttcs.ttcsbackend.entity.CareLog;
import com.ttcs.ttcsbackend.entity.Lead;
import com.ttcs.ttcsbackend.repository.CareLogRepository;
import com.ttcs.ttcsbackend.repository.LeadRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final LeadRepository leadRepository;
    private final CareLogRepository careLogRepository;

    public DataInitializer(LeadRepository leadRepository, CareLogRepository careLogRepository) {
        this.leadRepository = leadRepository;
        this.careLogRepository = careLogRepository;
    }

    @Override
    public void run(String... args) {
        if (leadRepository.count() == 0) {
            LocalDateTime now = LocalDateTime.now();

            // Lead 1: QUÁ HẠN 2 NGÀY (Cần đánh dấu nổi bật)
            Lead lead1 = new Lead(
                    "Nguyễn Văn Hùng",
                    "0912345678",
                    "hung.nguyen@gmail.com",
                    "Lập trình Java Spring Boot chuyên sâu",
                    "Facebook",
                    "INTERESTED",
                    "Tư vấn tuyển sinh",
                    "Băn khoăn về học phí đợt 2 và lịch học vào các buổi tối thứ 2-4-6.",
                    now.minusDays(2).withHour(9).withMinute(30)
            );
            lead1 = leadRepository.save(lead1);

            CareLog log1_1 = new CareLog(
                    lead1,
                    "CALL",
                    "Gọi tư vấn tổng quan lộ trình Java Spring Boot 6 tháng. Học viên rất quan tâm đến cam kết giới thiệu việc làm sau khóa học.",
                    now.minusDays(5).withHour(10).withMinute(15),
                    "Tư vấn tuyển sinh"
            );
            careLogRepository.save(log1_1);

            CareLog log1_2 = new CareLog(
                    lead1,
                    "MESSAGE",
                    "Gửi syllabus chi tiết và bảng học phí qua Zalo. Học viên hứa sẽ bàn với gia đình và hẹn gọi lại sau 3 ngày.",
                    now.minusDays(2).withHour(15).withMinute(0),
                    "Tư vấn tuyển sinh"
            );
            careLogRepository.save(log1_2);

            // Lead 2: QUÁ HẠN HÔM QUA (Cần đánh dấu nổi bật)
            Lead lead2 = new Lead(
                    "Trần Thị Mai Phương",
                    "0987654321",
                    "phuong.tran@gmail.com",
                    "Frontend ReactJS & TypeScript",
                    "Website",
                    "CONTACTED",
                    "Tư vấn tuyển sinh",
                    "Học viên là sinh viên năm cuối, cần học React cấp tốc để làm đồ án tốt nghiệp.",
                    now.minusDays(1).withHour(14).withMinute(0)
            );
            lead2 = leadRepository.save(lead2);

            CareLog log2_1 = new CareLog(
                    lead2,
                    "CALL",
                    "Gọi trao đổi về lớp React khai giảng giữa tháng. Đã hẹn hôm qua gọi lại thông báo lịch test đầu vào nhưng chưa kịp gọi.",
                    now.minusDays(3).withHour(16).withMinute(45),
                    "Tư vấn tuyển sinh"
            );
            careLogRepository.save(log2_1);

            // Lead 3: HÔM NAY CẦN GỌI LẠI
            Lead lead3 = new Lead(
                    "Lê Hoàng Nam",
                    "0934567890",
                    "nam.le@gmail.com",
                    "Fullstack Web Developer",
                    "Zalo",
                    "INTERESTED",
                    "Tư vấn tuyển sinh",
                    "Đã đến trực tiếp trung tâm xem cơ sở vật chất. Hẹn chiều nay gọi chốt ưu đãi học bổng 20%.",
                    now.withHour(14).withMinute(30)
            );
            lead3 = leadRepository.save(lead3);

            CareLog log3_1 = new CareLog(
                    lead3,
                    "MEETING",
                    "Gặp trực tiếp học viên và phụ huynh tại văn phòng tư vấn. Giới thiệu giảng viên và môi trường thực hành phòng Lab.",
                    now.minusDays(1).withHour(11).withMinute(0),
                    "Tư vấn tuyển sinh"
            );
            careLogRepository.save(log3_1);

            // Lead 4: TUẦN SAU (Đúng kịch bản hẹn gọi lại tuần sau)
            Lead lead4 = new Lead(
                    "Phạm Thu Hương",
                    "0901234567",
                    "huong.pham@gmail.com",
                    "Data Analysis with Python & SQL",
                    "Hotline",
                    "NEW",
                    "Tư vấn tuyển sinh",
                    "Khách đang đi công tác Đà Nẵng đến cuối tuần, dặn tuần sau gọi lại vào sáng thứ 3.",
                    now.plusDays(7).withHour(9).withMinute(0)
            );
            lead4 = leadRepository.save(lead4);

            CareLog log4_1 = new CareLog(
                    lead4,
                    "CALL",
                    "Tiếp nhận cuộc gọi từ hotline. Khách quan tâm khóa Data Analyst buổi tối. Đã gửi thông tin qua email và hẹn tuần sau gọi lại.",
                    now.minusHours(3),
                    "Tư vấn tuyển sinh"
            );
            careLogRepository.save(log4_1);

            // Lead 5: MỚI TIẾP NHẬN
            Lead lead5 = new Lead(
                    "Đỗ Quốc Bảo",
                    "0977889900",
                    "bao.do@gmail.com",
                    "DevOps, Docker & CI/CD",
                    "Giới thiệu",
                    "NEW",
                    "Tư vấn tuyển sinh",
                    "Bạn bè giới thiệu. Chưa liên hệ.",
                    null
            );
            leadRepository.save(lead5);

            // Lead 6: QUÁ HẠN 4 NGÀY (Cần đánh dấu nổi bật)
            Lead lead6 = new Lead(
                    "Vũ Hải Đăng",
                    "0945678901",
                    "dang.vu@gmail.com",
                    "Lập trình Java Spring Boot chuyên sâu",
                    "Facebook",
                    "CONTACTED",
                    "Tư vấn tuyển sinh",
                    "Cần gọi lại để tư vấn chính sách đóng học phí theo đợt.",
                    now.minusDays(4).withHour(10).withMinute(0)
            );
            lead6 = leadRepository.save(lead6);

            CareLog log6_1 = new CareLog(
                    lead6,
                    "MESSAGE",
                    "Nhắn tin Facebook tư vấn chính sách chia nhỏ đợt học phí. Khách xin hẹn 4 ngày trước sẽ trả lời.",
                    now.minusDays(5).withHour(13).withMinute(20),
                    "Tư vấn tuyển sinh"
            );
            careLogRepository.save(log6_1);
        }
    }
}
