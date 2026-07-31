package com.leximate.leximate_backend.controller;

import com.leximate.leximate_backend.service.PlacesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/legal-aid")
public class LegalAidController {

    @Autowired
    private PlacesService placesService;

    @GetMapping("/nearby")
    public ResponseEntity<?> getNearbyLegalAid(
            @RequestParam double lat,
            @RequestParam double lng
    ) {
        try {
            List<Map<String, Object>> results = placesService.searchNearbyLegalAid(lat, lng);
            return ResponseEntity.ok(Map.of("results", results));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch nearby legal aid offices"));
        }
    }
}