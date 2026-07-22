package com.leximate.leximate_backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.leximate.leximate_backend.model.User;
import com.leximate.leximate_backend.repository.UserRepository;
import com.leximate.leximate_backend.service.PaystackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaystackService paystackService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/initialize")
    public ResponseEntity<?> initializePayment(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);

            // callback_url is where Paystack redirects after payment;
            // not used by the mobile flow but Paystack requires something here
            String callbackUrl = "https://leximate.app/payment-complete";

            JsonNode result = paystackService.initializeTransaction(user.getEmail(), callbackUrl);

            if (!result.path("status").asBoolean(false)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to initialize payment"));
            }

            String authorizationUrl = result.path("data").path("authorization_url").asText();
            String reference = result.path("data").path("reference").asText();

            return ResponseEntity.ok(Map.of(
                    "authorizationUrl", authorizationUrl,
                    "reference", reference
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Payment initialization failed"));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        try {
            User user = getCurrentUser(authentication);
            String reference = body.get("reference");

            if (reference == null || reference.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing reference"));
            }

            JsonNode result = paystackService.verifyTransaction(reference);
            String status = result.path("data").path("status").asText("");

            if (!"success".equals(status)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Payment was not successful"));
            }

            // Confirm the payment was actually made by this user's email,
            // not just any successful transaction reference
            String paidEmail = result.path("data").path("customer").path("email").asText("");
            if (!paidEmail.equalsIgnoreCase(user.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Payment email mismatch"));
            }

            user.setPremium(true);
            user.setPremiumExpiresAt(LocalDateTime.now().plusDays(30));
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "isPremium", true,
                    "premiumExpiresAt", user.getPremiumExpiresAt().toString()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Payment verification failed"));
        }
    }
}