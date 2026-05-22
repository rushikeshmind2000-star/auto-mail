package Auto.Mail.Processing.AutoMail.controller;

import Auto.Mail.Processing.AutoMail.entity.EmailAttachment;
import Auto.Mail.Processing.AutoMail.repository.EmailAttachmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    @Autowired
    private EmailAttachmentRepository repository;

    @GetMapping
    public ResponseEntity<?> getAllResumes() {
        List<Map<String, Object>> list = repository.findAll().stream()
                .map(a -> Map.<String, Object>of(
                        "id", a.getId(),
                        "fileName", a.getFileName(),
                        "size", a.getData() != null ? a.getData().length : 0
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Empty file"));
        try {
            EmailAttachment attachment = new EmailAttachment();
            attachment.setFileName(file.getOriginalFilename());
            attachment.setContentType(file.getContentType());
            attachment.setData(file.getBytes());
            attachment = repository.save(attachment);
            return ResponseEntity.ok(Map.of(
                    "id", attachment.getId(),
                    "fileName", attachment.getFileName(),
                    "size", attachment.getData().length
            ));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload resume"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResume(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
