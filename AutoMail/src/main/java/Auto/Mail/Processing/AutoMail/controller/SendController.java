package Auto.Mail.Processing.AutoMail.controller;

import Auto.Mail.Processing.AutoMail.dto.BulkSendRequest;
import Auto.Mail.Processing.AutoMail.entity.ScheduledMailJob;
import Auto.Mail.Processing.AutoMail.service.MailSendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.format.annotation.DateTimeFormat;

import Auto.Mail.Processing.AutoMail.entity.EmailAttachment;
import Auto.Mail.Processing.AutoMail.repository.EmailAttachmentRepository;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/send")
public class SendController {

    @Autowired
    private MailSendService mailSendService;

    @Autowired
    private EmailAttachmentRepository emailAttachmentRepository;

    @PostMapping("/bulk")
    public ResponseEntity<?> send(@RequestBody BulkSendRequest req) {

        if (req.getRecipientIds() == null || req.getRecipientIds().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No recipients selected"));
        }
        if (req.getSubjectId() == null || req.getBodyId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Subject and body templates are required"));
        }

        boolean isScheduled = req.getScheduledAt() != null && req.getScheduledAt().isAfter(LocalDateTime.now());
        
        String attachmentPaths = "";
        if (req.getResumeIds() != null && !req.getResumeIds().isEmpty()) {
            attachmentPaths = req.getResumeIds().stream()
                    .map(String::valueOf)
                    .collect(java.util.stream.Collectors.joining(","));
        }

        if (req.getScheduledAt() == null) {
            req.setScheduledAt(LocalDateTime.now());
        }

        ScheduledMailJob job = mailSendService.scheduleBulk(req, attachmentPaths);
        return ResponseEntity.ok(Map.of(
                "scheduled", true,
                "jobId", job.getId(),
                "scheduledAt", job.getScheduledAt(),
                "totalRecipients", job.getTotalRecipients(),
                "message", isScheduled ? "Email job scheduled successfully" : "Emails queued to be sent (with 5 sec delay)"
        ));
    }
}
