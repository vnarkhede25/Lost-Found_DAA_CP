package com.lostfound.service;

import com.lostfound.model.AuditLog;
import com.lostfound.model.Claim;
import com.lostfound.model.Item;
import com.lostfound.model.Match;
import com.lostfound.model.Notification;
import com.lostfound.model.User;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class StorageService {
    private final Map<Integer, User> usersById = new ConcurrentHashMap<>();
    private final Map<String, User> usersByEmail = new ConcurrentHashMap<>();
    private final Map<Integer, Item> itemsById = new ConcurrentHashMap<>();
    private final Map<Integer, Claim> claimsById = new ConcurrentHashMap<>();
    private final Map<Integer, Notification> notificationsById = new ConcurrentHashMap<>();
    private final List<Match> matches = Collections.synchronizedList(new ArrayList<>());
    private final List<AuditLog> auditLogs = Collections.synchronizedList(new ArrayList<>());

    private final AtomicInteger userIdSequence = new AtomicInteger(100);
    private final AtomicInteger itemIdSequence = new AtomicInteger(10);
    private final AtomicInteger claimIdSequence = new AtomicInteger(1);
    private final AtomicInteger notificationIdSequence = new AtomicInteger(1);
    private final AtomicInteger auditIdSequence = new AtomicInteger(1);

    public StorageService() {
        initSampleData();
    }

    private void initSampleData() {
        // System Administrator account for security office
        addUser(new User(1, "Campus Security Admin", "security@university.edu", hashPassword("admin123"), "ADMIN"));
        recordAudit("system", "INITIAL_SETUP", "SYSTEM", 0, "System initialized with clean registry. Ready for user reports.");
    }

    public static String hashPassword(String raw) {
        if (raw == null) return "";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encoded = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : encoded) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            return raw;
        }
    }

    public boolean verifyPassword(String raw, String storedHash) {
        if (raw == null || storedHash == null) return false;
        // Check hash or plaintext compatibility for existing dev logins
        return hashPassword(raw).equals(storedHash) || raw.equals(storedHash);
    }

    // User Operations
    public synchronized boolean addUser(User user) {
        if (user == null || user.getEmail() == null) return false;
        usersById.put(user.getId(), user);
        usersByEmail.put(user.getEmail().toLowerCase(), user);
        return true;
    }

    public User getUserByEmail(String email) {
        if (email == null) return null;
        return usersByEmail.get(email.toLowerCase());
    }

    public User getUserById(int id) {
        return usersById.get(id);
    }

    public int getNextUserId() {
        return userIdSequence.incrementAndGet();
    }

    // Item Operations
    public synchronized boolean addItem(Item item) {
        if (item == null) return false;
        itemsById.put(item.getId(), item);
        return true;
    }

    public Item getItemById(int id) {
        return itemsById.get(id);
    }

    public List<Item> getAllItems() {
        return new ArrayList<>(itemsById.values());
    }

    public synchronized boolean deleteItem(int id) {
        return itemsById.remove(id) != null;
    }

    public int getNextItemId() {
        return itemIdSequence.incrementAndGet();
    }

    // Match Operations
    public List<Match> getMatches() {
        return new ArrayList<>(matches);
    }

    public synchronized void setMatches(List<Match> newMatches) {
        matches.clear();
        matches.addAll(newMatches);
    }

    public synchronized void addMatch(Match match) {
        matches.add(match);
    }

    // Claim Operations
    public synchronized boolean addClaim(Claim claim) {
        if (claim == null) return false;
        claimsById.put(claim.getId(), claim);
        return true;
    }

    public Claim getClaimById(int id) {
        return claimsById.get(id);
    }

    public List<Claim> getAllClaims() {
        List<Claim> list = new ArrayList<>(claimsById.values());
        list.sort((a, b) -> Integer.compare(b.getId(), a.getId())); // Newest first
        return list;
    }

    public List<Claim> getClaimsByEmail(String email) {
        if (email == null) return Collections.emptyList();
        String target = email.toLowerCase().trim();
        List<Claim> userClaims = new ArrayList<>();
        for (Claim c : claimsById.values()) {
            if (c.getClaimantEmail() != null && c.getClaimantEmail().equalsIgnoreCase(target)) {
                userClaims.add(c);
            }
        }
        userClaims.sort((a, b) -> Integer.compare(b.getId(), a.getId()));
        return userClaims;
    }

    public int getNextClaimId() {
        return claimIdSequence.incrementAndGet();
    }

    // Notification Operations
    public synchronized boolean addNotification(Notification n) {
        if (n == null) return false;
        if (n.getId() <= 0) {
            n.setId(notificationIdSequence.incrementAndGet());
        }
        if (n.getCreatedAt() == null || n.getCreatedAt().isEmpty()) {
            n.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        notificationsById.put(n.getId(), n);
        return true;
    }

    public List<Notification> getNotificationsByEmail(String email) {
        if (email == null) return Collections.emptyList();
        String target = email.trim().toLowerCase();
        List<Notification> userNotifs = new ArrayList<>();
        for (Notification n : notificationsById.values()) {
            if (n.getRecipientEmail() != null && n.getRecipientEmail().equalsIgnoreCase(target)) {
                userNotifs.add(n);
            }
        }
        userNotifs.sort((a, b) -> Integer.compare(b.getId(), a.getId())); // Newest first
        return userNotifs;
    }

    public synchronized boolean markNotificationAsRead(int id) {
        Notification n = notificationsById.get(id);
        if (n != null) {
            n.setRead(true);
            return true;
        }
        return false;
    }

    public synchronized void markAllNotificationsAsRead(String email) {
        if (email == null) return;
        String target = email.trim().toLowerCase();
        for (Notification n : notificationsById.values()) {
            if (n.getRecipientEmail() != null && n.getRecipientEmail().equalsIgnoreCase(target)) {
                n.setRead(true);
            }
        }
    }

    public synchronized void clearNotifications(String email) {
        if (email == null) return;
        String target = email.trim().toLowerCase();
        notificationsById.values().removeIf(n -> n.getRecipientEmail() != null && n.getRecipientEmail().equalsIgnoreCase(target));
    }

    public int getNextNotificationId() {
        return notificationIdSequence.incrementAndGet();
    }

    // Audit Log Operations
    public void recordAudit(String actor, String action, String targetType, int targetId, String details) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        AuditLog log = new AuditLog(auditIdSequence.getAndIncrement(), actor, action, targetType, targetId, details, timestamp);
        auditLogs.add(log);
    }

    public List<AuditLog> getAuditLogs() {
        List<AuditLog> copy = new ArrayList<>(auditLogs);
        copy.sort((a, b) -> Integer.compare(b.getId(), a.getId()));
        return copy;
    }
}
