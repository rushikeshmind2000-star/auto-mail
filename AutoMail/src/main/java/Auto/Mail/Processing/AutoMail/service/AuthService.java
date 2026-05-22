package Auto.Mail.Processing.AutoMail.service;

import Auto.Mail.Processing.AutoMail.entity.User;
import Auto.Mail.Processing.AutoMail.entity.UserProfile;
import Auto.Mail.Processing.AutoMail.repository.UserProfileRepository;
import Auto.Mail.Processing.AutoMail.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired private UserRepository userRepo;
    @Autowired private UserProfileRepository profileRepo;

    // ── Register ─────────────────────────────────────────────────────────────
    public Map<String, Object> register(String fullName, String email, String password) {
        Map<String, Object> result = new HashMap<>();

        if (userRepo.existsByEmail(email)) {
            result.put("success", false);
            result.put("message", "Email already registered.");
            return result;
        }

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(password); // Plain text — add BCrypt later if needed
        user.setRole("user");
        userRepo.save(user);

        // Create empty profile for the user
        UserProfile profile = new UserProfile();
        profile.setUserId(user.getId());
        profileRepo.save(profile);

        result.put("success", true);
        result.put("message", "Registration successful.");
        result.put("user", safeUser(user));
        return result;
    }

    // ── Login ─────────────────────────────────────────────────────────────────
    public Map<String, Object> login(String email, String password) {
        Map<String, Object> result = new HashMap<>();

        Optional<User> opt = userRepo.findByEmail(email);
        if (opt.isEmpty()) {
            result.put("success", false);
            result.put("message", "No account found with this email.");
            return result;
        }

        User user = opt.get();
        if (!user.getPassword().equals(password)) {
            result.put("success", false);
            result.put("message", "Incorrect password.");
            return result;
        }

        // Fetch profile
        Optional<UserProfile> profile = profileRepo.findByUserId(user.getId());

        result.put("success", true);
        result.put("message", "Login successful.");
        result.put("user", safeUser(user));
        result.put("profile", profile.orElse(null));
        return result;
    }

    // ── Get User by ID ────────────────────────────────────────────────────────
    public Map<String, Object> getUserById(Long id) {
        Map<String, Object> result = new HashMap<>();
        Optional<User> opt = userRepo.findById(id);
        if (opt.isEmpty()) {
            result.put("success", false);
            result.put("message", "User not found.");
            return result;
        }
        User user = opt.get();
        Optional<UserProfile> profile = profileRepo.findByUserId(id);
        result.put("success", true);
        result.put("user", safeUser(user));
        result.put("profile", profile.orElse(null));
        return result;
    }

    // ── Update Profile ────────────────────────────────────────────────────────
    public Map<String, Object> updateProfile(Long userId, UserProfile updatedProfile) {
        Map<String, Object> result = new HashMap<>();
        Optional<UserProfile> existing = profileRepo.findByUserId(userId);

        UserProfile profile = existing.orElse(new UserProfile());
        profile.setUserId(userId);
        profile.setRoleName(updatedProfile.getRoleName());
        profile.setExperience(updatedProfile.getExperience());
        profile.setSkills(updatedProfile.getSkills());
        profile.setResumeUrl(updatedProfile.getResumeUrl());
        profile.setLinkedinUrl(updatedProfile.getLinkedinUrl());
        profile.setLocation(updatedProfile.getLocation());
        profileRepo.save(profile);

        result.put("success", true);
        result.put("message", "Profile updated.");
        result.put("profile", profile);
        return result;
    }

    // ── Strip password from response ──────────────────────────────────────────
    private Map<String, Object> safeUser(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.getId());
        m.put("fullName", u.getFullName());
        m.put("email", u.getEmail());
        m.put("role", u.getRole());
        m.put("createdAt", u.getCreatedAt());
        return m;
    }
}
