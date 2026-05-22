package Auto.Mail.Processing.AutoMail.controller;

import Auto.Mail.Processing.AutoMail.entity.ScheduledMailJob;
import Auto.Mail.Processing.AutoMail.repository.ScheduledJobRepository;
import Auto.Mail.Processing.AutoMail.service.MailSendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class ScheduledJobController {

    @Autowired private ScheduledJobRepository scheduledJobRepository;
    @Autowired private MailSendService mailSendService;

    @GetMapping
    public List<ScheduledMailJob> getAll() {
        return scheduledJobRepository.findAllByOrderByCreatedAtDesc();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancel(@PathVariable Long id) {
        try {
            ScheduledMailJob job = mailSendService.cancelJob(id);
            return ResponseEntity.ok(job);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
