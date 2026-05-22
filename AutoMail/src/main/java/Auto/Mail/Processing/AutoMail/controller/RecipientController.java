package Auto.Mail.Processing.AutoMail.controller;

import Auto.Mail.Processing.AutoMail.entity.Recipient;
import Auto.Mail.Processing.AutoMail.repository.RecipientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipients")
public class RecipientController {

    @Autowired
    private RecipientRepository recipientRepository;

    @GetMapping
    public List<Recipient> getAll() {
        return recipientRepository.findAll();
    }

    @GetMapping("/active")
    public List<Recipient> getActive() {
        return recipientRepository.findByActiveTrue();
    }

    @PostMapping
    public Recipient create(@RequestBody Recipient recipient) {
        return recipientRepository.save(recipient);
    }

    @PostMapping("/bulk")
    public List<Recipient> createBulk(@RequestBody List<Recipient> recipients) {
        return recipientRepository.saveAll(recipients);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Recipient> update(@PathVariable Long id, @RequestBody Recipient incoming) {
        return recipientRepository.findById(id).map(existing -> {
            existing.setName(incoming.getName());
            existing.setEmail(incoming.getEmail());
            existing.setCompany(incoming.getCompany());
            existing.setPosition(incoming.getPosition());
            existing.setActive(incoming.isActive());
            return ResponseEntity.ok(recipientRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!recipientRepository.existsById(id)) return ResponseEntity.notFound().build();
        recipientRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
