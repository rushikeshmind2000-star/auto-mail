package Auto.Mail.Processing.AutoMail.repository;

import Auto.Mail.Processing.AutoMail.entity.Recipient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecipientRepository extends JpaRepository<Recipient, Long> {
    List<Recipient> findByActiveTrue();
    boolean existsByEmail(String email);
}
