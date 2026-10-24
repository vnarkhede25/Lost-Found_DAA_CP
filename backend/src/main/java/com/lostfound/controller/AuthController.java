package com.lostfound.controller;

import com.lostfound.model.User;
import com.lostfound.service.LostFoundService;
import com.lostfound.service.StorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final LostFoundService service;
    private final StorageService storage;

    public AuthController(LostFoundService service, StorageService storage) {
        this.service = service;
        this.storage = storage;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String email = payload.get("email");
        String password = payload.get("password");

        if (username == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username, email, and password required"));
        }

        boolean success = service.registerUser(username, email, password);
        if (!success) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        User user = storage.getUserByEmail(email);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("user", Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "email", user.getEmail(),
            "role", user.getRole()
        ));
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");

        User user = service.loginUser(email, password);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("user", Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "email", user.getEmail(),
            "role", user.getRole()
        ));
        return ResponseEntity.ok(resp);
    }
}
