package Auto.Mail.Processing.AutoMail.controller;

import Auto.Mail.Processing.AutoMail.entity.MailLog;
import Auto.Mail.Processing.AutoMail.repository.MailLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class MailLogController {

    @Autowired
    private MailLogRepository mailLogRepository;

    @GetMapping
    public List<MailLog> getAll() {
        return mailLogRepository.findAllByOrderBySentAtDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MailLog> getById(@PathVariable Long id) {
        return mailLogRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!mailLogRepository.existsById(id)) return ResponseEntity.notFound().build();
        mailLogRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAll() {
        mailLogRepository.deleteAll();
        return ResponseEntity.noContent().build();
    }
}
