package com.leximate.leximate_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class PaystackService {

    @Value("${paystack.secret.key}")
    private String secretKey;

    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://api.paystack.co")
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public static final int PREMIUM_PRICE_KOBO = 5000; // ₵50.00

    public JsonNode initializeTransaction(String email, String callbackUrl) {
        Map<String, Object> requestBody = Map.of(
                "email", email,
                "amount", PREMIUM_PRICE_KOBO,
                "currency", "GHS",
                "callback_url", callbackUrl
        );

        String responseJson = webClient.post()
                .uri("/transaction/initialize")
                .header("Authorization", "Bearer " + secretKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        try {
            return objectMapper.readTree(responseJson);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Paystack response: " + responseJson, e);
        }
    }

    public JsonNode verifyTransaction(String reference) {
        String responseJson = webClient.get()
                .uri("/transaction/verify/" + reference)
                .header("Authorization", "Bearer " + secretKey)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        try {
            return objectMapper.readTree(responseJson);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Paystack response: " + responseJson, e);
        }
    }
}