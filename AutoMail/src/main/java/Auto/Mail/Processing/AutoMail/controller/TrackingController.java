package Auto.Mail.Processing.AutoMail.controller;

import Auto.Mail.Processing.AutoMail.entity.MailLog;
import Auto.Mail.Processing.AutoMail.repository.MailLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api")
public class TrackingController {

    @Autowired
    private MailLogRepository mailLogRepository;

    // A transparent 1x1 GIF
    private static final byte[] PIXEL = new byte[]{
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61,
        0x01, 0x00, 0x01, 0x00, (byte) 0x80, 0x00,
        0x00, 0x00, 0x00, 0x00, (byte) 0xff, (byte) 0xff,
        (byte) 0xff, 0x21, (byte) 0xf9, 0x04, 0x01, 0x00,
        0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00,
        0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02,
        0x02, 0x44, 0x01, 0x00, 0x3b
    };

    @GetMapping("/track")
    public ResponseEntity<byte[]> trackOpen(@RequestParam("id") Long id) {
        if (id != null) {
            MailLog log = mailLogRepository.findById(id).orElse(null);
            if (log != null) {
                log.setOpenCount(log.getOpenCount() + 1);
                if (log.getOpenedAt() == null) {
                    log.setOpenedAt(LocalDateTime.now());
                }
                if (!"REPLIED".equalsIgnoreCase(log.getStatus())) {
                    log.setStatus("OPENED");
                }
                mailLogRepository.save(log);
            }
        }
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_GIF);
        headers.setCacheControl("no-cache, no-store, must-revalidate");
        headers.setPragma("no-cache");
        headers.setExpires(0L);

        return new ResponseEntity<>(PIXEL, headers, HttpStatus.OK);
    }

    @GetMapping("/tracking")
    public ResponseEntity<java.util.List<MailLog>> getAllTrackedEmails() {
        // Return descending
        java.util.List<MailLog> logs = mailLogRepository.findAll();
        logs.sort((a, b) -> b.getSentAt().compareTo(a.getSentAt()));
        return ResponseEntity.ok(logs);
    }
}
