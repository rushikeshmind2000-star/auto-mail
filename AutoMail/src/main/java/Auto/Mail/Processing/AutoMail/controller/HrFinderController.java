package Auto.Mail.Processing.AutoMail.controller;

import Auto.Mail.Processing.AutoMail.dto.CompanySearchResponse;
import Auto.Mail.Processing.AutoMail.service.HrFinderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/hr-finder")
public class HrFinderController {

    @Autowired
    private HrFinderService hrFinderService;

    /**
     * GET /api/hr-finder/search?company=Infosys
     * Returns company details + up to 20 generated HR contacts.
     */
    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String company) {
        if (company == null || company.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Company name is required"));
        }
        CompanySearchResponse result = hrFinderService.search(company);
        return ResponseEntity.ok(result);
    }
}
