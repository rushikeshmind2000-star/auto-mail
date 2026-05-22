package Auto.Mail.Processing.AutoMail.repository;

import Auto.Mail.Processing.AutoMail.entity.ScheduledMailJob;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface ScheduledJobRepository extends JpaRepository<ScheduledMailJob, Long> {
    List<ScheduledMailJob> findByStatusAndScheduledAtBefore(String status, LocalDateTime dateTime);
    List<ScheduledMailJob> findAllByOrderByCreatedAtDesc();
}
