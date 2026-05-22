package Auto.Mail.Processing.AutoMail.dto;

public class PostAnalyzerRequest {
    private String postText;
    private String yourName; // optional - for personalizing the email sign-off

    public String getPostText() { return postText; }
    public void setPostText(String postText) { this.postText = postText; }
    public String getYourName() { return yourName; }
    public void setYourName(String yourName) { this.yourName = yourName; }
}
