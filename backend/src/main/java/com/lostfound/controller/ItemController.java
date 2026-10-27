package com.lostfound.controller;

import com.lostfound.model.Item;
import com.lostfound.service.LostFoundService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/items")
public class ItemController {
    private final LostFoundService service;

    public ItemController(LostFoundService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Item>> getItems(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "date") String sortBy) {

        List<Item> items = (q != null && !q.trim().isEmpty())
                ? service.searchItems(q)
                : service.getAllItems();

        if (type != null && !type.isEmpty() && !"ALL".equalsIgnoreCase(type)) {
            items = items.stream().filter(i -> type.equalsIgnoreCase(i.getType())).collect(Collectors.toList());
        }
        if (category != null && !category.isEmpty() && !"ALL".equalsIgnoreCase(category)) {
            items = items.stream().filter(i -> category.equalsIgnoreCase(i.getCategory())).collect(Collectors.toList());
        }
        if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            items = items.stream().filter(i -> status.equalsIgnoreCase(i.getStatus())).collect(Collectors.toList());
        }

        // Apply Merge Sort for supported sorting (date, name, priority)
        items = service.sortItemsUsingMergeSort(items, sortBy);

        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getItem(@PathVariable int id) {
        Item item = service.getItemById(id);
        if (item == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(item);
    }

    @PostMapping
    public ResponseEntity<Item> createItem(@RequestBody Item item) {
        Item created = service.reportItem(item);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(
            @PathVariable int id,
            @RequestBody Item item,
            @RequestParam(required = false, defaultValue = "alex.morgan@university.edu") String actorEmail) {
        item.setId(id);
        try {
            boolean updated = service.updateItem(item, actorEmail);
            if (!updated) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(item);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<?> withdrawItem(
            @PathVariable int id,
            @RequestParam(required = false, defaultValue = "alex.morgan@university.edu") String actorEmail) {
        try {
            boolean withdrawn = service.withdrawItem(id, actorEmail);
            if (!withdrawn) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(Map.of("success", true, "id", id, "status", "CLOSED"));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable int id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        boolean updated = service.updateItemStatus(id, status);
        if (!updated) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("success", true, "id", id, "status", status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable int id) {
        boolean deleted = service.deleteItem(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("success", true, "id", id));
    }

    @PostMapping("/{id}/flag")
    public ResponseEntity<?> flagItem(
            @PathVariable int id,
            @RequestBody Map<String, String> payload,
            @RequestParam(required = false, defaultValue = "student@university.edu") String reporterEmail) {
        String reason = payload.getOrDefault("reason", "Suspicious or scam listing flagged by student");
        boolean flagged = service.flagItemAsSuspicious(id, reason, reporterEmail);
        if (!flagged) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("success", true, "id", id, "flagged", true));
    }
}
