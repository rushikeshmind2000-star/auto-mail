package Auto.Mail.Processing.AutoMail.dto;

public class ColdEmailRequest {
    private String targetType;
    private String company;
    private String contactPerson;
    private String goal; // Networking, Internship, Referral, Job Inquiry
    private String currentRole;
    private String experience;
    private String skills;
    private String tone;
    private String length;
    private String additionalNotes;

    // Getters and Setters
    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }
    public String getCurrentRole() { return currentRole; }
    public void setCurrentRole(String currentRole) { this.currentRole = currentRole; }
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    public String getTone() { return tone; }
    public void setTone(String tone) { this.tone = tone; }
    public String getLength() { return length; }
    public void setLength(String length) { this.length = length; }
    public String getAdditionalNotes() { return additionalNotes; }
    public void setAdditionalNotes(String additionalNotes) { this.additionalNotes = additionalNotes; }
}
