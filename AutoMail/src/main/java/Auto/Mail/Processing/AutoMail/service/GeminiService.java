package Auto.Mail.Processing.AutoMail.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

/**
 * Calls Google Gemini 1.5 Flash (FREE tier) for all AI generation.
 * Get your free key at: https://aistudio.google.com/app/apikey
 */
@Service
public class GeminiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private static final String ENDPOINT =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Sends a prompt to Gemini and returns the generated text.
     * Falls back gracefully if API key is not set.
     */
    public String generate(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            return null; // Signal to caller to use fallback
        }
        try {
            String body = String.format("""
                {
                  "contents": [{
                    "parts": [{"text": %s}]
                  }],
                  "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 512
                  }
                }
                """, mapper.writeValueAsString(prompt));

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(ENDPOINT + "?key=" + apiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

            HttpResponse<String> response = httpClient.send(request,
                HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = mapper.readTree(response.body());
                return root.path("candidates").get(0)
                           .path("content").path("parts").get(0)
                           .path("text").asText();
            } else {
                System.err.println("Gemini API error: " + response.statusCode() + " " + response.body());
                return null;
            }
        } catch (Exception e) {
            System.err.println("Gemini call failed: " + e.getMessage());
            return null;
        }
    }
}
