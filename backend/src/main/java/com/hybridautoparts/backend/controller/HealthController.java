package com.hybridautoparts.backend.controller;

import java.time.OffsetDateTime;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<HealthResponse> health() {
        return ResponseEntity.ok(new HealthResponse("ok", "hybrid-auto-parts-backend", OffsetDateTime.now()));
    }

    public record HealthResponse(
            String status,
            String service,
            OffsetDateTime timestamp
    ) {
    }
}
