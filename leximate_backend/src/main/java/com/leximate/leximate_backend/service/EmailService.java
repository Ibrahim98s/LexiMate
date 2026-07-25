package com.leximate.leximate_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Service
public class EmailService {

    @Value("${GMAIL_CLIENT_ID:${gmail.client-id:}}")
    private String clientId;

    @Value("${GMAIL_CLIENT_SECRET:${gmail.client-secret:}}")
    private String clientSecret;

    @Value("${GMAIL_REFRESH_TOKEN:${gmail.refresh-token:}}")
    private String refreshToken;

    @Value("${GMAIL_SENDER_EMAIL:${gmail.sender-email:}}")
    private String senderEmail;

    private final WebClient tokenClient = WebClient.builder()
            .baseUrl("https://oauth2.googleapis.com")
            .build();

    private final WebClient gmailClient = WebClient.builder()
            .baseUrl("https://gmail.googleapis.com")
            .build();

    public void sendVerificationCode(String toEmail, String code) {
        String accessToken = fetchAccessToken();
        String rawMessage = buildRawMessage(toEmail, code);

        gmailClient.post()
                .uri("/gmail/v1/users/me/messages/send")
                .header("Authorization", "Bearer " + accessToken)
                .bodyValue(Map.of("raw", rawMessage))
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    private String fetchAccessToken() {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("refresh_token", refreshToken);
        form.add("grant_type", "refresh_token");

        Map<?, ?> response = tokenClient.post()
                .uri("/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .bodyValue(form)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null || response.get("access_token") == null) {
            throw new RuntimeException("Failed to refresh Gmail access token");
        }

        return response.get("access_token").toString();
    }

    private String buildRawMessage(String toEmail, String code) {
        String subject = "Your LexiMate verification code";
        String body = "Your verification code is: " + code +
                "\n\nThis code expires in 10 minutes." +
                "\n\nIf you didn't request this, you can ignore this email.";

        String email =
                "From: " + senderEmail + "\r\n" +
                "To: " + toEmail + "\r\n" +
                "Subject: " + subject + "\r\n" +
                "Content-Type: text/plain; charset=UTF-8\r\n\r\n" +
                body;

        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(email.getBytes(StandardCharsets.UTF_8));
    }
}