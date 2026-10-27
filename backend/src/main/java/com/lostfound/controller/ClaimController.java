package com.lostfound.controller;

import com.lostfound.model.Claim;
import com.lostfound.service.ClaimService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {
    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping
    public ResponseEntity<?> submitClaim(@RequestBody Claim claim) {
        try {
            Claim created = claimService.submitClaim(claim);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to submit claim: " + e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<Claim>> getUserClaims(@RequestParam String email) {
        return ResponseEntity.ok(claimService.getUserClaims(email));
    }

    @GetMapping
    public ResponseEntity<List<Claim>> getAllClaims(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(claimService.getAllClaims(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getClaimById(@PathVariable int id) {
        Claim claim = claimService.getClaimById(id);
        if (claim == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(claim);
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<?> reviewClaim(@PathVariable int id, @RequestBody Map<String, String> payload) {
        String decision = payload.get("decision"); // APPROVED or REJECTED
        String adminNotes = payload.get("adminNotes");
        String adminEmail = payload.getOrDefault("adminEmail", "security@university.edu");

        if (decision == null || adminNotes == null || adminNotes.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Decision ('APPROVED' or 'REJECTED') and recorded adminNotes reason are required."));
        }

        try {
            Claim reviewed = claimService.reviewClaim(id, decision, adminNotes, adminEmail);
            return ResponseEntity.ok(reviewed);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/handover")
    public ResponseEntity<?> confirmHandover(@PathVariable int id, @RequestBody Map<String, String> payload) {
        String handoverNotes = payload.get("handoverNotes");
        String adminEmail = payload.getOrDefault("adminEmail", "security@university.edu");

        try {
            Claim completed = claimService.confirmHandover(id, handoverNotes, adminEmail);
            return ResponseEntity.ok(completed);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/accept-peer")
    public ResponseEntity<?> acceptClaimByFinder(@PathVariable int id, @RequestBody Map<String, String> payload) {
        String finderEmail = payload.get("finderEmail");
        String notes = payload.get("notes");
        if (finderEmail == null || finderEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Finder email is required"));
        }
        try {
            Claim accepted = claimService.acceptClaimByFinder(id, finderEmail.trim(), notes);
            return ResponseEntity.ok(accepted);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/confirm-received")
    public ResponseEntity<?> confirmReceivedByOwner(@PathVariable int id, @RequestBody Map<String, String> payload) {
        String ownerEmail = payload.get("ownerEmail");
        if (ownerEmail == null || ownerEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Owner email is required"));
        }
        try {
            Claim confirmed = claimService.confirmReceivedByOwner(id, ownerEmail.trim());
            return ResponseEntity.ok(confirmed);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
