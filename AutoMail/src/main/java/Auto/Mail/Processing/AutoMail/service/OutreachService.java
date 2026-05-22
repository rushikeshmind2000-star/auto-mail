package Auto.Mail.Processing.AutoMail.service;

import Auto.Mail.Processing.AutoMail.dto.OutreachRequest;
import Auto.Mail.Processing.AutoMail.dto.OutreachResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OutreachService {

    @Autowired
    private GeminiService geminiService;

    public OutreachResponse generateMessage(OutreachRequest req) {
        String hrName = req.getHrName() != null && !req.getHrName().isBlank() ? req.getHrName() : "Hiring Manager";
        String hrFirstName = hrName.split(" ")[0];
        String candidateName = req.getCandidateName() != null ? req.getCandidateName() : "Candidate";
        String company = req.getCompany() != null ? req.getCompany() : "your organization";
        String role = req.getTargetRole() != null ? req.getTargetRole() : "Software Developer";
        String exp = req.getExperienceLevel() != null ? req.getExperienceLevel() : "Fresher";
        List<String> skillsList = req.getCandidateSkills();
        String skills = (skillsList != null && !skillsList.isEmpty()) ? String.join(", ", skillsList) : "modern technologies";
        String tone = req.getTone() != null ? req.getTone() : "Professional";
        String goal = req.getGoal() != null ? req.getGoal() : "Looking for Openings";

        // ── Try Gemini AI first ─────────────────────────────────────────────────
        String prompt = String.format(
            "Write a short, %s LinkedIn outreach message from a job seeker to an HR/recruiter.\n\n" +
            "HR Name: %s\n" +
            "Company: %s\n" +
            "Candidate Name: %s\n" +
            "Candidate Role: %s\n" +
            "Experience: %s\n" +
            "Skills: %s\n" +
            "Goal: %s\n\n" +
            "Rules:\n" +
            "- Start with 'Hello %s,'\n" +
            "- Keep it under 120 words\n" +
            "- Make it %s in tone\n" +
            "- End with 'Best Regards,\\n%s'\n" +
            "- Do NOT use placeholders like [Your Name]",
            tone, hrName, company, candidateName, role, exp, skills, goal,
            hrFirstName, tone.toLowerCase(), candidateName
        );

        String aiText = geminiService.generate(prompt);
        if (aiText != null && !aiText.isBlank()) {
            return new OutreachResponse(aiText.trim());
        }

        // ── Rule-based fallback ────────────────────────────────────────────────
        StringBuilder sb = new StringBuilder();
        sb.append("Hello ").append(hrFirstName).append(",\n\n");
        sb.append("I recently came across your profile while exploring opportunities at ").append(company).append(".\n\n");

        if (exp.equalsIgnoreCase("fresher") || exp.contains("0")) {
            sb.append("I am a passionate ").append(role).append(" skilled in ").append(skills).append(". ");
        } else {
            sb.append("I am an experienced ").append(role).append(" with expertise in ").append(skills).append(". ");
        }
        sb.append("I am actively seeking opportunities where I can contribute and grow.\n\n");

        if (goal.toLowerCase().contains("referral")) {
            sb.append("I would greatly appreciate any guidance or referral opportunities within your team.");
        } else {
            sb.append("Please let me know if there are any suitable openings. I would love to connect.");
        }
        sb.append("\n\nThank you for your time.\n\nBest Regards,\n").append(candidateName);

        return new OutreachResponse(sb.toString());
    }
}
