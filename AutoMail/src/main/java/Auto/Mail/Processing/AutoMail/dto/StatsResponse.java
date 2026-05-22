package Auto.Mail.Processing.AutoMail.dto;

public class StatsResponse {
    private long totalRecipients;
    private long totalSubjects;
    private long totalBodies;
    private long totalSent;
    private long totalFailed;
    private long sentToday;
    private double successRate;
    private long pendingJobs;

    public StatsResponse() {}

    public StatsResponse(long totalRecipients, long totalSubjects, long totalBodies,
                         long totalSent, long totalFailed, long sentToday,
                         double successRate, long pendingJobs) {
        this.totalRecipients = totalRecipients;
        this.totalSubjects = totalSubjects;
        this.totalBodies = totalBodies;
        this.totalSent = totalSent;
        this.totalFailed = totalFailed;
        this.sentToday = sentToday;
        this.successRate = successRate;
        this.pendingJobs = pendingJobs;
    }

    public long getTotalRecipients() { return totalRecipients; }
    public long getTotalSubjects() { return totalSubjects; }
    public long getTotalBodies() { return totalBodies; }
    public long getTotalSent() { return totalSent; }
    public long getTotalFailed() { return totalFailed; }
    public long getSentToday() { return sentToday; }
    public double getSuccessRate() { return successRate; }
    public long getPendingJobs() { return pendingJobs; }
}
