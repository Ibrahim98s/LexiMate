package com.leximate.leximate_backend.service;

import com.leximate.leximate_backend.model.User;
import com.leximate.leximate_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResult register(String fullName, String email, String rawPassword) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        String hashedPassword = passwordEncoder.encode(rawPassword);
        User user = new User(fullName, email, hashedPassword);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResult(token, user.getFullName(), user.getEmail());
    }

    public AuthResult login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResult(token, user.getFullName(), user.getEmail());
    }

    public AuthResult getCurrentUser(String token) {
        if (!jwtUtil.isTokenValid(token)) {
            throw new IllegalArgumentException("Invalid or expired token");
        }

        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new AuthResult(token, user.getFullName(), user.getEmail());
    }

    public record AuthResult(String token, String fullName, String email) {
    }
}