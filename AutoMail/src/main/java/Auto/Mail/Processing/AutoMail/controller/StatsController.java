package Auto.Mail.Processing.AutoMail.controller;

import Auto.Mail.Processing.AutoMail.dto.StatsResponse;
import Auto.Mail.Processing.AutoMail.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired private RecipientRepository recipientRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private BodyRepository bodyRepository;
    @Autowired private MailLogRepository mailLogRepository;
    @Autowired private ScheduledJobRepository scheduledJobRepository;

    @GetMapping
    public StatsResponse getStats() {
        long totalRecipients = recipientRepository.count();
        long totalSubjects = subjectRepository.count();
        long totalBodies = bodyRepository.count();
        long totalSent = mailLogRepository.countByStatus("SENT");
        long totalFailed = mailLogRepository.countByStatus("FAILED");

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);
        long sentToday = mailLogRepository.countSentBetween(todayStart, todayEnd);

        long total = totalSent + totalFailed;
        double successRate = total > 0 ? Math.round((totalSent * 100.0 / total) * 10.0) / 10.0 : 0.0;

        long pendingJobs = scheduledJobRepository
                .findByStatusAndScheduledAtBefore("PENDING", LocalDateTime.now().plusYears(100))
                .stream().filter(j -> "PENDING".equals(j.getStatus())).count();

        return new StatsResponse(totalRecipients, totalSubjects, totalBodies,
                totalSent, totalFailed, sentToday, successRate, pendingJobs);
    }
}
