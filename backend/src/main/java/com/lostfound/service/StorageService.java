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
        // Sample Users with secure hashed passwords
        addUser(new User(1, "Alex Morgan", "alex.morgan@university.edu", hashPassword("pass123"), "STUDENT"));
        addUser(new User(2, "Sophia Patel", "sophia.p@university.edu", hashPassword("pass123"), "STUDENT"));
        addUser(new User(3, "David Kim", "david.k@university.edu", hashPassword("pass123"), "STUDENT"));
        addUser(new User(4, "Campus Security Admin", "security@university.edu", hashPassword("admin123"), "ADMIN"));

        // Sample Items with realistic details and Unsplash photos
        Item i1 = new Item(1, "LOST", "Apple AirPods Pro 2nd Gen", "Electronics",
                "White AirPods Pro in a matte black silicone protective case. Lost near the quiet study cubicles.",
                "Central Library - 2nd Floor", "2026-10-22", "alex.morgan@university.edu", "OPEN",
                "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80");
        i1.setReporterName("Alex Morgan");
        i1.setContactPhone("+1 (555) 234-5678");
        i1.setReward("$30 Reward");
        i1.setLatitude(24.5);
        i1.setLongitude(48.2);

        Item i2 = new Item(2, "FOUND", "White Wireless Earbuds in Black Case", "Electronics",
                "Found a pair of Apple wireless earbuds in a dark case on desk #14 in the library.",
                "Central Library - 2nd Floor", "2026-10-23", "sophia.p@university.edu", "OPEN",
                "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80");
        i2.setReporterName("Sophia Patel");
        i2.setContactPhone("+1 (555) 876-5432");
        i2.setLatitude(25.0);
        i2.setLongitude(48.5);

        Item i3 = new Item(3, "LOST", "Black North Face Water Bottle", "Accessories",
                "Hydro flask insulated black bottle with a sticker of NASA and golden retriever.",
                "Student Activity Center Gym", "2026-10-20", "david.k@university.edu", "CLAIM_PENDING",
                "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80");
        i3.setReporterName("David Kim");
        i3.setContactPhone("+1 (555) 345-6789");
        i3.setLatitude(62.1);
        i3.setLongitude(31.8);

        Item i4 = new Item(4, "FOUND", "Insulated Hydro Flask Bottle with Stickers", "Accessories",
                "Found on the bleachers in the sports gym after basketball practice. Has NASA and golden retriever sticker.",
                "Student Activity Center Gym", "2026-10-21", "security@university.edu", "CLAIM_PENDING",
                "https://images.unsplash.com/photo-1570572858178-5776c5b967d6?auto=format&fit=crop&w=600&q=80");
        i4.setReporterName("Campus Security");
        i4.setLatitude(61.8);
        i4.setLongitude(32.2);

        Item i5 = new Item(5, "LOST", "Brown Leather Bifold Wallet", "Bags & Wallets",
                "Contains student ID card for Alex Morgan, driver's license, and blue transit pass.",
                "Dining Hall Courtyard", "2026-10-24", "alex.morgan@university.edu", "OPEN",
                "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80");
        i5.setReporterName("Alex Morgan");
        i5.setReward("$50 Reward");
        i5.setLatitude(45.0);
        i5.setLongitude(75.5);

        Item i6 = new Item(6, "LOST", "Casio Scientific Calculator fx-991EX", "Books & Stationery",
                "ClassWiz black scientific calculator needed for engineering finals next week.",
                "Engineering Hall 304", "2026-10-21", "sophia.p@university.edu", "OPEN",
                "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80");
        i6.setReporterName("Sophia Patel");
        i6.setLatitude(80.5);
        i6.setLongitude(20.3);

        Item i7 = new Item(7, "FOUND", "Set of Keys with Red University Lanyard", "Keys",
                "3 silver keys with a red campus alumni lanyard and a small USB flash drive attached.",
                "Main Auditorium Lobby", "2026-10-19", "security@university.edu", "RETURNED",
                "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80");
        i7.setReporterName("Campus Security");
        i7.setLatitude(15.2);
        i7.setLongitude(60.4);

        Item i8 = new Item(8, "LOST", "Navy Blue Fjallraven Kanken Backpack", "Bags & Wallets",
                "Contains spiral lecture notebooks for CS301 and a yellow pencil case.",
                "Science Complex Cafe", "2026-10-23", "david.k@university.edu", "OPEN",
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80");
        i8.setReporterName("David Kim");
        i8.setLatitude(35.4);
        i8.setLongitude(85.1);

        addItem(i1);
        addItem(i2);
        addItem(i3);
        addItem(i4);
        addItem(i5);
        addItem(i6);
        addItem(i7);
        addItem(i8);

        // Pre-seed an actual ownership claim
        Claim c1 = new Claim(
                claimIdSequence.getAndIncrement(),
                4, // Found water bottle #4
                3, // Lost report #3
                "david.k@university.edu",
                "David Kim",
                "+1 (555) 345-6789",
                "The bottle has a golden retriever sticker on the bottom left and a small dent near the cap. Also has a NASA worm logo.",
                null,
                "2026-10-25 14:30:00"
        );
        c1.setStatus("PENDING");
        c1.setItem(i4);
        c1.setMatchedItem(i3);
        claimsById.put(c1.getId(), c1);

        // Pre-seed sample notification for Alex Morgan (possible match for AirPods)
        Notification n1 = new Notification(
                notificationIdSequence.getAndIncrement(),
                "alex.morgan@university.edu",
                "Possible Match Found!",
                "A found item matching your lost 'Apple AirPods Pro 2nd Gen' was reported: 'White Wireless Earbuds in Black Case' by Sophia Patel at Central Library - 2nd Floor.",
                "MATCH_FOUND",
                "2026-10-23 11:15:00"
        );
        n1.setItemId(1);
        n1.setMatchedItemId(2);
        notificationsById.put(n1.getId(), n1);

        // Pre-seed sample notification for Security Admin (claim submitted)
        Notification n2 = new Notification(
                notificationIdSequence.getAndIncrement(),
                "security@university.edu",
                "New Claim Request Received",
                "David Kim submitted an ownership claim request for Found Item #4 (Insulated Hydro Flask Bottle).",
                "CLAIM_REQUESTED",
                "2026-10-25 14:30:00"
        );
        n2.setClaimId(c1.getId());
        n2.setItemId(4);
        notificationsById.put(n2.getId(), n2);

        recordAudit("system", "INITIAL_SETUP", "SYSTEM", 0, "Initial dataset seeded with students, items, and verification claims.");
        recordAudit("david.k@university.edu", "CLAIM_SUBMITTED", "CLAIM", c1.getId(), "Claim submitted for Found Item #4 (Water Bottle) citing sticker evidence.");
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
