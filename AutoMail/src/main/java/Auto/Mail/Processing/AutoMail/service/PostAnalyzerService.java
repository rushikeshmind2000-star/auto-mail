package Auto.Mail.Processing.AutoMail.service;

import Auto.Mail.Processing.AutoMail.dto.PostAnalyzerRequest;
import Auto.Mail.Processing.AutoMail.dto.PostAnalyzerResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.*;
import java.util.stream.Collectors;

@Service
public class PostAnalyzerService {

    @Autowired
    private GeminiService geminiService;

    // ── Known roles (longest-match wins) ──────────────────────────────────────
    private static final String[] ROLES = {
        "Full Stack Developer","Frontend Developer","Backend Developer","React Developer",
        "React.js Developer","Node.js Developer","Angular Developer","Vue.js Developer",
        "Java Developer","Python Developer","Spring Boot Developer","DevOps Engineer",
        "Data Scientist","Data Analyst","Machine Learning Engineer","AI Engineer",
        "Android Developer","iOS Developer","Mobile Developer","Flutter Developer",
        "UI/UX Designer","Software Engineer","QA Engineer","Test Engineer",
        "Cloud Engineer","AWS Engineer","Salesforce Developer","PHP Developer",
        "WordPress Developer","Golang Developer","Ruby Developer",".NET Developer",
        "Embedded Systems Engineer","Blockchain Developer","Cybersecurity Engineer"
    };

    // ── Tech skills pool ──────────────────────────────────────────────────────
    private static final String[] ALL_SKILLS = {
        "React.js","React","Node.js","Angular","Vue.js","JavaScript","TypeScript",
        "HTML","CSS","HTML5","CSS3","Bootstrap","Tailwind","SASS","Redux","Context API",
        "REST APIs","GraphQL","WebSocket","JWT","OAuth",
        "Java","Spring Boot","Spring MVC","Hibernate","JPA","Maven","Gradle",
        "Python","Django","Flask","FastAPI","Pandas","NumPy","TensorFlow","PyTorch",
        "MySQL","PostgreSQL","MongoDB","Redis","Oracle","SQL Server","SQLite",
        "AWS","Azure","GCP","Docker","Kubernetes","Jenkins","CI/CD","Terraform",
        "Git","GitHub","GitLab","Bitbucket","Jira","Agile","Scrum",
        "Android","iOS","Flutter","React Native","Kotlin","Swift","Dart",
        "PHP","Laravel","WordPress","Ruby on Rails",".NET","C#","C++","Go","Rust"
    };

    // ── Indian + global cities ────────────────────────────────────────────────
    private static final String[] CITIES = {
        "Bangalore","Bengaluru","Mumbai","Pune","Chennai","Hyderabad","Delhi","Noida",
        "Gurgaon","Gurugram","Kolkata","Ahmedabad","Jaipur","Chandigarh","Kochi",
        "Remote","Work from Home","WFH","Hybrid",
        "New York","San Francisco","London","Singapore","Dubai","Toronto","Sydney"
    };

    // ── Main analyze method ────────────────────────────────────────────────────
    public PostAnalyzerResponse analyze(PostAnalyzerRequest req) {
        String text = req.getPostText();
        String signerName = (req.getYourName() != null && !req.getYourName().isBlank())
                ? req.getYourName() : "Your Name";

        String role        = extractRole(text);
        List<String> skills = extractSkills(text);
        String experience  = extractExperience(text);
        String location    = extractLocation(text);
        String jobType     = extractJobType(text);
        String company     = extractCompany(text);
        String email       = extractEmail(text);

        String skillsStr   = skills.isEmpty() ? "various technologies"
                : String.join(", ", skills.subList(0, Math.min(skills.size(), 6)));

        String subject        = buildSubject(role);
        String emailBody      = buildEmailBodyWithAI(role, skillsStr, experience, signerName, text);
        String linkedinMsg    = buildLinkedinWithAI(role, skillsStr, signerName, text);

        PostAnalyzerResponse resp = new PostAnalyzerResponse();
        resp.setCompany(company);
        resp.setCompanyEmail(email);
        resp.setRole(role);
        resp.setExperience(experience);
        resp.setLocation(location);
        resp.setJobType(jobType);
        resp.setSkills(skills);
        resp.setSubject(subject);
        resp.setEmailBody(emailBody);
        resp.setLinkedinMessage(linkedinMsg);
        return resp;
    }

    // ── Extractors ────────────────────────────────────────────────────────────

