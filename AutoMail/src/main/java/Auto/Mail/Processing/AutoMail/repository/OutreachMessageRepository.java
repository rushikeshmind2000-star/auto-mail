package Auto.Mail.Processing.AutoMail.repository;

import Auto.Mail.Processing.AutoMail.entity.OutreachMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OutreachMessageRepository extends JpaRepository<OutreachMessage, Long> {
    List<OutreachMessage> findByUserId(Long userId);
    List<OutreachMessage> findByHrId(Long hrId);
}
