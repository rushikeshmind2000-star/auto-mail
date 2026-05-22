package Auto.Mail.Processing.AutoMail.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scheduled_mail_jobs")
public class ScheduledMailJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Comma-separated recipient IDs, e.g. "1,3,5"
    @Column(length = 2000)
    private String recipientIds;

    private Long subjectId;
    private Long bodyId;

    @Column(columnDefinition = "TEXT")
    private String attachmentPaths;

    private LocalDateTime scheduledAt;

    // PENDING | PROCESSING | DONE | FAILED | CANCELLED
    private String status = "PENDING";

    private int totalRecipients;
    private int successCount;
    private int failCount;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() { this.createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRecipientIds() { return recipientIds; }
    public void setRecipientIds(String recipientIds) { this.recipientIds = recipientIds; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public Long getBodyId() { return bodyId; }
    public void setBodyId(Long bodyId) { this.bodyId = bodyId; }

    public String getAttachmentPaths() { return attachmentPaths; }
    public void setAttachmentPaths(String attachmentPaths) { this.attachmentPaths = attachmentPaths; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getTotalRecipients() { return totalRecipients; }
    public void setTotalRecipients(int totalRecipients) { this.totalRecipients = totalRecipients; }

    public int getSuccessCount() { return successCount; }
    public void setSuccessCount(int successCount) { this.successCount = successCount; }

    public int getFailCount() { return failCount; }
    public void setFailCount(int failCount) { this.failCount = failCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
