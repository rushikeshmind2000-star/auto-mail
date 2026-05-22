package Auto.Mail.Processing.AutoMail.controller;

import Auto.Mail.Processing.AutoMail.entity.MailDetails;
import Auto.Mail.Processing.AutoMail.service.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mails")
public class MailController {

    @Autowired
    private MailService mailService;

    @PostMapping("/send")
    public ResponseEntity<MailDetails> sendMail(@RequestBody MailDetails mailDetails) {
        MailDetails savedMail = mailService.sendMail(mailDetails);
        return ResponseEntity.ok(savedMail);
    }

    @GetMapping
    public ResponseEntity<List<MailDetails>> getAllMails() {
        return ResponseEntity.ok(mailService.getAllMails());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MailDetails> getMailById(@PathVariable Long id) {
        return mailService.getMailById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMail(@PathVariable Long id) {
        mailService.deleteMail(id);
        return ResponseEntity.noContent().build();
    }
}
