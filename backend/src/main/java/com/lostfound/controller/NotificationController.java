package com.lostfound.controller;

import com.lostfound.model.Notification;
import com.lostfound.service.StorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final StorageService storage;

    public NotificationController(StorageService storage) {
        this.storage = storage;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestParam String email) {
        return ResponseEntity.ok(storage.getNotificationsByEmail(email));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable int id) {
        boolean ok = storage.markNotificationAsRead(id);
        return ResponseEntity.ok(Map.of("success", ok));
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestParam String email) {
        storage.markAllNotificationsAsRead(email);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping
    public ResponseEntity<?> clearNotifications(@RequestParam String email) {
        storage.clearNotifications(email);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
