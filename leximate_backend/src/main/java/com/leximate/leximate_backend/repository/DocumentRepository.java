package com.leximate.leximate_backend.repository;

import com.leximate.leximate_backend.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Long> {
}