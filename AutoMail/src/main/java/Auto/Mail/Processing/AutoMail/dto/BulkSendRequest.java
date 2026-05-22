package Auto.Mail.Processing.AutoMail.dto;

import java.time.LocalDateTime;
import java.util.List;

public class BulkSendRequest {
    private List<Long> recipientIds;
    private Long subjectId;
    private Long bodyId;
    private LocalDateTime scheduledAt; // null = send immediately
    private List<Long> resumeIds;

    public List<Long> getRecipientIds() { return recipientIds; }
    public void setRecipientIds(List<Long> recipientIds) { this.recipientIds = recipientIds; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public Long getBodyId() { return bodyId; }
    public void setBodyId(Long bodyId) { this.bodyId = bodyId; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public List<Long> getResumeIds() { return resumeIds; }
    public void setResumeIds(List<Long> resumeIds) { this.resumeIds = resumeIds; }
}
