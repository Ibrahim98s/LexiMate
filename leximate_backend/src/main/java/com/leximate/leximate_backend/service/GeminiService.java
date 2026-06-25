package com.leximate.leximate_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Base64;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://generativelanguage.googleapis.com/v1beta")
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public JsonNode analyzeDocumentImage(byte[] imageBytes, String targetLanguage) {
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);

        String prompt = """
                You are analyzing a photo of a legal document. Read the text in the image, then respond with ONLY a JSON object (no markdown, no extra text) in this exact shape:
                {
                  "title": "short descriptive title for this document",
                  "originalLanguage": "detected original language code, e.g. en",
                  "summary": "a plain-language summary of what this document says, 3-5 sentences, written in %s",
                  "translation": "the full text of the document translated into %s",
                  "riskLevel": "low" or "medium" or "high",
                  "riskScore": a number from 0 to 100,
                  "flaggedPoints": ["short risky clause 1", "short risky clause 2"]
                }
                """.formatted(targetLanguage, targetLanguage);

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", prompt),
                                Map.of("inline_data", Map.of(
                                        "mime_type", "image/jpeg",
                                        "data", base64Image
                                ))
                        })
                }
        );

        String responseJson = webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/models/gemini-2.5-flash:generateContent")
                        .queryParam("key", apiKey)
                        .build())
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        try {
            JsonNode root = objectMapper.readTree(responseJson);
            String rawText = root
                    .path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

            String cleaned = rawText
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            return objectMapper.readTree(cleaned);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response: " + responseJson, e);
        }
    }
}