package Auto.Mail.Processing.AutoMail.controller;

import Auto.Mail.Processing.AutoMail.dto.OutreachRequest;
import Auto.Mail.Processing.AutoMail.dto.OutreachResponse;
import Auto.Mail.Processing.AutoMail.service.OutreachService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/outreach")
public class OutreachController {

    @Autowired
    private OutreachService outreachService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateMessage(@RequestBody OutreachRequest req) {
        OutreachResponse resp = outreachService.generateMessage(req);
        return ResponseEntity.ok(resp);
    }
}