    private String extractRole(String text) {
        String lower = text.toLowerCase();
        // 1. Direct match from role list (longest match first)
        for (String r : ROLES) {
            if (lower.contains(r.toLowerCase())) return r;
        }
        // 2. Pattern: "hiring [X]" or "for a [X] role/position"
        Pattern p = Pattern.compile(
            "(?:hiring|seeking|looking for|open for|position[:\\-–]?\\s*|role[:\\-–]?\\s*)\\s*(?:a\\s+|an\\s+)?([A-Za-z.]+(?:\\s+[A-Za-z.]+){0,3})(?:\\s+with|\\s+who|\\s+to|$|,|\\.|\\n)",
            Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        if (m.find()) {
            String candidate = m.group(1).trim();
            if (candidate.length() > 3) return capitalize(candidate);
        }
        return "Software Developer";
    }

    private List<String> extractSkills(String text) {
        String lower = text.toLowerCase();
        List<String> found = new ArrayList<>();
        for (String s : ALL_SKILLS) {
            // word-boundary style match (avoid partial matches)
            if (lower.contains(s.toLowerCase())) found.add(s);
        }
        // de-dup while preserving order
        return found.stream().distinct().collect(Collectors.toList());
    }

    private String extractExperience(String text) {
        Pattern p = Pattern.compile(
            "(\\d+)\\s*(?:\\+\\s*)?(?:to\\s*\\d+\\s*)?years?(?:\\s+of)?(?:\\s+experience)?",
            Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        if (m.find()) return m.group(1) + "+ Years";
        if (text.toLowerCase().contains("fresher") || text.toLowerCase().contains("0 year")) return "Fresher";
        return "Not specified";
    }

    private String extractLocation(String text) {
        String lower = text.toLowerCase();
        for (String c : CITIES) {
            if (lower.contains(c.toLowerCase())) return capitalize(c);
        }
        return "Not specified";
    }

    private String extractJobType(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("full-time") || lower.contains("full time")) return "Full-time";
        if (lower.contains("part-time") || lower.contains("part time")) return "Part-time";
        if (lower.contains("remote")) return "Remote";
        if (lower.contains("hybrid")) return "Hybrid";
        if (lower.contains("contract")) return "Contract";
        if (lower.contains("internship") || lower.contains("intern")) return "Internship";
        return "Full-time";
    }

    private String extractCompany(String text) {
        // Look for "at [Company]", "join [Company]", "company: [Company]"
        Pattern p = Pattern.compile(
            "(?:at|join|company[:\\-]?\\s*|with|from)\\s+([A-Z][A-Za-z0-9&.,' ]{2,40}?)(?:\\s+(?:is|are|we|you|our|and|to|–|,|\\.|\\n)|$)",
            Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        if (m.find()) {
            String c = m.group(1).trim();
            if (c.length() >= 2 && c.length() <= 40) return c;
        }
        // Try "careers@domain.com" → domain
        Pattern ep = Pattern.compile("[a-z0-9._%+\\-]+@([a-z0-9\\-]+)\\.[a-z]{2,}", Pattern.CASE_INSENSITIVE);
        Matcher em = ep.matcher(text);
        if (em.find()) {
            String domain = em.group(1);
            return capitalize(domain);
        }
        return "Not specified";
    }

    private String extractEmail(String text) {
        Pattern p = Pattern.compile("[a-z0-9._%+\\-]+@[a-z0-9.\\-]+\\.[a-z]{2,}", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        return m.find() ? m.group() : "Not found";
    }

    // ── Generators ────────────────────────────────────────────────────────────

    private String buildSubject(String role) {
        return "Application for " + role + " Position";
    }

    private String buildEmailBodyWithAI(String role, String skills, String exp, String name, String originalPost) {
        String prompt = String.format(
            "Write a professional job application email based on this hiring post:\n\n%s\n\n" +
            "Details:\n- Applying for: %s\n- Candidate skills: %s\n- Experience: %s\n- Sign name: %s\n\n" +
            "Rules: Start with 'Dear Hiring Team,', keep under 200 words, professional tone. " +
            "Do NOT add placeholders. End with 'Best Regards,\\n%s'.",
            originalPost.substring(0, Math.min(originalPost.length(), 500)),
            role, skills, exp, name, name
        );
        String aiResult = geminiService.generate(prompt);
        return (aiResult != null && !aiResult.isBlank()) ? aiResult.trim() : buildEmailBody(role, skills, exp, name);
    }

    private String buildLinkedinWithAI(String role, String skills, String name, String originalPost) {
        String prompt = String.format(
            "Write a short LinkedIn message (under 80 words) to a recruiter based on this hiring post:\n\n%s\n\n" +
            "Candidate: %s | Role: %s | Skills: %s\n" +
            "Start with 'Hi,' and end with 'Best Regards,\\n%s'. No placeholders.",
            originalPost.substring(0, Math.min(originalPost.length(), 300)),
            name, role, skills, name
        );
        String aiResult = geminiService.generate(prompt);
        return (aiResult != null && !aiResult.isBlank()) ? aiResult.trim() : buildLinkedin(role, skills, name);
    }

    private String buildEmailBody(String role, String skills, String exp, String name) {
        String expLine = "Not specified".equals(exp) || "Fresher".equals(exp)
                ? "I am a fresher with strong fundamentals and a passion for learning."
                : "I have " + exp + " of hands-on experience in software development.";
        return "Dear Hiring Team,\n\n"
             + "I came across your hiring post for the " + role + " position and was "
             + "excited to see an opportunity that aligns perfectly with my skills and experience.\n\n"
             + expLine + " I am proficient in " + skills + " and have a strong "
             + "understanding of building scalable, clean, and user-friendly applications.\n\n"
             + "I am passionate about writing efficient code and collaborating with teams to deliver "
             + "high-quality solutions. I would love the opportunity to contribute to your organization.\n\n"
             + "Please find my resume attached for your consideration. I would be happy to discuss "
             + "how my experience and skills align with your requirements.\n\n"
             + "Looking forward to hearing from you.\n\n"
             + "Best Regards,\n" + name;
    }

    private String buildLinkedin(String role, String skills, String name) {
        return "Hi,\n\n"
             + "I recently came across your hiring post for the " + role + " role and I'm very "
             + "interested in this opportunity.\n\n"
             + "I have experience in " + skills + " and would love to connect and explore "
             + "this opportunity further.\n\n"
             + "I would appreciate the chance to share my resume and discuss how I can add value to your team.\n\n"
             + "Looking forward to hearing from you!\n\n"
             + "Best Regards,\n" + name;
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return Arrays.stream(s.split("\\s+"))
                .map(w -> w.isEmpty() ? w : Character.toUpperCase(w.charAt(0)) + w.substring(1))
                .collect(Collectors.joining(" "));
    }
}
