package Auto.Mail.Processing.AutoMail.dto;

public class HrContactDto {
    private int serial;
    private String name;
    private String designation;
    private String email;
    private String linkedIn;
    private String emailStatus; // "Found" | "Generated"

    public HrContactDto() {}
    public HrContactDto(int serial, String name, String designation, String email, String linkedIn, String emailStatus) {
        this.serial = serial; this.name = name; this.designation = designation;
        this.email = email; this.linkedIn = linkedIn; this.emailStatus = emailStatus;
    }

    public int getSerial() { return serial; }
    public void setSerial(int serial) { this.serial = serial; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getLinkedIn() { return linkedIn; }
    public void setLinkedIn(String linkedIn) { this.linkedIn = linkedIn; }
    public String getEmailStatus() { return emailStatus; }
    public void setEmailStatus(String emailStatus) { this.emailStatus = emailStatus; }
}
