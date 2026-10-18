package com.ttcs.ttcsbackend.service;

import com.ttcs.ttcsbackend.dto.CareLogResponse;
import com.ttcs.ttcsbackend.dto.LeadRequest;
import com.ttcs.ttcsbackend.dto.LeadResponse;
import com.ttcs.ttcsbackend.dto.LeadStatsResponse;
import com.ttcs.ttcsbackend.entity.CareLog;
import com.ttcs.ttcsbackend.entity.Lead;
import com.ttcs.ttcsbackend.repository.CareLogRepository;
import com.ttcs.ttcsbackend.repository.LeadRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LeadService {

    private final LeadRepository leadRepository;
    private final CareLogRepository careLogRepository;

    public LeadService(LeadRepository leadRepository, CareLogRepository careLogRepository) {
        this.leadRepository = leadRepository;
        this.careLogRepository = careLogRepository;
    }

    @Transactional(readOnly = true)
    public Page<LeadResponse> searchLeads(String search, String status, String source, String callbackFilter, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Lead> leadsPage = leadRepository.searchLeads(search, status, source, pageable);

        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();

        List<LeadResponse> responseList = leadsPage.getContent().stream()
                .map(this::toResponse)
                .filter(res -> {
                    if (callbackFilter == null || callbackFilter.trim().isEmpty() || "ALL".equalsIgnoreCase(callbackFilter)) {
                        return true;
                    }
                    if ("OVERDUE".equalsIgnoreCase(callbackFilter)) {
                        return res.isOverdue();
                    }
                    if ("TODAY".equalsIgnoreCase(callbackFilter)) {
                        return "TODAY".equals(res.getCallbackStatus());
                    }
                    if ("UPCOMING".equalsIgnoreCase(callbackFilter)) {
                        return "UPCOMING".equals(res.getCallbackStatus());
                    }
                    if ("NO_SCHEDULE".equalsIgnoreCase(callbackFilter)) {
                        return "NO_SCHEDULE".equals(res.getCallbackStatus());
                    }
                    return true;
                })
                .sorted((a, b) -> {
                    // Prioritize overdue leads at the top!
                    if (a.isOverdue() && !b.isOverdue()) return -1;
                    if (!a.isOverdue() && b.isOverdue()) return 1;
                    if (a.isOverdue() && b.isOverdue()) {
                        // More overdue first
                        if (a.getCallbackDate() != null && b.getCallbackDate() != null) {
                            return a.getCallbackDate().compareTo(b.getCallbackDate());
                        }
                    }
                    return 0;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(responseList, pageable, leadsPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Optional<LeadResponse> getLeadById(Long id) {
        return leadRepository.findById(id).map(this::toResponse);
    }

    @Transactional
    public LeadResponse createLead(LeadRequest request) {
        Lead lead = new Lead();
        lead.setFullName(request.getFullName());
        lead.setPhone(request.getPhone());
        lead.setEmail(request.getEmail());
        lead.setCourseInterest(request.getCourseInterest());
        lead.setSource(request.getSource());
        lead.setStatus(request.getStatus() != null && !request.getStatus().trim().isEmpty() ? request.getStatus() : "NEW");
        lead.setAssignedTo(request.getAssignedTo() != null && !request.getAssignedTo().trim().isEmpty() ? request.getAssignedTo() : "Tư vấn tuyển sinh");
        lead.setNotes(request.getNotes());
        lead.setCallbackDate(request.getCallbackDate());

        Lead saved = leadRepository.save(lead);
        return toResponse(saved);
    }

    @Transactional
    public LeadResponse updateLead(Long id, LeadRequest request) {
        Optional<Lead> optionalLead = leadRepository.findById(id);
        if (optionalLead.isEmpty()) {
            return null;
        }

        Lead lead = optionalLead.get();
        if (request.getFullName() != null) lead.setFullName(request.getFullName());
        if (request.getPhone() != null) lead.setPhone(request.getPhone());
        if (request.getEmail() != null) lead.setEmail(request.getEmail());
        if (request.getCourseInterest() != null) lead.setCourseInterest(request.getCourseInterest());
        if (request.getSource() != null) lead.setSource(request.getSource());
        if (request.getStatus() != null) lead.setStatus(request.getStatus());
        if (request.getAssignedTo() != null) lead.setAssignedTo(request.getAssignedTo());
        if (request.getNotes() != null) lead.setNotes(request.getNotes());
        lead.setCallbackDate(request.getCallbackDate());

        Lead updated = leadRepository.save(lead);
        return toResponse(updated);
    }

    @Transactional
    public LeadResponse scheduleCallback(Long id, LocalDateTime callbackDate, String notes) {
        Optional<Lead> optionalLead = leadRepository.findById(id);
        if (optionalLead.isEmpty()) {
            return null;
        }

        Lead lead = optionalLead.get();
        lead.setCallbackDate(callbackDate);
        if (notes != null && !notes.trim().isEmpty()) {
            String currentNotes = lead.getNotes() != null ? lead.getNotes() + "\n" : "";
            lead.setNotes(currentNotes + "[Lịch gọi lại: " + callbackDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + "] " + notes);
        }

        Lead updated = leadRepository.save(lead);
        return toResponse(updated);
    }

    @Transactional
    public boolean deleteLead(Long id) {
        if (!leadRepository.existsById(id)) {
            return false;
        }
        leadRepository.deleteById(id);
        return true;
    }

    @Transactional(readOnly = true)
    public LeadStatsResponse getStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        long totalLeads = leadRepository.count();
        long overdueCount = leadRepository.countOverdueLeads(now);
        long todayCount = leadRepository.countTodayCallbackLeads(startOfDay, endOfDay);
        long upcomingCount = leadRepository.countUpcomingCallbackLeads(endOfDay);
        long totalInteractions = careLogRepository.count();

        return new LeadStatsResponse(totalLeads, overdueCount, todayCount, upcomingCount, totalInteractions);
    }

    public LeadResponse toResponse(Lead lead) {
        LeadResponse response = new LeadResponse();
        response.setId(lead.getId());
        response.setFullName(lead.getFullName());
        response.setPhone(lead.getPhone());
        response.setEmail(lead.getEmail());
        response.setCourseInterest(lead.getCourseInterest());
        response.setSource(lead.getSource());
        response.setStatus(lead.getStatus());
        response.setAssignedTo(lead.getAssignedTo());
        response.setNotes(lead.getNotes());
        response.setCallbackDate(lead.getCallbackDate());
        response.setCreatedAt(lead.getCreatedAt());
        response.setUpdatedAt(lead.getUpdatedAt());

        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();

        // Calculate Overdue status
        boolean isClosed = "CLOSED_WON".equalsIgnoreCase(lead.getStatus()) || "LOST".equalsIgnoreCase(lead.getStatus());
        boolean isOverdue = false;
        String callbackStatus = "NO_SCHEDULE";
        String overdueDuration = "";

        if (lead.getCallbackDate() != null) {
            LocalDateTime cb = lead.getCallbackDate();
            if (cb.isBefore(now) && !isClosed) {
                isOverdue = true;
                callbackStatus = "OVERDUE";

                long diffDays = ChronoUnit.DAYS.between(cb.toLocalDate(), today);
                if (diffDays > 0) {
                    overdueDuration = "Quá hạn " + diffDays + " ngày";
                } else {
                    long diffHours = Math.max(1, ChronoUnit.HOURS.between(cb, now));
                    overdueDuration = "Quá hạn hôm nay (" + diffHours + " giờ trước)";
                }
            } else if (cb.toLocalDate().isEqual(today)) {
                callbackStatus = "TODAY";
                overdueDuration = "Hôm nay lúc " + cb.format(DateTimeFormatter.ofPattern("HH:mm"));
            } else if (cb.isAfter(now)) {
                callbackStatus = "UPCOMING";
                long diffDays = ChronoUnit.DAYS.between(today, cb.toLocalDate());
                if (diffDays == 1) {
                    overdueDuration = "Ngày mai (" + cb.format(DateTimeFormatter.ofPattern("HH:mm")) + ")";
                } else if (diffDays <= 7) {
                    overdueDuration = "Sau " + diffDays + " ngày (" + cb.format(DateTimeFormatter.ofPattern("dd/MM")) + ")";
                } else {
                    overdueDuration = cb.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
                }
            }
        }

        response.setOverdue(isOverdue);
        response.setCallbackStatus(callbackStatus);
        response.setOverdueDuration(overdueDuration);

        // Care logs details
        List<CareLog> logs = careLogRepository.findByLeadIdOrderByInteractionTimeDesc(lead.getId());
        response.setCareLogCount(logs.size());
        if (!logs.isEmpty()) {
            CareLog latest = logs.get(0);
            response.setLastCareLog(new CareLogResponse(
                    latest.getId(),
                    lead.getId(),
                    lead.getFullName(),
                    latest.getType(),
                    latest.getContent(),
                    latest.getInteractionTime(),
                    latest.getCounselorName(),
                    latest.getCreatedAt()
            ));
        }

        return response;
    }
}
