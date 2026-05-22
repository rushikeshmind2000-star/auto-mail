package Auto.Mail.Processing.AutoMail.controller;

import Auto.Mail.Processing.AutoMail.entity.ApplicationLog;
import Auto.Mail.Processing.AutoMail.repository.ApplicationLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationLogRepository appRepo;

    @GetMapping
    public ResponseEntity<List<ApplicationLog>> getAll() {
        return ResponseEntity.ok(appRepo.findAll());
    }

    @PostMapping
    public ResponseEntity<ApplicationLog> create(@RequestBody ApplicationLog app) {
        if (app.getSentAt() == null) {
            app.setSentAt(LocalDateTime.now());
        }
        if (app.isFollowupEnabled() && app.getFollowupDate() == null) {
            // Default 3 days
            app.setFollowupDate(app.getSentAt().plusDays(3));
        }
        app.setFollowupStatus(app.isFollowupEnabled() ? "pending" : "disabled");
        app.setReplyStatus("waiting");
        return ResponseEntity.ok(appRepo.save(app));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        ApplicationLog app = appRepo.findById(id).orElse(null);
        if (app == null) return ResponseEntity.notFound().build();

        if (body.containsKey("replyStatus")) {
            app.setReplyStatus(body.get("replyStatus"));
            if ("replied".equalsIgnoreCase(app.getReplyStatus())) {
                app.setFollowupStatus("cancelled");
            }
        }
        if (body.containsKey("followupStatus")) {
            app.setFollowupStatus(body.get("followupStatus"));
        }
        return ResponseEntity.ok(appRepo.save(app));
    }
}
