package Auto.Mail.Processing.AutoMail.dto;

import java.util.List;

public class OutreachRequest {
    private String candidateName;
    private List<String> candidateSkills;
    private String targetRole;
    private String experienceLevel; // e.g. "Fresher", "2 Years"
    private String hrName;
    private String company;
    private String tone; // "Professional", "Friendly", "Short"
    private String goal; // "Looking for Referrals", "Asking for Openings"

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }
    public List<String> getCandidateSkills() { return candidateSkills; }
    public void setCandidateSkills(List<String> candidateSkills) { this.candidateSkills = candidateSkills; }
    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }
    public String getHrName() { return hrName; }
    public void setHrName(String hrName) { this.hrName = hrName; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getTone() { return tone; }
    public void setTone(String tone) { this.tone = tone; }
    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }
}
