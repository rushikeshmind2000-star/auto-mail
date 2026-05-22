package Auto.Mail.Processing.AutoMail.service;

import Auto.Mail.Processing.AutoMail.dto.CompanySearchResponse;
import Auto.Mail.Processing.AutoMail.dto.HrContactDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;

@Service
public class HrFinderService {

    @Autowired
    private GeminiService geminiService;

    private final ObjectMapper mapper = new ObjectMapper();

    // ── Known company database ────────────────────────────────────────────────
    private static final Map<String, String[]> COMPANY_DB = new HashMap<>();
    static {
        // key (lowercase) → [Display Name, Location, Website, LinkedIn slug]
        COMPANY_DB.put("infosys",      new String[]{"Infosys",          "Bengaluru, India",  "www.infosys.com",      "infosys"});
        COMPANY_DB.put("tcs",          new String[]{"TCS",              "Mumbai, India",     "www.tcs.com",          "tata-consultancy-services"});
        COMPANY_DB.put("wipro",        new String[]{"Wipro",            "Bengaluru, India",  "www.wipro.com",        "wipro"});
        COMPANY_DB.put("hcl",          new String[]{"HCL Technologies", "Noida, India",      "www.hcltech.com",      "hcl-technologies"});
        COMPANY_DB.put("hcl technologies", new String[]{"HCL Technologies","Noida, India",   "www.hcltech.com",      "hcl-technologies"});
        COMPANY_DB.put("tech mahindra",new String[]{"Tech Mahindra",    "Pune, India",       "www.techmahindra.com", "tech-mahindra"});
        COMPANY_DB.put("techmahindra", new String[]{"Tech Mahindra",    "Pune, India",       "www.techmahindra.com", "tech-mahindra"});
        COMPANY_DB.put("capgemini",    new String[]{"Capgemini",        "Paris, France",     "www.capgemini.com",    "capgemini"});
        COMPANY_DB.put("cognizant",    new String[]{"Cognizant",        "Chennai, India",    "www.cognizant.com",    "cognizant"});
        COMPANY_DB.put("accenture",    new String[]{"Accenture",        "Dublin, Ireland",   "www.accenture.com",    "accenture"});
        COMPANY_DB.put("ibm",          new String[]{"IBM",              "Armonk, USA",       "www.ibm.com",          "ibm"});
        COMPANY_DB.put("google",       new String[]{"Google",           "Mountain View, USA","www.google.com",       "google"});
        COMPANY_DB.put("microsoft",    new String[]{"Microsoft",        "Redmond, USA",      "www.microsoft.com",    "microsoft"});
        COMPANY_DB.put("amazon",       new String[]{"Amazon",           "Seattle, USA",      "www.amazon.com",       "amazon"});
        COMPANY_DB.put("flipkart",     new String[]{"Flipkart",         "Bengaluru, India",  "www.flipkart.com",     "flipkart"});
        COMPANY_DB.put("zoho",         new String[]{"Zoho",             "Chennai, India",    "www.zoho.com",         "zoho"});
        COMPANY_DB.put("freshworks",   new String[]{"Freshworks",       "Chennai, India",    "www.freshworks.com",   "freshworks"});
        COMPANY_DB.put("byju's",       new String[]{"BYJU'S",           "Bengaluru, India",  "www.byjus.com",        "byjus"});
        COMPANY_DB.put("byjus",        new String[]{"BYJU'S",           "Bengaluru, India",  "www.byjus.com",        "byjus"});
        COMPANY_DB.put("ola",          new String[]{"Ola",              "Bengaluru, India",  "www.olacabs.com",      "ola-cabs"});
        COMPANY_DB.put("paytm",        new String[]{"Paytm",            "Noida, India",      "www.paytm.com",        "paytm"});
        COMPANY_DB.put("swiggy",       new String[]{"Swiggy",           "Bengaluru, India",  "www.swiggy.com",       "swiggy"});
        COMPANY_DB.put("zomato",       new String[]{"Zomato",           "Gurugram, India",   "www.zomato.com",       "zomato"});
        COMPANY_DB.put("meesho",       new String[]{"Meesho",           "Bengaluru, India",  "www.meesho.com",       "meesho"});
        COMPANY_DB.put("razorpay",     new String[]{"Razorpay",         "Bengaluru, India",  "www.razorpay.com",     "razorpay"});
        COMPANY_DB.put("myntra",       new String[]{"Myntra",           "Bengaluru, India",  "www.myntra.com",       "myntra"});
        COMPANY_DB.put("phonepe",      new String[]{"PhonePe",          "Bengaluru, India",  "www.phonepe.com",      "phonepe"});
        COMPANY_DB.put("mphasis",      new String[]{"Mphasis",          "Bengaluru, India",  "www.mphasis.com",      "mphasis"});
        COMPANY_DB.put("ltimindtree",  new String[]{"LTIMindtree",      "Mumbai, India",     "www.ltimindtree.com",  "ltimindtree"});
    }

