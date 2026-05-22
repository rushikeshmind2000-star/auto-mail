package Auto.Mail.Processing.AutoMail.service;

import Auto.Mail.Processing.AutoMail.dto.BulkSendRequest;
import Auto.Mail.Processing.AutoMail.entity.*;
import Auto.Mail.Processing.AutoMail.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MailSendService {

    @Autowired private JavaMailSender mailSender;
    @Autowired private RecipientRepository recipientRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private BodyRepository bodyRepository;
    @Autowired private MailLogRepository mailLogRepository;
    @Autowired private ScheduledJobRepository scheduledJobRepository;
    @Autowired private EmailAttachmentRepository emailAttachmentRepository;

    /**
     * Immediately send to a list of recipients using selected subject & body templates.
     * Returns a result map: { sent, failed, logs }.
     */
    public Map<String, Object> sendBulkNow(List<Long> recipientIds, Long subjectId, Long bodyId, String attachmentPaths) {
        SubjectTemplate subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject template not found: " + subjectId));
        BodyTemplate body = bodyRepository.findById(bodyId)
                .orElseThrow(() -> new RuntimeException("Body template not found: " + bodyId));

        List<MailLog> logs = new ArrayList<>();
        int sent = 0, failed = 0;

        for (Long rid : recipientIds) {
            Optional<Recipient> opt = recipientRepository.findById(rid);
            if (opt.isEmpty()) continue;
            Recipient r = opt.get();
            MailLog log = doSendMail(r, subject.getContent(), body.getContent(), null, attachmentPaths);
            logs.add(log);
            if ("SENT".equals(log.getStatus())) sent++;
            else failed++;
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("sent", sent);
        result.put("failed", failed);
        result.put("total", sent + failed);
        result.put("logs", logs);
        return result;
    }

    /**
     * Schedule a bulk send for a future time. Persists a ScheduledMailJob record.
     */
    public ScheduledMailJob scheduleBulk(BulkSendRequest req, String attachmentPaths) {
        String ids = req.getRecipientIds().stream()
                .map(String::valueOf).collect(Collectors.joining(","));

        ScheduledMailJob job = new ScheduledMailJob();
        job.setRecipientIds(ids);
        job.setAttachmentPaths(attachmentPaths);
        job.setSubjectId(req.getSubjectId());
        job.setBodyId(req.getBodyId());
        job.setScheduledAt(req.getScheduledAt());
        job.setStatus("PENDING");
        job.setTotalRecipients(req.getRecipientIds().size());
        return scheduledJobRepository.save(job);
    }

    /**
     * Runs every 30 seconds — picks up PENDING jobs whose scheduledAt has passed.
     */
    @Scheduled(fixedDelay = 30000)
    public void processScheduledJobs() {
        List<ScheduledMailJob> due = scheduledJobRepository
                .findByStatusAndScheduledAtBefore("PENDING", LocalDateTime.now());

        for (ScheduledMailJob job : due) {
            job.setStatus("PROCESSING");
            scheduledJobRepository.save(job);

            List<Long> recipientIds = Arrays.stream(job.getRecipientIds().split(","))
                    .filter(s -> !s.isBlank())
                    .map(Long::parseLong)
                    .collect(Collectors.toList());

            SubjectTemplate subject = subjectRepository.findById(job.getSubjectId()).orElse(null);
            BodyTemplate body = bodyRepository.findById(job.getBodyId()).orElse(null);

            if (subject == null || body == null) {
                job.setStatus("FAILED");
                scheduledJobRepository.save(job);
                continue;
            }

            int success = 0, fail = 0;
            for (Long rid : recipientIds) {
                Optional<Recipient> opt = recipientRepository.findById(rid);
                if (opt.isEmpty()) continue;
                MailLog log = doSendMail(opt.get(), subject.getContent(), body.getContent(), job.getId(), job.getAttachmentPaths());
                log.setJobId(job.getId());
                mailLogRepository.save(log);
                if ("SENT".equals(log.getStatus())) success++;
                else fail++;
                
                // Add 5-second delay between emails to prevent rate-limiting/spam flags
                try {
                    Thread.sleep(5000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
            job.setSuccessCount(success);
            job.setFailCount(fail);
            job.setStatus("DONE");
            scheduledJobRepository.save(job);
        }
    }

    /**
     * Cancel a scheduled job (sets status to CANCELLED).
     */
    public ScheduledMailJob cancelJob(Long jobId) {
        ScheduledMailJob job = scheduledJobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));
        if (!"PENDING".equals(job.getStatus())) {
            throw new RuntimeException("Can only cancel PENDING jobs. Current status: " + job.getStatus());
        }
        job.setStatus("CANCELLED");
        return scheduledJobRepository.save(job);
    }

    // ===== Internal helper =====

    private MailLog doSendMail(Recipient r, String subject, String body, Long jobId, String attachmentPaths) {
        MailLog log = new MailLog();
        log.setRecipientName(r.getName());
        log.setRecipientEmail(r.getEmail());
        log.setSubject(subject);
        log.setBody(body);
        log.setJobId(jobId);
        log.setSentAt(LocalDateTime.now());
        log.setStatus("PENDING");
        
        // Save first to get the ID for tracking
        log = mailLogRepository.save(log);

        // Append tracking pixel (assuming localhost:8080 for local dev)
        String trackingUrl = "http://localhost:8080/api/track?id=" + log.getId();
        String trackedBody = body + "\n\n<img src=\"" + trackingUrl + "\" width=\"1\" height=\"1\" />";

        try {
            jakarta.mail.internet.MimeMessage mimeMsg = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(mimeMsg, true);
            helper.setTo(r.getEmail());
            helper.setSubject(subject);
            // using text replacing newlines with <br> for simple HTML formatting, appending the pixel
            helper.setText(body.replace("\n", "<br>") + "<br><br><img src=\"" + trackingUrl + "\" width=\"1\" height=\"1\" />", true);

            if (attachmentPaths != null && !attachmentPaths.isBlank()) {
                for (String idStr : attachmentPaths.split(",")) {
                    try {
                        Long attachmentId = Long.parseLong(idStr.trim());
                        Optional<EmailAttachment> optAtt = emailAttachmentRepository.findById(attachmentId);
                        if (optAtt.isPresent()) {
                            EmailAttachment att = optAtt.get();
                            helper.addAttachment(att.getFileName(), new org.springframework.core.io.ByteArrayResource(att.getData()));
                        }
                    } catch (NumberFormatException ignored) {}
                }
            }
            mailSender.send(mimeMsg);
            log.setStatus("SENT");
        } catch (Exception e) {
            log.setStatus("FAILED");
            log.setErrorMessage(e.getMessage());
        }
        return mailLogRepository.save(log);
    }

    public void sendSimpleMail(String to, String subject, String body) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(body);
        mailSender.send(msg);
    }
}
