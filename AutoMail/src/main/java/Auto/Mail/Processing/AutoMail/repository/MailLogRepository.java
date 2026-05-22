package Auto.Mail.Processing.AutoMail.repository;

import Auto.Mail.Processing.AutoMail.entity.MailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface MailLogRepository extends JpaRepository<MailLog, Long> {
    List<MailLog> findAllByOrderBySentAtDesc();
    long countByStatus(String status);

    @Query("SELECT COUNT(m) FROM MailLog m WHERE m.sentAt >= :start AND m.sentAt < :end")
    long countSentBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(m) FROM MailLog m WHERE m.status = 'SENT' AND m.sentAt >= :start AND m.sentAt < :end")
    long countSuccessBetween(LocalDateTime start, LocalDateTime end);
}
