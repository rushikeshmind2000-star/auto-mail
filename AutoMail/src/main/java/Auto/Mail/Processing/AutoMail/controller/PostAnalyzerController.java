package Auto.Mail.Processing.AutoMail.controller;

import Auto.Mail.Processing.AutoMail.dto.PostAnalyzerRequest;
import Auto.Mail.Processing.AutoMail.dto.PostAnalyzerResponse;
import Auto.Mail.Processing.AutoMail.service.PostAnalyzerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analyze")
public class PostAnalyzerController {

    @Autowired
    private PostAnalyzerService postAnalyzerService;

    /**
     * POST /api/analyze
     * Body: { "postText": "We are hiring React Developers...", "yourName": "Prasad Mohite" }
     */
    @PostMapping
    public ResponseEntity<?> analyze(@RequestBody PostAnalyzerRequest req) {
        if (req.getPostText() == null || req.getPostText().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Post text is required"));
        }
        PostAnalyzerResponse result = postAnalyzerService.analyze(req);
        return ResponseEntity.ok(result);
    }
}