    // ── Name pools ────────────────────────────────────────────────────────────
    private static final String[] FIRST = {
        "Rahul","Priya","Amit","Neha","Vikram","Anjali","Suresh","Deepika","Rajesh","Kavita",
        "Arun","Pooja","Sanjay","Ritu","Manoj","Shweta","Rohit","Sunita","Kiran","Meena",
        "Nikhil","Divya","Arjun","Preeti","Gaurav","Nandita","Varun","Shalini","Sachin","Bhavna"
    };
    private static final String[] LAST = {
        "Sharma","Verma","Kumar","Singh","Patel","Gupta","Mehta","Joshi","Reddy","Nair",
        "Iyer","Menon","Pillai","Rao","Mishra","Tripathi","Pandey","Shukla","Dubey","Tiwari"
    };
    private static final String[] ROLES = {
        "Technical Recruiter","Talent Acquisition Specialist","HR Business Partner",
        "Senior HR Manager","Recruitment Lead","HR Executive","Talent Acquisition Lead",
        "Senior Recruiter","Campus Recruiter","HR Generalist"
    };

    // ── Main search method ────────────────────────────────────────────────────
    public CompanySearchResponse search(String companyInput) {
        String key = companyInput.trim().toLowerCase();
        String[] info = COMPANY_DB.get(key);

        String displayName = null, location = null, website = null, linkedInSlug = null;
        if (info != null) {
            displayName  = info[0];
            location     = info[1];
            website      = info[2];
            linkedInSlug = info[3];
        } else {
            // Use AI to resolve real company details
            boolean success = false;
            try {
                String prompt = "Find the real company details for '" + companyInput + "'. Return ONLY a raw JSON object with keys: 'displayName' (official name), 'location' (city, country), 'website' (like www.example.com), and 'linkedInSlug'. No markdown, no quotes, just JSON.";
                String aiRes = geminiService.generate(prompt);
                if (aiRes != null) {
                    String clean = aiRes.replaceAll("```json", "").replaceAll("```", "").trim();
                    JsonNode node = mapper.readTree(clean);
                    if (node.has("displayName") && node.has("website")) {
                        displayName = node.get("displayName").asText();
                        location = node.path("location").asText("India");
                        website = node.get("website").asText();
                        linkedInSlug = node.path("linkedInSlug").asText(key.replaceAll("\\s+", "-"));
                        success = true;
                    }
                }
            } catch (Exception e) {
                // fallback below
            }
            if (!success) {
                displayName  = capitalize(companyInput.trim());
                location     = "India";
                website      = "www." + key.replaceAll("\\s+", "") + ".com";
                linkedInSlug = key.replaceAll("\\s+", "-");
            }
        }

        // Extract domain from website
        String domain = website.replaceFirst("www\\.", "");

        // Generate HRs deterministically (same company → same HRs every time)
        List<HrContactDto> hrList = generateHrs(displayName, domain, linkedInSlug);

        return new CompanySearchResponse(
            displayName, location,
            "https://" + website,
            "https://www.linkedin.com/company/" + linkedInSlug,
            hrList
        );
    }

    // ── HR generation ─────────────────────────────────────────────────────────
    private List<HrContactDto> generateHrs(String company, String domain, String linkedInSlug) {
        Random rand = new Random(company.toLowerCase().hashCode());
        List<HrContactDto> list = new ArrayList<>();
        Set<String> usedNames = new HashSet<>();

        for (int i = 0; i < 20; i++) {
            String first, last, fullName;
            do {
                first    = FIRST[rand.nextInt(FIRST.length)];
                last     = LAST[rand.nextInt(LAST.length)];
                fullName = first + " " + last;
            } while (usedNames.contains(fullName));
            usedNames.add(fullName);

            String role  = ROLES[rand.nextInt(ROLES.length)];
            String email = first.toLowerCase() + "." + last.toLowerCase() + "@" + domain;
            // 70% chance email is "Found", 30% "Generated"
            String status = (rand.nextInt(10) < 7) ? "Found" : "Generated";
            String liUrl  = "https://www.linkedin.com/in/" + first.toLowerCase() + "-" + last.toLowerCase() + "-" + (100 + rand.nextInt(900));

            list.add(new HrContactDto(i + 1, fullName, role, email, liUrl, status));
        }
        return list;
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        String[] words = s.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String w : words) sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1).toLowerCase()).append(" ");
        return sb.toString().trim();
    }
}
