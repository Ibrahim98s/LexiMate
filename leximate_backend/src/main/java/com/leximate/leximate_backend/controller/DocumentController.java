package com.leximate.leximate_backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.leximate.leximate_backend.model.Document;
import com.leximate.leximate_backend.model.User;
import com.leximate.leximate_backend.repository.DocumentRepository;
import com.leximate.leximate_backend.repository.UserRepository;
import com.leximate.leximate_backend.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private static final int FREE_SCAN_LIMIT = 5;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GeminiService geminiService;

    private Long getCurrentUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    private User getCurrentUserEntity(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void resetScanCountIfNeeded(User user) {
        if (user.getScanCountResetAt() == null || LocalDateTime.now().isAfter(user.getScanCountResetAt().plusMonths(1))) {
            user.setScanCount(0);
            user.setScanCountResetAt(LocalDateTime.now());
        }
    }

    @GetMapping
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    @GetMapping("/history")
    public List<Document> getDocumentHistory(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        return documentRepository.findByUserId(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable Long id, Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        Optional<Document> document = documentRepository.findById(id);

        if (document.isEmpty() || !document.get().getUserId().equals(userId)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(document.get());
    }

    @PostMapping
    public Document createDocument(@RequestBody Document document) {
        return documentRepository.save(document);
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("targetLanguage") String targetLanguage,
            Authentication authentication
    ) {
        try {
            User user = getCurrentUserEntity(authentication);

            if (!user.isPremium()) {
                resetScanCountIfNeeded(user);

                if (user.getScanCount() >= FREE_SCAN_LIMIT) {
                    userRepository.save(user);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                            "error", "You've used all " + FREE_SCAN_LIMIT + " free scans this month. Upgrade to Premium for unlimited scans."
                    ));
                }
            }

            byte[] imageBytes = file.getBytes();
            JsonNode result = geminiService.analyzeDocumentImage(imageBytes, targetLanguage);

            boolean documentDetected = result.path("documentDetected").asBoolean(true);

            if (!documentDetected) {
                return ResponseEntity.unprocessableEntity().body(Map.of(
                        "error", "We couldn't find a document in that photo. Make sure it's well-lit and fills the frame, then try again."
                ));
            }

            Document document = new Document();
            document.setUserId(user.getId());
            document.setTitle(result.path("title").asText("Scanned Document"));
            document.setOriginalLanguage(result.path("originalLanguage").asText("unknown"));
            document.setTargetLanguage(targetLanguage);
            document.setSummary(result.path("summary").asText(""));
            document.setTranslation(result.path("translation").asText(""));
            document.setRiskLevel(result.path("riskLevel").asText("medium"));
            document.setRiskScore(result.path("riskScore").asInt(0));

            List<String> flaggedPoints = new ArrayList<>();
            if (result.path("flaggedPoints").isArray()) {
                result.path("flaggedPoints").forEach(node -> flaggedPoints.add(node.asText()));
            }
            document.setFlaggedPoints(flaggedPoints);

            Document saved = documentRepository.save(document);

            if (!user.isPremium()) {
                user.setScanCount(user.getScanCount() + 1);
            }
            userRepository.save(user);

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{id}/ask")
    public ResponseEntity<?> askAboutDocument(
            @PathVariable Long id,
            @RequestBody AskRequest request,
            Authentication authentication
    ) {
        Long userId = getCurrentUserId(authentication);
        Optional<Document> documentOpt = documentRepository.findById(id);

        if (documentOpt.isEmpty() || !documentOpt.get().getUserId().equals(userId)) {
            return ResponseEntity.notFound().build();
        }

        try {
            Document document = documentOpt.get();
            String documentText = document.getTranslation();

            if (documentText == null || documentText.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "This document has no readable text to ask about"));
            }

            String answer = geminiService.askQuestion(documentText, request.question());
            return ResponseEntity.ok(Map.of("answer", answer));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to get an answer"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id, Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        Optional<Document> document = documentRepository.findById(id);

        if (document.isEmpty() || !document.get().getUserId().equals(userId)) {
            return ResponseEntity.notFound().build();
        }

        documentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    public record AskRequest(String question) {
    }
}