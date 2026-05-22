package Auto.Mail.Processing.AutoMail.dto;

import java.util.List;

public class PostAnalyzerResponse {
    private String company;
    private String companyEmail;
    private String role;
    private String experience;
    private String location;
    private String jobType;
    private List<String> skills;
    private String subject;
    private String emailBody;
    private String linkedinMessage;

    public PostAnalyzerResponse() {}

    public String getCompany() { return company; }
    public void setCompany(String c) { this.company = c; }
    public String getCompanyEmail() { return companyEmail; }
    public void setCompanyEmail(String e) { this.companyEmail = e; }
    public String getRole() { return role; }
    public void setRole(String r) { this.role = r; }
    public String getExperience() { return experience; }
    public void setExperience(String e) { this.experience = e; }
    public String getLocation() { return location; }
    public void setLocation(String l) { this.location = l; }
    public String getJobType() { return jobType; }
    public void setJobType(String j) { this.jobType = j; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> s) { this.skills = s; }
    public String getSubject() { return subject; }
    public void setSubject(String s) { this.subject = s; }
    public String getEmailBody() { return emailBody; }
    public void setEmailBody(String e) { this.emailBody = e; }
    public String getLinkedinMessage() { return linkedinMessage; }
    public void setLinkedinMessage(String l) { this.linkedinMessage = l; }
}
