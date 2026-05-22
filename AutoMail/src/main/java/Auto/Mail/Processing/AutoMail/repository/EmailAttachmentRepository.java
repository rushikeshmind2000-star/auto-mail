package Auto.Mail.Processing.AutoMail.repository;

import Auto.Mail.Processing.AutoMail.entity.EmailAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailAttachmentRepository extends JpaRepository<EmailAttachment, Long> {
}
