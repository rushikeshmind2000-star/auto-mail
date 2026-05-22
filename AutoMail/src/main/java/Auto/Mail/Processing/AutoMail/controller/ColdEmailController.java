package Auto.Mail.Processing.AutoMail.controller;

import Auto.Mail.Processing.AutoMail.dto.ColdEmailRequest;
import Auto.Mail.Processing.AutoMail.dto.ColdEmailResponse;
import Auto.Mail.Processing.AutoMail.service.ColdEmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cold-email")
public class ColdEmailController {

    @Autowired
    private ColdEmailService coldEmailService;

    @PostMapping("/generate")
    public ResponseEntity<ColdEmailResponse> generate(@RequestBody ColdEmailRequest request) {
        return ResponseEntity.ok(coldEmailService.generateEmail(request));
    }
}
