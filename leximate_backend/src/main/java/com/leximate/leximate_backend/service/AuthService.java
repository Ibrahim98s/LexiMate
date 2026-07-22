package com.leximate.leximate_backend.service;

import com.leximate.leximate_backend.model.Document;
import com.leximate.leximate_backend.model.User;
import com.leximate.leximate_backend.repository.DocumentRepository;
import com.leximate.leximate_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuthService {

    private static final int FREE_SCAN_LIMIT = 5;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final DocumentRepository documentRepository;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            DocumentRepository documentRepository,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.documentRepository = documentRepository;
        this.emailService = emailService;
    }

    public AuthResult register(String fullName, String email, String rawPassword) {
        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null && user.isEmailVerified()) {
            throw new IllegalArgumentException("Email is already registered");
        }

        String hashedPassword = passwordEncoder.encode(rawPassword);
        String code = generateVerificationCode();

        if (user == null) {
            user = new User(fullName, email, hashedPassword);
        } else {
            user.setFullName(fullName);
            user.setPassword(hashedPassword);
        }

        user.setEmailVerified(false);
        user.setVerificationCodeHash(passwordEncoder.encode(code));
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(10));

        userRepository.save(user);

        emailService.sendVerificationCode(user.getEmail(), code);

        return toAuthResult(user, null);
    }

    public AuthResult login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            throw new IllegalArgumentException("Please verify your email before logging in");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return toAuthResult(user, token);
    }

    public AuthResult getCurrentUser(String token) {
        if (!jwtUtil.isTokenValid(token)) {
            throw new IllegalArgumentException("Invalid or expired token");
        }

        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return toAuthResult(user, token);
    }

    public AuthResult verifyEmail(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("This account is already verified");
        }

        if (user.getVerificationCodeHash() == null || user.getVerificationCodeExpiresAt() == null) {
            throw new IllegalArgumentException("No verification code found. Please request a new one");
        }

        if (user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("This code has expired. Please request a new one");
        }

        if (!passwordEncoder.matches(code, user.getVerificationCodeHash())) {
            throw new IllegalArgumentException("Incorrect verification code");
        }

        user.setEmailVerified(true);
        user.setVerificationCodeHash(null);
        user.setVerificationCodeExpiresAt(null);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        return toAuthResult(user, token);
    }

    public void resendVerificationCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("This account is already verified");
        }

        String code = generateVerificationCode();
        user.setVerificationCodeHash(passwordEncoder.encode(code));
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        emailService.sendVerificationCode(user.getEmail(), code);
    }

    public AuthResult updateProfile(String token, String fullName, String email) {
        if (!jwtUtil.isTokenValid(token)) {
            throw new IllegalArgumentException("Invalid or expired token");
        }

        String currentEmail = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean emailChanged = !email.equalsIgnoreCase(user.getEmail());
        if (emailChanged && userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        user.setFullName(fullName);
        user.setEmail(email);
        userRepository.save(user);

        String newToken = jwtUtil.generateToken(user.getEmail());
        return toAuthResult(user, newToken);
    }

    public void changePassword(String token, String currentPassword, String newPassword) {
        if (!jwtUtil.isTokenValid(token)) {
            throw new IllegalArgumentException("Invalid or expired token");
        }

        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void deleteAccount(String token, String password) {
        if (!jwtUtil.isTokenValid(token)) {
            throw new IllegalArgumentException("Invalid or expired token");
        }

        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Password is incorrect");
        }

        List<Document> userDocuments = documentRepository.findByUserId(user.getId());
        documentRepository.deleteAll(userDocuments);

        userRepository.delete(user);
    }

    private String generateVerificationCode() {
        int code = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(code);
    }

    private AuthResult toAuthResult(User user, String token) {
        String premiumExpiresAt = user.getPremiumExpiresAt() != null
                ? user.getPremiumExpiresAt().toString()
                : null;

        int effectiveScanCount = user.getScanCount();
        if (user.getScanCountResetAt() == null
                || LocalDateTime.now().isAfter(user.getScanCountResetAt().plusMonths(1))) {
            effectiveScanCount = 0;
        }

        return new AuthResult(
                token,
                user.getFullName(),
                user.getEmail(),
                user.isPremium(),
                premiumExpiresAt,
                effectiveScanCount,
                FREE_SCAN_LIMIT
        );
    }

    public record AuthResult(
            String token,
            String fullName,
            String email,
            boolean isPremium,
            String premiumExpiresAt,
            int scansUsed,
            int scanLimit
    ) {
    }
}