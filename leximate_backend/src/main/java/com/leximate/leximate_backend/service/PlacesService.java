package com.leximate.leximate_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class PlacesService {

    @Value("${google.places.api.key}")
    private String apiKey;

    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://places.googleapis.com/v1")
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Map<String, Object>> searchNearbyLegalAid(double lat, double lng) {
        Map<String, Object> requestBody = Map.of(
                "textQuery", "legal aid",
                "locationBias", Map.of(
                        "circle", Map.of(
                                "center", Map.of("latitude", lat, "longitude", lng),
                                "radius", 20000.0
                        )
                )
        );

        String responseJson = webClient.post()
                .uri("/places:searchText")
                .header("X-Goog-Api-Key", apiKey)
                .header("X-Goog-FieldMask", "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.location")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        List<Map<String, Object>> results = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode places = root.path("places");

            if (places.isArray()) {
                for (JsonNode place : places) {
                    Map<String, Object> item = Map.of(
                            "name", place.path("displayName").path("text").asText("Unknown"),
                            "address", place.path("formattedAddress").asText(""),
                            "phone", place.path("nationalPhoneNumber").asText(""),
                            "latitude", place.path("location").path("latitude").asDouble(0),
                            "longitude", place.path("location").path("longitude").asDouble(0)
                    );
                    results.add(item);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Places response: " + responseJson, e);
        }

        return results;
    }
}