package Auto.Mail.Processing.AutoMail.repository;

import Auto.Mail.Processing.AutoMail.entity.ApplicationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ApplicationLogRepository extends JpaRepository<ApplicationLog, Long> {
    List<ApplicationLog> findByFollowupStatusAndFollowupDateBefore(String followupStatus, LocalDateTime date);
}
