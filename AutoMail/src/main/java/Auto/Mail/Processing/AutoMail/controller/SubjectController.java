package Auto.Mail.Processing.AutoMail.controller;

import Auto.Mail.Processing.AutoMail.entity.SubjectTemplate;
import Auto.Mail.Processing.AutoMail.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    @Autowired
    private SubjectRepository subjectRepository;

    @GetMapping
    public List<SubjectTemplate> getAll() {
        return subjectRepository.findAll();
    }

    @PostMapping
    public SubjectTemplate create(@RequestBody SubjectTemplate subject) {
        return subjectRepository.save(subject);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubjectTemplate> update(@PathVariable Long id, @RequestBody SubjectTemplate incoming) {
        return subjectRepository.findById(id).map(existing -> {
            existing.setTitle(incoming.getTitle());
            existing.setContent(incoming.getContent());
            return ResponseEntity.ok(subjectRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!subjectRepository.existsById(id)) return ResponseEntity.notFound().build();
        subjectRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
