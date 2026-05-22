package Auto.Mail.Processing.AutoMail.repository;

import Auto.Mail.Processing.AutoMail.entity.JobAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobAlertRepository extends JpaRepository<JobAlert, Long> {
    List<JobAlert> findByUserIdOrderByMatchScoreDesc(Long userId);
}
