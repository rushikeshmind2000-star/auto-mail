package Auto.Mail.Processing.AutoMail.service;

import Auto.Mail.Processing.AutoMail.dto.ColdEmailRequest;
import Auto.Mail.Processing.AutoMail.dto.ColdEmailResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ColdEmailService {

    @Autowired
    private GeminiService geminiService;

    public ColdEmailResponse generateEmail(ColdEmailRequest req) {
        String goal = req.getGoal() != null ? req.getGoal() : "Job Inquiry";
        String company = req.getCompany() != null ? req.getCompany() : "your organization";
        String role = req.getCurrentRole() != null ? req.getCurrentRole() : "Professional";
        String skills = req.getSkills() != null ? req.getSkills() : "various technologies";
        String tone = req.getTone() != null ? req.getTone() : "Professional";
        String experience = req.getExperience() != null ? req.getExperience() : "Fresher";
        String contactPerson = (req.getContactPerson() != null && !req.getContactPerson().isBlank())
            ? req.getContactPerson() : "Hiring Team";
        String notes = req.getAdditionalNotes() != null ? req.getAdditionalNotes() : "";

        // ── Try Gemini AI first ─────────────────────────────────────────────────
        String prompt = buildPrompt(goal, company, role, skills, tone, experience, contactPerson, notes);
        String aiText = geminiService.generate(prompt);

        if (aiText != null && !aiText.isBlank()) {
            // Parse subject from the AI response (first line starting with "Subject:")
            String subject = goal + " for " + role + " at " + company;
            String body = aiText.trim();
            if (aiText.startsWith("Subject:")) {
                int nl = aiText.indexOf('\n');
                if (nl > 0) {
                    subject = aiText.substring("Subject:".length(), nl).trim();
                    body = aiText.substring(nl).trim();
                }
            }
            return new ColdEmailResponse(subject, body);
        }

        // ── Rule-based fallback (when no API key) ──────────────────────────────
        return generateFallback(req);
    }

    private String buildPrompt(String goal, String company, String role, String skills,
                                String tone, String experience, String contactPerson, String notes) {
        return String.format(
            "You are a professional email writer for job seekers. " +
            "Write a concise, %s cold email for the following scenario:\n\n" +
            "Goal: %s\n" +
            "Target Company: %s\n" +
            "Recipient: %s\n" +
            "Candidate Role: %s\n" +
            "Experience: %s\n" +
            "Skills: %s\n" +
            (notes.isBlank() ? "" : "Additional Note: " + notes + "\n") +
            "\nFormat your response as:\n" +
            "Subject: [subject line here]\n\n" +
            "[email body here]\n\n" +
            "Do NOT add placeholders like [Your Name]. Sign off with 'Best Regards,\\nCandidate'. Keep it under 200 words.",
            tone, goal, company, contactPerson, role, experience, skills
        );
    }

    private ColdEmailResponse generateFallback(ColdEmailRequest req) {
        String goal = req.getGoal() != null ? req.getGoal().toLowerCase() : "job inquiry";
        String tone = req.getTone() != null ? req.getTone().toLowerCase() : "professional";
        String contactName = (req.getContactPerson() != null && !req.getContactPerson().isBlank())
            ? req.getContactPerson().split(" ")[0] : "Hiring Team";
        String company = req.getCompany() != null ? req.getCompany() : "your organization";
        String role = req.getCurrentRole() != null ? req.getCurrentRole() : "Professional";
        String skills = req.getSkills() != null ? req.getSkills() : "various modern technologies";

        String subject;
        StringBuilder body = new StringBuilder();
        body.append(tone.equals("friendly") ? "Hi " : "Dear ").append(contactName).append(",\n\n");
        body.append(tone.equals("friendly") ? "I hope you're having a great week!\n\n" : "I hope this email finds you well.\n\n");

        if (goal.contains("referral")) {
            subject = "Referral Request: " + role + " Opportunity";
            body.append("I came across your profile while exploring opportunities at ").append(company)
                .append(". I am a ").append(role).append(" skilled in ").append(skills)
                .append(". I am actively seeking opportunities and would truly appreciate any referral or guidance regarding openings at your organization.");
        } else if (goal.contains("internship")) {
            subject = "Internship Request: " + role;
            body.append("I am an aspiring ").append(role).append(" eager to contribute at ").append(company)
                .append(". I have built skills in ").append(skills)
                .append(" and am actively looking for internship opportunities to apply my knowledge in a real-world setting.");
        } else if (goal.contains("networking")) {
            subject = "Connecting with a Professional at " + company;
            body.append("I have been following the impressive work at ").append(company)
                .append(". As a ").append(role).append(" skilled in ").append(skills)
                .append(", I would love to connect and learn from your experience in the industry.");
        } else {
            subject = "Inquiring about " + role + " Opportunities at " + company;
            body.append("I am writing to express my strong interest in joining ").append(company)
                .append(". As a ").append(role).append(" skilled in ").append(skills)
                .append(", I believe I can add great value to your team. Could you let me know if there are any current openings?");
        }

        body.append("\n\n").append(tone.equals("friendly") ? "Thanks so much!" : "Thank you for your time and consideration.")
            .append("\n\nBest Regards,\nCandidate");

        return new ColdEmailResponse(subject, body.toString());
    }
}
