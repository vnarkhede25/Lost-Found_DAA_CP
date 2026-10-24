package com.lostfound.controller;

import com.lostfound.model.DSStats;
import com.lostfound.service.LostFoundService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ads")
public class ADSController {
    private final LostFoundService service;

    public ADSController(LostFoundService service) {
        this.service = service;
    }

    @GetMapping("/stats")
    public ResponseEntity<DSStats> getStats() {
        return ResponseEntity.ok(service.getDSStats());
    }

    @PostMapping("/rebuild")
    public ResponseEntity<?> rebuildIndexes() {
        service.rebuildAllIndexes();
        return ResponseEntity.ok(Map.of("success", true, "message", "All ADS indexes rebuilt successfully"));
    }
}
