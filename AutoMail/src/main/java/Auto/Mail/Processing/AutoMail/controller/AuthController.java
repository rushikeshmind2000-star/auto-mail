package Auto.Mail.Processing.AutoMail.controller;

import Auto.Mail.Processing.AutoMail.entity.UserProfile;
import Auto.Mail.Processing.AutoMail.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthService authService;

    // ── POST /api/auth/register ───────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> body) {
        String fullName = body.get("fullName");
        String email    = body.get("email");
        String password = body.get("password");

        if (fullName == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false, "message", "fullName, email and password are required."
            ));
        }
        return ResponseEntity.ok(authService.register(fullName, email, password));
    }

    // ── POST /api/auth/login ──────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false, "message", "email and password are required."
            ));
        }
        Map<String, Object> result = authService.login(email, password);
        boolean ok = Boolean.TRUE.equals(result.get("success"));
        return ok ? ResponseEntity.ok(result) : ResponseEntity.status(401).body(result);
    }

    // ── GET /api/auth/me?userId=1 ─────────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@RequestParam Long userId) {
        return ResponseEntity.ok(authService.getUserById(userId));
    }

    // ── PUT /api/auth/profile?userId=1 ───────────────────────────────────────
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestParam Long userId,
            @RequestBody UserProfile profile) {
        return ResponseEntity.ok(authService.updateProfile(userId, profile));
    }
}
