package Auto.Mail.Processing.AutoMail.repository;

import Auto.Mail.Processing.AutoMail.entity.BodyTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BodyRepository extends JpaRepository<BodyTemplate, Long> {
}
