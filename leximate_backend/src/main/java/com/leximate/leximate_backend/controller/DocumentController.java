package com.leximate.leximate_backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.leximate.leximate_backend.model.Document;
import com.leximate.leximate_backend.repository.DocumentRepository;
import com.leximate.leximate_backend.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private GeminiService geminiService;

    @GetMapping
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    @GetMapping("/history")
    public List<Document> getDocumentHistory() {
        return documentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable Long id) {
        Optional<Document> document = documentRepository.findById(id);
        return document.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Document createDocument(@RequestBody Document document) {
        return documentRepository.save(document);
    }

    @PostMapping("/analyze")
    public ResponseEntity<Document> analyzeDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("targetLanguage") String targetLanguage
    ) {
        try {
            byte[] imageBytes = file.getBytes();
            JsonNode result = geminiService.analyzeDocumentImage(imageBytes, targetLanguage);

            Document document = new Document();
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
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
                    e.printStackTrace();
                    return ResponseEntity.internalServerError().build();
                }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        if (!documentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        documentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}