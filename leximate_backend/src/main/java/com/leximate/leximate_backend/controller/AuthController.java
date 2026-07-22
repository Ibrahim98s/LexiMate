package com.leximate.leximate_backend.controller;

import com.leximate.leximate_backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthService.AuthResult result = authService.register(request.fullName(), request.email(), request.password());
            return ResponseEntity.ok(Map.of(
                    "email", result.email(),
                    "fullName", result.fullName(),
                    "message", "Verification code sent to your email"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody VerifyEmailRequest request) {
        try {
            AuthService.AuthResult result = authService.verifyEmail(request.email(), request.code());
            return ResponseEntity.ok(toResponseMap(result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/resend-code")
    public ResponseEntity<?> resendCode(@RequestBody ResendCodeRequest request) {
        try {
            authService.resendVerificationCode(request.email());
            return ResponseEntity.ok(Map.of("message", "Verification code sent"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthService.AuthResult result = authService.login(request.email(), request.password());
            return ResponseEntity.ok(toResponseMap(result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            AuthService.AuthResult result = authService.getCurrentUser(token);
            return ResponseEntity.ok(toResponseMap(result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired session"));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UpdateProfileRequest request
    ) {
        try {
            String token = authHeader.replace("Bearer ", "");
            AuthService.AuthResult result = authService.updateProfile(token, request.fullName(), request.email());
            return ResponseEntity.ok(toResponseMap(result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ChangePasswordRequest request
    ) {
        try {
            String token = authHeader.replace("Bearer ", "");
            authService.changePassword(token, request.currentPassword(), request.newPassword());
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteAccount(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody DeleteAccountRequest request
    ) {
        try {
            String token = authHeader.replace("Bearer ", "");
            authService.deleteAccount(token, request.password());
            return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> toResponseMap(AuthService.AuthResult result) {
        Map<String, Object> response = new HashMap<>();
        response.put("token", result.token());
        response.put("fullName", result.fullName());
        response.put("email", result.email());
        response.put("isPremium", result.isPremium());
        response.put("premiumExpiresAt", result.premiumExpiresAt());
        response.put("scansUsed", result.scansUsed());
        response.put("scanLimit", result.scanLimit());
        return response;
    }

    public record RegisterRequest(String fullName, String email, String password) {
    }

    public record LoginRequest(String email, String password) {
    }

    public record VerifyEmailRequest(String email, String code) {
    }

    public record ResendCodeRequest(String email) {
    }

    public record UpdateProfileRequest(String fullName, String email) {
    }

    public record ChangePasswordRequest(String currentPassword, String newPassword) {
    }

    public record DeleteAccountRequest(String password) {
    }
}