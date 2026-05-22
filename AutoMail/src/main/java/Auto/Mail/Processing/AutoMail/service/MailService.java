package Auto.Mail.Processing.AutoMail.service;

import Auto.Mail.Processing.AutoMail.entity.MailDetails;
import Auto.Mail.Processing.AutoMail.repository.MailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private MailRepository mailRepository;

    public MailDetails sendMail(MailDetails mailDetails) {
        // Ensure ID is null so JPA creates a new record instead of trying to update an existing one
        mailDetails.setId(null);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(mailDetails.getRecipient());
            message.setSubject(mailDetails.getSubject());
            message.setText(mailDetails.getBody());

            mailSender.send(message);

            mailDetails.setStatus("SENT");
        } catch (Exception e) {
            mailDetails.setStatus("FAILED: " + e.getMessage());
        }

        mailDetails.setSentAt(LocalDateTime.now());
        return mailRepository.save(mailDetails);
    }

    public List<MailDetails> getAllMails() {
        return mailRepository.findAll();
    }

    public Optional<MailDetails> getMailById(Long id) {
        return mailRepository.findById(id);
    }

    public void deleteMail(Long id) {
        mailRepository.deleteById(id);
    }
}
