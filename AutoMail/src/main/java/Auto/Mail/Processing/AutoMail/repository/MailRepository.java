package Auto.Mail.Processing.AutoMail.repository;

import Auto.Mail.Processing.AutoMail.entity.MailDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MailRepository extends JpaRepository<MailDetails, Long> {
}
