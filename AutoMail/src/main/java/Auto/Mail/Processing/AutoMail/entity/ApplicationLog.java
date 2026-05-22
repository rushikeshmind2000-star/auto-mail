package Auto.Mail.Processing.AutoMail.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class ApplicationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // FK → users.id

    private String hrName;
    private String companyName;
    private String email;
    private String role;
    
    private String subject;
    @Column(columnDefinition = "TEXT")
    private String body;

    private LocalDateTime sentAt;
    
    private boolean followupEnabled;
    private LocalDateTime followupDate;
    
    // "pending", "sent", "cancelled"
    private String followupStatus;
    
    // "waiting", "replied"
    private String replyStatus;

    public ApplicationLog() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getHrName() { return hrName; }
    public void setHrName(String hrName) { this.hrName = hrName; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    public boolean isFollowupEnabled() { return followupEnabled; }
    public void setFollowupEnabled(boolean followupEnabled) { this.followupEnabled = followupEnabled; }
    public LocalDateTime getFollowupDate() { return followupDate; }
    public void setFollowupDate(LocalDateTime followupDate) { this.followupDate = followupDate; }
    public String getFollowupStatus() { return followupStatus; }
    public void setFollowupStatus(String followupStatus) { this.followupStatus = followupStatus; }
    public String getReplyStatus() { return replyStatus; }
    public void setReplyStatus(String replyStatus) { this.replyStatus = replyStatus; }
}
