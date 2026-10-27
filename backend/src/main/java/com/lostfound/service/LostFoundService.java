package com.lostfound.service;

import com.lostfound.daa.LcsDynamicProgramming;
import com.lostfound.daa.MergeSort;
import com.lostfound.ds.AVLTree;
import com.lostfound.ds.BinaryHeap;
import com.lostfound.ds.QuadTree;
import com.lostfound.ds.Trie;
import com.lostfound.model.*;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LostFoundService {
    private final StorageService storage;
    private final Trie searchTrie = new Trie();
    private final AVLTree dateTree = new AVLTree("date");
    private final AVLTree locationTree = new AVLTree("location");
    private final BinaryHeap priorityHeap = new BinaryHeap();
    private final QuadTree spatialTree = new QuadTree();

    public LostFoundService(StorageService storage) {
        this.storage = storage;
    }

    @PostConstruct
    public synchronized void rebuildAllIndexes() {
        searchTrie.clear();
        dateTree.clear();
        locationTree.clear();
        priorityHeap.clear();
        spatialTree.clear();

        List<Item> items = storage.getAllItems();
        for (Item item : items) {
            // Index in Trie
            indexInTrie(item);

            // Index in AVL Trees
            dateTree.insert(item);
            locationTree.insert(item);

            // Calculate Priority & Insert in Max-Heap
            double pScore = calculatePriorityScore(item);
            item.setPriorityScore(Math.round(pScore * 100.0) / 100.0);
            PriorityItem pItem = new PriorityItem(item.getId(), pScore, item.getName(), item.getReporterEmail());
            pItem.setType(item.getType());
            pItem.setCategory(item.getCategory());
            pItem.setDate(item.getDate());
            priorityHeap.insert(pItem);

            // Index in QuadTree
            spatialTree.insert(item);
        }

        // Run auto-matching using LCS Dynamic Programming
        findMatches();
    }

    private void indexInTrie(Item item) {
        if (item.getName() != null) {
            for (String word : tokenize(item.getName())) {
                searchTrie.insert(word, item.getId());
            }
            searchTrie.insert(item.getName(), item.getId());
        }
        if (item.getCategory() != null) {
            searchTrie.insert(item.getCategory(), item.getId());
        }
        if (item.getLocation() != null) {
            for (String word : tokenize(item.getLocation())) {
                searchTrie.insert(word, item.getId());
            }
            searchTrie.insert(item.getLocation(), item.getId());
        }
        if (item.getDescription() != null) {
            for (String word : tokenize(item.getDescription())) {
                if (word.length() >= 3) {
                    searchTrie.insert(word, item.getId());
                }
            }
        }
    }

    // User Operations
    public boolean registerUser(String username, String email, String password) {
        if (email == null || storage.getUserByEmail(email) != null) {
            return false;
        }
        String hashedPassword = StorageService.hashPassword(password);
        User user = new User(storage.getNextUserId(), username, email.toLowerCase().trim(), hashedPassword, "STUDENT");
        boolean added = storage.addUser(user);
        if (added) {
            storage.recordAudit(email, "USER_REGISTERED", "USER", user.getId(), "New student registered: " + username);
        }
        return added;
    }

    public User loginUser(String email, String password) {
        if (email == null || password == null) return null;
        User user = storage.getUserByEmail(email.toLowerCase().trim());
        if (user != null && storage.verifyPassword(password, user.getPassword())) {
            storage.recordAudit(email, "USER_LOGIN", "USER", user.getId(), "Successful user login");
            return user;
        }
        return null;
    }

    // Item Operations
    public Item reportItem(Item item) {
        if (item.getId() == 0) {
            item.setId(storage.getNextItemId());
        }
        if (item.getStatus() == null || item.getStatus().isEmpty()) {
            item.setStatus("OPEN");
        }
        if (item.getDate() == null || item.getDate().isEmpty()) {
            item.setDate(LocalDate.now().toString());
        }

        double pScore = calculatePriorityScore(item);
        item.setPriorityScore(Math.round(pScore * 100.0) / 100.0);

        storage.addItem(item);
        storage.recordAudit(item.getReporterEmail() != null ? item.getReporterEmail() : "guest",
                "REPORT_CREATED", "ITEM", item.getId(),
                "Reported " + item.getType() + " item: " + item.getName() + " at " + item.getLocation());

        rebuildAllIndexes();
        return item;
    }

    public boolean updateItem(Item item, String actorEmail) {
        Item existing = storage.getItemById(item.getId());
        if (existing == null) return false;

        User actor = storage.getUserByEmail(actorEmail);
        boolean isAdmin = actor != null && "ADMIN".equalsIgnoreCase(actor.getRole());
        boolean isOwner = existing.getReporterEmail() != null && existing.getReporterEmail().equalsIgnoreCase(actorEmail);

        if (!isAdmin && !isOwner) {
            throw new SecurityException("Unauthorized: You can only edit your own reports");
        }

        existing.setName(item.getName());
        existing.setCategory(item.getCategory());
        existing.setDescription(item.getDescription());
        existing.setLocation(item.getLocation());
        existing.setDate(item.getDate());
        if (item.getPhotoUrl() != null) existing.setPhotoUrl(item.getPhotoUrl());
        if (item.getContactPhone() != null) existing.setContactPhone(item.getContactPhone());
        if (item.getReward() != null) existing.setReward(item.getReward());

        storage.recordAudit(actorEmail, "REPORT_UPDATED", "ITEM", item.getId(),
                "Updated details for Item #" + item.getId());
        rebuildAllIndexes();
        return true;
    }

    public boolean updateItemStatus(int id, String status) {
        Item item = storage.getItemById(id);
        if (item != null) {
            item.setStatus(status);
            rebuildAllIndexes();
            return true;
        }
        return false;
    }

    public boolean deleteItem(int id) {
        Item item = storage.getItemById(id);
        if (item == null) return false;

        boolean removed = storage.deleteItem(id);
        if (removed) {
            storage.recordAudit("system", "REPORT_DELETED", "ITEM", id,
                    "Deleted report #" + id + " (" + item.getName() + ")");
            rebuildAllIndexes();
        }
        return removed;
    }

    public boolean withdrawItem(int id, String actorEmail) {
        Item item = storage.getItemById(id);
        if (item == null) return false;

        User actor = storage.getUserByEmail(actorEmail);
        boolean isAdmin = actor != null && "ADMIN".equalsIgnoreCase(actor.getRole());
        boolean isOwner = item.getReporterEmail() != null && item.getReporterEmail().equalsIgnoreCase(actorEmail);

        if (!isAdmin && !isOwner) {
            throw new SecurityException("Unauthorized: You can only withdraw your own reports");
        }

        item.setStatus("CLOSED");
        storage.recordAudit(actorEmail, "REPORT_WITHDRAWN", "ITEM", id,
                "Withdrawn report #" + id + " by " + actorEmail);
        rebuildAllIndexes();
        return true;
    }

    public boolean flagItemAsSuspicious(int id, String reason, String reporterEmail) {
        Item item = storage.getItemById(id);
        if (item == null) return false;
        item.setFlaggedSuspicious(true);
        item.setFlagReason(reason);
        storage.recordAudit(reporterEmail, "ITEM_FLAGGED_SUSPICIOUS", "ITEM", id,
                "Student flagged listing as suspicious. Reason: " + reason);
        return true;
    }

    public Item getItemById(int id) {
        return storage.getItemById(id);
    }

    public List<Item> getAllItems() {
        return storage.getAllItems();
    }

    // Search & Autocomplete
    public List<Item> searchItems(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllItems();
        }
        String q = query.trim().toLowerCase();
        List<Integer> ids = searchTrie.getSuggestions(q);
        Set<Integer> idSet = new LinkedHashSet<>(ids);

        // Fallback / substring search for robustness
        for (Item item : storage.getAllItems()) {
            if ((item.getName() != null && item.getName().toLowerCase().contains(q)) ||
                (item.getDescription() != null && item.getDescription().toLowerCase().contains(q)) ||
                (item.getLocation() != null && item.getLocation().toLowerCase().contains(q)) ||
                (item.getCategory() != null && item.getCategory().toLowerCase().contains(q))) {
                idSet.add(item.getId());
            }
        }

        List<Item> results = new ArrayList<>();
        for (int id : idSet) {
            Item item = storage.getItemById(id);
            if (item != null) results.add(item);
        }
        return results;
    }

    public List<String> getAutocompleteSuggestions(String prefix) {
        if (prefix == null || prefix.trim().isEmpty()) {
            return Collections.emptyList();
        }
        List<Integer> ids = searchTrie.getSuggestions(prefix);
        Set<String> titles = new LinkedHashSet<>();
        for (int id : ids) {
            Item it = storage.getItemById(id);
            if (it != null) {
                titles.add(it.getName());
            }
        }
        return new ArrayList<>(titles);
    }

    /**
     * DAA Concept: Merge Sort (Unit II - Divide & Conquer)
     * Demonstrates production in-memory sorting using Merge Sort.
     */
    public List<Item> sortItemsUsingMergeSort(List<Item> items, String sortBy) {
        if (items == null) return Collections.emptyList();

        Comparator<Item> comparator;
        if ("date".equalsIgnoreCase(sortBy)) {
            // Newest date first
            comparator = (a, b) -> {
                String d1 = a.getDate() != null ? a.getDate() : "";
                String d2 = b.getDate() != null ? b.getDate() : "";
                return d2.compareTo(d1);
            };
        } else if ("name".equalsIgnoreCase(sortBy) || "title".equalsIgnoreCase(sortBy)) {
            comparator = (a, b) -> {
                String n1 = a.getName() != null ? a.getName().toLowerCase() : "";
                String n2 = b.getName() != null ? b.getName().toLowerCase() : "";
                return n1.compareTo(n2);
            };
        } else {
            // Default to priority score descending
            comparator = (a, b) -> Double.compare(b.getPriorityScore(), a.getPriorityScore());
        }

        return MergeSort.sort(items, comparator);
    }

    // AVL Tree Operations
    public List<Item> getItemsByDateRange(String start, String end) {
        return dateTree.getRange(start, end);
    }

    public List<Item> getItemsSortedByDate() {
        return dateTree.getAllSorted();
    }

    public List<Item> getItemsSortedByLocation() {
        return locationTree.getAllSorted();
    }

    // Priority Heap Operations
    public List<PriorityItem> getTopPriorityItems(int count) {
        return priorityHeap.getTopK(count);
    }

    // Spatial Tree Operations
    public List<Item> findNearby(double x, double y, double radius) {
        return spatialTree.findNearby(x, y, radius);
    }

    // Smart Matching Algorithms using LCS Dynamic Programming
    public synchronized List<Match> findMatches() {
        List<Item> all = storage.getAllItems();
        // Only active, unresolved reports participate in active matching
        List<Item> lostList = all.stream()
                .filter(i -> "LOST".equalsIgnoreCase(i.getType()) &&
                        !"RETURNED".equalsIgnoreCase(i.getStatus()) &&
                        !"CLOSED".equalsIgnoreCase(i.getStatus()))
                .collect(Collectors.toList());

        List<Item> foundList = all.stream()
                .filter(i -> "FOUND".equalsIgnoreCase(i.getType()) &&
                        !"RETURNED".equalsIgnoreCase(i.getStatus()) &&
                        !"CLOSED".equalsIgnoreCase(i.getStatus()))
                .collect(Collectors.toList());

        List<Match> generatedMatches = new ArrayList<>();

        for (Item lost : lostList) {
            for (Item found : foundList) {
                double score = calculateMatchScore(lost, found);
                if (score >= 0.40) { // Reasonable candidate threshold
                    Match m = new Match(lost.getId(), found.getId(), Math.round(score * 100.0) / 100.0, LocalDate.now().toString());
                    m.setLostItem(lost);
                    m.setFoundItem(found);
                    m.setMatchReason(generateMatchReason(lost, found, score));
                    generatedMatches.add(m);
                }
            }
        }

        // Sort matches descending by score using MergeSort
        List<Match> sortedMatches = MergeSort.sort(generatedMatches, (a, b) -> Double.compare(b.getScore(), a.getScore()));
        storage.setMatches(sortedMatches);
        return sortedMatches;
    }

    public List<Match> getMatchesForUser(String email) {
        if (email == null) return Collections.emptyList();
        String em = email.trim().toLowerCase();
        return storage.getMatches().stream()
                .filter(m -> (m.getLostItem() != null && em.equalsIgnoreCase(m.getLostItem().getReporterEmail())) ||
                             (m.getFoundItem() != null && em.equalsIgnoreCase(m.getFoundItem().getReporterEmail())))
                .collect(Collectors.toList());
    }

    /**
     * DAA Concept: Longest Common Subsequence (LCS) for smart text matching.
     * Combines:
     *   1. LCS Title & Description DP Similarity (45% weight)
     *   2. Category Exact Agreement (25% weight)
     *   3. Location Similarity (20% weight)
     *   4. Date Proximity (10% weight)
     */
    public double calculateMatchScore(Item lost, Item found) {
        if (lost == null || found == null) return 0.0;

        double score = 0.0;

        // 1. Text Similarity via Dynamic Programming LCS (45% weight)
        String lostText = (lost.getName() != null ? lost.getName() : "") + " " +
                          (lost.getDescription() != null ? lost.getDescription() : "");
        String foundText = (found.getName() != null ? found.getName() : "") + " " +
                           (found.getDescription() != null ? found.getDescription() : "");

        double tokenLcsScore = LcsDynamicProgramming.computeTokenLcsSimilarity(lostText, foundText);
        LcsDynamicProgramming.LcsResult titleLcs = LcsDynamicProgramming.computeLcs(lost.getName(), found.getName());
        double combinedLcsText = (tokenLcsScore * 0.65) + (titleLcs.getSimilarityRatio() * 0.35);
        score += combinedLcsText * 0.45;

        // 2. Category match (25% weight)
        if (lost.getCategory() != null && found.getCategory() != null) {
            if (lost.getCategory().equalsIgnoreCase(found.getCategory())) {
                score += 0.25;
            }
        }

        // 3. Location proximity / match (20% weight)
        if (lost.getLocation() != null && found.getLocation() != null) {
            String lLoc = lost.getLocation().toLowerCase().trim();
            String fLoc = found.getLocation().toLowerCase().trim();
            if (lLoc.equals(fLoc)) {
                score += 0.20;
            } else if (lLoc.contains(fLoc) || fLoc.contains(lLoc)) {
                score += 0.12;
            }
        }

        // 4. Date proximity (10% weight)
        long days = dateDifference(lost.getDate(), found.getDate());
        if (days <= 2) {
            score += 0.10;
        } else if (days <= 7) {
            score += 0.06;
        } else if (days <= 21) {
            score += 0.03;
        }

        return Math.min(1.0, score);
    }

    private String generateMatchReason(Item lost, Item found, double score) {
        List<String> reasons = new ArrayList<>();

        // LCS text signal
        String lostTitle = lost.getName() != null ? lost.getName() : "";
        String foundTitle = found.getName() != null ? found.getName() : "";
        LcsDynamicProgramming.LcsResult titleLcs = LcsDynamicProgramming.computeLcs(lostTitle, foundTitle);
        if (titleLcs.getLcsLength() >= 4) {
            reasons.add("LCS Subsequence: \"" + titleLcs.getReconstructedLcs() + "\"");
        }

        if (lost.getCategory() != null && lost.getCategory().equalsIgnoreCase(found.getCategory())) {
            reasons.add("Category agreement (" + lost.getCategory() + ")");
        }

        if (lost.getLocation() != null && found.getLocation() != null &&
            lost.getLocation().equalsIgnoreCase(found.getLocation())) {
            reasons.add("Same campus location (" + lost.getLocation() + ")");
        }

        long days = dateDifference(lost.getDate(), found.getDate());
        if (days <= 3) {
            reasons.add(days == 0 ? "Same-day report" : days + " days apart");
        }

        reasons.add(String.format("%.0f%% match score", score * 100));
        return String.join(" • ", reasons);
    }

    private double calculatePriorityScore(Item item) {
        double score = 0.0;
        long daysOld = dateDifference(item.getDate(), LocalDate.now().toString());
        double recencyScore = Math.max(0.0, 1.0 - (daysOld / 60.0));
        score += recencyScore * 0.40;

        if ("LOST".equalsIgnoreCase(item.getType())) {
            score += 0.30;
        } else {
            score += 0.15;
        }

        if ("OPEN".equalsIgnoreCase(item.getStatus())) {
            score += 0.20;
        }

        if (item.getPhotoUrl() != null && !item.getPhotoUrl().isEmpty()) {
            score += 0.10;
        }

        return Math.min(1.0, score);
    }

    private long dateDifference(String d1, String d2) {
        try {
            LocalDate dt1 = LocalDate.parse(d1 != null ? d1 : LocalDate.now().toString());
            LocalDate dt2 = LocalDate.parse(d2 != null ? d2 : LocalDate.now().toString());
            return Math.abs(ChronoUnit.DAYS.between(dt1, dt2));
        } catch (Exception e) {
            return 7;
        }
    }

    private List<String> tokenize(String text) {
        if (text == null) return Collections.emptyList();
        String[] raw = text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").split("\\s+");
        List<String> result = new ArrayList<>();
        for (String w : raw) {
            if (!w.trim().isEmpty()) {
                result.add(w.trim());
            }
        }
        return result;
    }

    // Analytics & Diagnostics
    public DSStats getDSStats() {
        DSStats stats = new DSStats();
        List<Item> all = storage.getAllItems();
        stats.setTotalItems(all.size());
        stats.setLostCount((int) all.stream().filter(i -> "LOST".equalsIgnoreCase(i.getType())).count());
        stats.setFoundCount((int) all.stream().filter(i -> "FOUND".equalsIgnoreCase(i.getType())).count());
        stats.setMatchedCount((int) all.stream().filter(i -> "CLAIM_PENDING".equalsIgnoreCase(i.getStatus()) || "MATCHED".equalsIgnoreCase(i.getStatus())).count());
        stats.setResolvedCount((int) all.stream().filter(i -> "RETURNED".equalsIgnoreCase(i.getStatus()) || "RESOLVED".equalsIgnoreCase(i.getStatus())).count());

        stats.setTrieNodeCount(searchTrie.getNodeCount());
        stats.setTrieWordsIndexed(searchTrie.getWordCount());
        stats.setAvlDateTreeNodes(dateTree.getSize());
        stats.setAvlDateTreeHeight(dateTree.getHeight());
        stats.setAvlLocationTreeNodes(locationTree.getSize());
        stats.setAvlLocationTreeHeight(locationTree.getHeight());
        stats.setPriorityHeapSize(priorityHeap.size());

        PriorityItem top = priorityHeap.peek();
        stats.setHighestPriorityScore(top != null ? top.getPriorityScore() : 0.0);

        stats.setQuadTreeItemsCount(spatialTree.getTotalCount());
        stats.setQuadTreeDepth(spatialTree.getMaxDepth());

        Map<String, Integer> catDist = new HashMap<>();
        for (Item item : all) {
            String cat = item.getCategory() != null ? item.getCategory() : "Other";
            catDist.put(cat, catDist.getOrDefault(cat, 0) + 1);
        }
        stats.setCategoryDistribution(catDist);

        return stats;
    }
}
