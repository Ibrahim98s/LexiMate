package com.leximate.leximate_backend.controller;

import com.leximate.leximate_backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
                    "token", result.token(),
                    "fullName", result.fullName(),
                    "email", result.email()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthService.AuthResult result = authService.login(request.email(), request.password());
            return ResponseEntity.ok(Map.of(
                    "token", result.token(),
                    "fullName", result.fullName(),
                    "email", result.email()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            AuthService.AuthResult result = authService.getCurrentUser(token);
            return ResponseEntity.ok(Map.of(
                    "fullName", result.fullName(),
                    "email", result.email()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired session"));
        }
    }

    public record RegisterRequest(String fullName, String email, String password) {
    }

    public record LoginRequest(String email, String password) {
    }
}