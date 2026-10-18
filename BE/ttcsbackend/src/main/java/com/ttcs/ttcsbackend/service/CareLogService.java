package com.ttcs.ttcsbackend.service;

import com.ttcs.ttcsbackend.dto.CareLogRequest;
import com.ttcs.ttcsbackend.dto.CareLogResponse;
import com.ttcs.ttcsbackend.entity.CareLog;
import com.ttcs.ttcsbackend.entity.Lead;
import com.ttcs.ttcsbackend.repository.CareLogRepository;
import com.ttcs.ttcsbackend.repository.LeadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CareLogService {

    private final CareLogRepository careLogRepository;
    private final LeadRepository leadRepository;

    public CareLogService(CareLogRepository careLogRepository, LeadRepository leadRepository) {
        this.careLogRepository = careLogRepository;
        this.leadRepository = leadRepository;
    }

    @Transactional(readOnly = true)
    public List<CareLogResponse> getCareLogsByLead(Long leadId) {
        return careLogRepository.findByLeadIdOrderByInteractionTimeDesc(leadId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CareLogResponse addCareLog(Long leadId, CareLogRequest request) {
        Optional<Lead> optionalLead = leadRepository.findById(leadId);
        if (optionalLead.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy Lead với ID: " + leadId);
        }

        Lead lead = optionalLead.get();

        CareLog careLog = new CareLog();
        careLog.setLead(lead);

        // Normalize type
        String type = request.getType();
        if (type == null || type.trim().isEmpty()) {
            type = "CALL";
        }
        careLog.setType(type.toUpperCase());
        careLog.setContent(request.getContent());
        careLog.setInteractionTime(request.getInteractionTime() != null ? request.getInteractionTime() : LocalDateTime.now());
        careLog.setCounselorName(request.getCounselorName() != null && !request.getCounselorName().trim().isEmpty() 
                ? request.getCounselorName() 
                : (lead.getAssignedTo() != null ? lead.getAssignedTo() : "Tư vấn tuyển sinh"));

        // If counselor specified next callback date, update the lead's callback schedule!
        if (request.getNextCallbackDate() != null) {
            lead.setCallbackDate(request.getNextCallbackDate());
        }

        // If counselor specified new status, update lead's status
        if (request.getNewStatus() != null && !request.getNewStatus().trim().isEmpty()) {
            lead.setStatus(request.getNewStatus());
        }

        leadRepository.save(lead);
        CareLog saved = careLogRepository.save(careLog);

        return toResponse(saved);
    }

    @Transactional
    public boolean deleteCareLog(Long id) {
        if (!careLogRepository.existsById(id)) {
            return false;
        }
        careLogRepository.deleteById(id);
        return true;
    }

    private CareLogResponse toResponse(CareLog log) {
        return new CareLogResponse(
                log.getId(),
                log.getLead() != null ? log.getLead().getId() : null,
                log.getLead() != null ? log.getLead().getFullName() : null,
                log.getType(),
                log.getContent(),
                log.getInteractionTime(),
                log.getCounselorName(),
                log.getCreatedAt()
        );
    }
}
