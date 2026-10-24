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
            @RequestParam(required = false) String q) {

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
}
