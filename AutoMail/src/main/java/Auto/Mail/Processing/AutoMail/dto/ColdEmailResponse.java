package Auto.Mail.Processing.AutoMail.dto;

public class ColdEmailResponse {
    private String subject;
    private String body;

    public ColdEmailResponse() {}

    public ColdEmailResponse(String subject, String body) {
        this.subject = subject;
        this.body = body;
    }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
}
