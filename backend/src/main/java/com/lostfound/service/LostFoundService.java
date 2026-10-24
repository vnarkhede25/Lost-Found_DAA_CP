package com.lostfound.service;

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

        // Run auto-matching
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
        if (storage.getUserByEmail(email) != null) {
            return false;
        }
        User user = new User(storage.getNextUserId(), username, email, password);
        return storage.addUser(user);
    }

    public User loginUser(String email, String password) {
        User user = storage.getUserByEmail(email);
        if (user != null && user.getPassword().equals(password)) {
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
        rebuildAllIndexes();
        return item;
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
        boolean removed = storage.deleteItem(id);
        if (removed) {
            rebuildAllIndexes();
        }
        return removed;
    }

    public Item getItemById(int id) {
        return storage.getItemById(id);
    }

    public List<Item> getAllItems() {
        return storage.getAllItems();
    }

    // ADS Search & Autocomplete
    public List<Item> searchItems(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllItems();
        }
        String q = query.trim().toLowerCase();
        List<Integer> ids = searchTrie.getSuggestions(q);
        Set<Integer> idSet = new LinkedHashSet<>(ids);

        // Fallback or union with substring match for comprehensive results
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

    // QuadTree Operations
    public List<Item> findNearby(double x, double y, double radius) {
        return spatialTree.findNearby(x, y, radius);
    }

    // Smart Matching Algorithms
    public synchronized List<Match> findMatches() {
        List<Item> all = storage.getAllItems();
        List<Item> lostList = all.stream().filter(i -> "LOST".equalsIgnoreCase(i.getType())).collect(Collectors.toList());
        List<Item> foundList = all.stream().filter(i -> "FOUND".equalsIgnoreCase(i.getType())).collect(Collectors.toList());

        List<Match> generatedMatches = new ArrayList<>();

        for (Item lost : lostList) {
            for (Item found : foundList) {
                double score = calculateMatchScore(lost, found);
                if (score >= 0.40) { // Threshold for potential match
                    Match m = new Match(lost.getId(), found.getId(), Math.round(score * 100.0) / 100.0, LocalDate.now().toString());
                    m.setLostItem(lost);
                    m.setFoundItem(found);
                    m.setMatchReason(generateMatchReason(lost, found, score));
                    generatedMatches.add(m);
                }
            }
        }

        // Sort by match score descending
        generatedMatches.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        storage.setMatches(generatedMatches);
        return generatedMatches;
    }

    public List<Match> getMatchesForUser(String email) {
        if (email == null) return Collections.emptyList();
        String em = email.trim().toLowerCase();
        return storage.getMatches().stream()
                .filter(m -> (m.getLostItem() != null && em.equalsIgnoreCase(m.getLostItem().getReporterEmail())) ||
                             (m.getFoundItem() != null && em.equalsIgnoreCase(m.getFoundItem().getReporterEmail())))
                .collect(Collectors.toList());
    }

    public double calculateMatchScore(Item lost, Item found) {
        double score = 0.0;

        // 1. Title / Token similarity (40%)
        List<String> lostWords = tokenize(lost.getName() + " " + (lost.getDescription() != null ? lost.getDescription() : ""));
        List<String> foundWords = tokenize(found.getName() + " " + (found.getDescription() != null ? found.getDescription() : ""));
        double textSimilarity = jaccardSimilarity(lostWords, foundWords);
        score += textSimilarity * 0.40;

        // 2. Location proximity / exact match (30%)
        if (lost.getLocation() != null && found.getLocation() != null) {
            String lLoc = lost.getLocation().toLowerCase().trim();
            String fLoc = found.getLocation().toLowerCase().trim();
            if (lLoc.equals(fLoc)) {
                score += 0.30;
            } else if (lLoc.contains(fLoc) || fLoc.contains(lLoc)) {
                score += 0.20;
            } else {
                // Spatial coordinate proximity check
                double[] c1 = QuadTree.resolveCoordinates(lost);
                double[] c2 = QuadTree.resolveCoordinates(found);
                double dist = Math.hypot(c1[0] - c2[0], c1[1] - c2[1]);
                if (dist <= 15.0) {
                    score += 0.20 * (1.0 - (dist / 15.0));
                }
            }
        }

        // 3. Category match (20%)
        if (lost.getCategory() != null && found.getCategory() != null) {
            if (lost.getCategory().equalsIgnoreCase(found.getCategory())) {
                score += 0.20;
            }
        }

        // 4. Date proximity (10%)
        long days = dateDifference(lost.getDate(), found.getDate());
        if (days <= 3) {
            score += 0.10;
        } else if (days <= 10) {
            score += 0.06;
        } else if (days <= 30) {
            score += 0.03;
        }

        return Math.min(1.0, score);
    }

    private String generateMatchReason(Item lost, Item found, double score) {
        List<String> reasons = new ArrayList<>();
        if (lost.getCategory() != null && lost.getCategory().equalsIgnoreCase(found.getCategory())) {
            reasons.add("Matching category (" + lost.getCategory() + ")");
        }
        if (lost.getLocation() != null && found.getLocation() != null &&
            lost.getLocation().equalsIgnoreCase(found.getLocation())) {
            reasons.add("Reported at same location (" + lost.getLocation() + ")");
        }
        long days = dateDifference(lost.getDate(), found.getDate());
        if (days <= 3) {
            reasons.add(days == 0 ? "Same-day occurrence" : days + " days apart");
        }
        reasons.add(String.format("%.0f%% confidence score", score * 100));
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

    private double jaccardSimilarity(List<String> a, List<String> b) {
        if (a.isEmpty() || b.isEmpty()) return 0.0;
        Set<String> setA = new HashSet<>(a);
        Set<String> setB = new HashSet<>(b);

        Set<String> intersection = new HashSet<>(setA);
        intersection.retainAll(setB);

        Set<String> union = new HashSet<>(setA);
        union.addAll(setB);

        if (union.isEmpty()) return 0.0;
        return (double) intersection.size() / union.size();
    }

    // ADS Analytics & Diagnostics
    public DSStats getDSStats() {
        DSStats stats = new DSStats();
        List<Item> all = storage.getAllItems();
        stats.setTotalItems(all.size());
        stats.setLostCount((int) all.stream().filter(i -> "LOST".equalsIgnoreCase(i.getType())).count());
        stats.setFoundCount((int) all.stream().filter(i -> "FOUND".equalsIgnoreCase(i.getType())).count());
        stats.setMatchedCount((int) all.stream().filter(i -> "MATCHED".equalsIgnoreCase(i.getStatus())).count());
        stats.setResolvedCount((int) all.stream().filter(i -> "RESOLVED".equalsIgnoreCase(i.getStatus())).count());

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
