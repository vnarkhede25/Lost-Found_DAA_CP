package com.lostfound.controller;

import com.lostfound.model.AuditLog;
import com.lostfound.model.Item;
import com.lostfound.service.ClaimService;
import com.lostfound.service.StorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final StorageService storage;
    private final ClaimService claimService;

    public AdminController(StorageService storage, ClaimService claimService) {
        this.storage = storage;
        this.claimService = claimService;
    }

    @GetMapping("/overview")
    public ResponseEntity<?> getAdminOverview() {
        List<Item> allItems = storage.getAllItems();
        long openLost = allItems.stream().filter(i -> "LOST".equalsIgnoreCase(i.getType()) && "OPEN".equalsIgnoreCase(i.getStatus())).count();
        long openFound = allItems.stream().filter(i -> "FOUND".equalsIgnoreCase(i.getType()) && "OPEN".equalsIgnoreCase(i.getStatus())).count();
        long claimPending = allItems.stream().filter(i -> "CLAIM_PENDING".equalsIgnoreCase(i.getStatus())).count();
        long returned = allItems.stream().filter(i -> "RETURNED".equalsIgnoreCase(i.getStatus()) || "RESOLVED".equalsIgnoreCase(i.getStatus())).count();

        long pendingClaimsCount = claimService.getAllClaims("PENDING").size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("openLostCount", openLost);
        stats.put("openFoundCount", openFound);
        stats.put("claimPendingItemsCount", claimPending);
        stats.put("returnedItemsCount", returned);
        stats.put("pendingClaimsCount", pendingClaimsCount);
        stats.put("totalReports", allItems.size());
        stats.put("auditLogsCount", storage.getAuditLogs().size());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(storage.getAuditLogs());
    }
}
