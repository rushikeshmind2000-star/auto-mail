package Auto.Mail.Processing.AutoMail.dto;

import java.util.List;

public class CompanySearchResponse {
    private String companyName;
    private String location;
    private String website;
    private String linkedIn;
    private List<HrContactDto> hrList;

    public CompanySearchResponse() {}
    public CompanySearchResponse(String companyName, String location, String website, String linkedIn, List<HrContactDto> hrList) {
        this.companyName = companyName; this.location = location;
        this.website = website; this.linkedIn = linkedIn; this.hrList = hrList;
    }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getLinkedIn() { return linkedIn; }
    public void setLinkedIn(String linkedIn) { this.linkedIn = linkedIn; }
    public List<HrContactDto> getHrList() { return hrList; }
    public void setHrList(List<HrContactDto> hrList) { this.hrList = hrList; }
}
