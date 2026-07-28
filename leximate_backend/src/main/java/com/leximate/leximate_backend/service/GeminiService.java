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
                You are analyzing a photo that is supposed to show a legal document. First determine whether the image actually contains a readable document with text on it (not a blank/dark/blurry image, not an unrelated photo, not empty space).

                Respond with ONLY a JSON object (no markdown, no extra text) in this exact shape:
                {
                  "documentDetected": true or false,
                  "title": "short descriptive title for this document, or empty string if no document was detected",
                  "originalLanguage": "detected original language code, e.g. en, or empty string if no document was detected",
                  "summary": "a plain-language summary of what this document says, 3-5 sentences, written in %s. Empty string if no document was detected.",
                  "translation": "the full text of the document translated into %s. Empty string if no document was detected.",
                  "riskLevel": "low" or "medium" or "high", or null if no document was detected,
                  "riskScore": a number from 0 to 100, or 0 if no document was detected,
                  "flaggedPoints": ["short risky clause 1", "short risky clause 2"], or empty array if no document was detected
                }

                Set "documentDetected" to true if the image shows any readable document text — whether on paper, a screen, or another surface — even if lighting, glare, or angle make it imperfect, as long as you can make out most of the content. Only set "documentDetected" to false if the image is genuinely blank, completely dark, too blurry to read any text at all, or clearly not a document (e.g. a random object or empty background). Do not fabricate content for a document you cannot actually read.
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

    public String askQuestion(String documentText, String question) {
        String prompt = """
                You are a helpful assistant answering questions about a legal document. Here is the full text of the document:

                ---
                %s
                ---

                Answer the following question about this document, clearly and concisely, in plain language. If the answer isn't found in the document, say so honestly rather than guessing.

                Question: %s
                """.formatted(documentText, question);

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", prompt)
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
            return root
                    .path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText()
                    .trim();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response: " + responseJson, e);
        }
    }
}