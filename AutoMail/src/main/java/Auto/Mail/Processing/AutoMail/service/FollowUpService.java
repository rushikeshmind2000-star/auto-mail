package Auto.Mail.Processing.AutoMail.service;

import Auto.Mail.Processing.AutoMail.entity.ApplicationLog;
import Auto.Mail.Processing.AutoMail.repository.ApplicationLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FollowUpService {

    @Autowired
    private ApplicationLogRepository applicationLogRepository;

    @Autowired
    private MailSendService mailSendService;

    // Run every hour to check for pending follow-ups
    @Scheduled(cron = "0 0 * * * *")
    public void processFollowUps() {
        System.out.println("Running Follow-Up Cron Job...");
        
        List<ApplicationLog> pendingFollowUps = applicationLogRepository
                .findByFollowupStatusAndFollowupDateBefore("pending", LocalDateTime.now());

        for (ApplicationLog app : pendingFollowUps) {
            // Skip if they already replied
            if ("replied".equalsIgnoreCase(app.getReplyStatus())) {
                app.setFollowupStatus("cancelled");
                applicationLogRepository.save(app);
                continue;
            }

            // Generate follow up message
            String followUpBody = generateFollowUpBody(app);
            String followUpSubject = "Following Up Regarding " + app.getRole() + " Application";

            try {
                // Send email
                mailSendService.sendSimpleMail(
                    app.getEmail(),
                    followUpSubject,
                    followUpBody
                );

                // Update status
                app.setFollowupStatus("sent");
                applicationLogRepository.save(app);
                System.out.println("Follow-up sent successfully to: " + app.getEmail());

            } catch (Exception e) {
                System.err.println("Failed to send follow up to " + app.getEmail() + ": " + e.getMessage());
            }
        }
    }

    public String generateFollowUpBody(ApplicationLog app) {
        String hrFirstName = "Hiring Team";
        if (app.getHrName() != null && !app.getHrName().isBlank()) {
            hrFirstName = app.getHrName().split(" ")[0];
        }

        return "Dear " + hrFirstName + ",\n\n"
             + "I hope you are doing well.\n\n"
             + "I wanted to follow up regarding my application for the " + app.getRole() + " role at " + app.getCompanyName() + ". "
             + "I remain very interested in the opportunity and would appreciate any updates regarding the hiring process.\n\n"
             + "Please let me know if you need any additional information from my side.\n\n"
             + "Thank you for your time and consideration.\n\n"
             + "Best Regards,\nCandidate"; // Using default as we don't store user info yet
    }
}
