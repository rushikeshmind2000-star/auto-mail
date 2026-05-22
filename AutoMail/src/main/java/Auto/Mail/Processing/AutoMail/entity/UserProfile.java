package Auto.Mail.Processing.AutoMail.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId; // FK → users.id

    private String roleName;      // e.g. "Frontend Developer"
    private String experience;    // e.g. "Fresher", "1-3 Years"

    @Column(columnDefinition = "TEXT")
    private String skills;        // comma-separated

    @Column(columnDefinition = "TEXT")
    private String resumeUrl;

    @Column(columnDefinition = "TEXT")
    private String linkedinUrl;

    private String location;

    // ── Getters / Setters ────────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
