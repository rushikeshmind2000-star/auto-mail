package Auto.Mail.Processing.AutoMail.controller;

import Auto.Mail.Processing.AutoMail.entity.BodyTemplate;
import Auto.Mail.Processing.AutoMail.repository.BodyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bodies")
public class BodyController {

    @Autowired
    private BodyRepository bodyRepository;

    @GetMapping
    public List<BodyTemplate> getAll() {
        return bodyRepository.findAll();
    }

    @PostMapping
    public BodyTemplate create(@RequestBody BodyTemplate body) {
        return bodyRepository.save(body);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BodyTemplate> update(@PathVariable Long id, @RequestBody BodyTemplate incoming) {
        return bodyRepository.findById(id).map(existing -> {
            existing.setTitle(incoming.getTitle());
            existing.setContent(incoming.getContent());
            return ResponseEntity.ok(bodyRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!bodyRepository.existsById(id)) return ResponseEntity.notFound().build();
        bodyRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
