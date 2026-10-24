package com.lostfound.controller;

import com.lostfound.model.Match;
import com.lostfound.service.LostFoundService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matches")
public class MatchController {
    private final LostFoundService service;

    public MatchController(LostFoundService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Match>> getAllMatches() {
        return ResponseEntity.ok(service.findMatches());
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<List<Match>> getUserMatches(@PathVariable String email) {
        return ResponseEntity.ok(service.getMatchesForUser(email));
    }

    @PostMapping("/claim")
    public ResponseEntity<?> claimMatch(@RequestBody Map<String, Integer> payload) {
        Integer lostId = payload.get("lostItemId");
        Integer foundId = payload.get("foundItemId");

        if (lostId == null || foundId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Both lostItemId and foundItemId required"));
        }

        service.updateItemStatus(lostId, "RESOLVED");
        service.updateItemStatus(foundId, "RESOLVED");

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Match claimed and both items marked as RESOLVED",
            "lostItemId", lostId,
            "foundItemId", foundId
        ));
    }
}
