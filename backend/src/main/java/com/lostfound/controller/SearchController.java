package com.lostfound.controller;

import com.lostfound.model.Item;
import com.lostfound.model.PriorityItem;
import com.lostfound.service.LostFoundService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {
    private final LostFoundService service;

    public SearchController(LostFoundService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Item>> search(@RequestParam String q) {
        return ResponseEntity.ok(service.searchItems(q));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSuggestions(@RequestParam String q) {
        return ResponseEntity.ok(service.getAutocompleteSuggestions(q));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<Item>> getByDateRange(
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end) {
        return ResponseEntity.ok(service.getItemsByDateRange(start, end));
    }

    @GetMapping("/sorted-date")
    public ResponseEntity<List<Item>> getSortedByDate() {
        return ResponseEntity.ok(service.getItemsSortedByDate());
    }

    @GetMapping("/sorted-location")
    public ResponseEntity<List<Item>> getSortedByLocation() {
        return ResponseEntity.ok(service.getItemsSortedByLocation());
    }

    @GetMapping("/priority")
    public ResponseEntity<List<PriorityItem>> getPriorityItems(@RequestParam(defaultValue = "10") int count) {
        return ResponseEntity.ok(service.getTopPriorityItems(count));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Item>> getNearbyItems(
            @RequestParam double x,
            @RequestParam double y,
            @RequestParam(defaultValue = "20.0") double radius) {
        return ResponseEntity.ok(service.findNearby(x, y, radius));
    }
}
