package com.lostfound.daa;

import com.lostfound.model.Item;

import java.util.*;

/**
 * Syllabus Reference: Unit-I Basic Introduction and Time and Space Complexity Analysis
 * Concept: Searching and Asymptotic Complexity Analysis
 *
 * Comparisons:
 *   1. Naive Linear Search:
 *      Scans every item in the dataset sequentially checking title, description, and location.
 *      - Best Case:    Omega(1) - target item matches on the very first inspection.
 *      - Average Case: Theta(n) - on average inspects n / 2 items.
 *      - Worst Case:   O(n) - item is at the end or does not exist (inspects all n items).
 *      - Space:        Theta(1) auxiliary space.
 *
 *   2. Inverted Index / Hash Table Lookup:
 *      Token-based keyword index mapping words -> Set of Item IDs.
 *      - Best Case:    Omega(1) - instant hash table bucket lookup.
 *      - Average Case: Theta(1 + k) - where k is the number of matching items in the bucket.
 *      - Worst Case:   O(n) - hash collision or generic stop-word matching every item.
 *      - Space:        Theta(Total Keywords) auxiliary space.
 */
public class SearchBenchmark {

    public static class BenchmarkResult {
        private final String query;
        private final int itemsEvaluated;
        private final int linearMatchesCount;
        private final long linearComparisons;
        private final long linearTimeNanos;

        private final int indexedMatchesCount;
        private final long indexedComparisons;
        private final long indexedTimeNanos;

        private final double speedupFactor;

        public BenchmarkResult(String query, int itemsEvaluated, int linearMatchesCount, long linearComparisons,
                               long linearTimeNanos, int indexedMatchesCount, long indexedComparisons,
                               long indexedTimeNanos, double speedupFactor) {
            this.query = query;
            this.itemsEvaluated = itemsEvaluated;
            this.linearMatchesCount = linearMatchesCount;
            this.linearComparisons = linearComparisons;
            this.linearTimeNanos = linearTimeNanos;
            this.indexedMatchesCount = indexedMatchesCount;
            this.indexedComparisons = indexedComparisons;
            this.indexedTimeNanos = indexedTimeNanos;
            this.speedupFactor = speedupFactor;
        }

        public String getQuery() { return query; }
        public int getItemsEvaluated() { return itemsEvaluated; }
        public int getLinearMatchesCount() { return linearMatchesCount; }
        public long getLinearComparisons() { return linearComparisons; }
        public long getLinearTimeNanos() { return linearTimeNanos; }
        public int getIndexedMatchesCount() { return indexedMatchesCount; }
        public long getIndexedComparisons() { return indexedComparisons; }
        public long getIndexedTimeNanos() { return indexedTimeNanos; }
        public double getSpeedupFactor() { return speedupFactor; }
    }

    public static List<Item> linearSearch(List<Item> items, String query, long[] comparisonCount) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>(items);
        }
        String q = query.toLowerCase().trim();
        List<Item> matches = new ArrayList<>();

        for (Item item : items) {
            if (comparisonCount != null) comparisonCount[0]++;
            boolean nameMatch = item.getName() != null && item.getName().toLowerCase().contains(q);

            if (comparisonCount != null) comparisonCount[0]++;
            boolean descMatch = item.getDescription() != null && item.getDescription().toLowerCase().contains(q);

            if (comparisonCount != null) comparisonCount[0]++;
            boolean locMatch = item.getLocation() != null && item.getLocation().toLowerCase().contains(q);

            if (nameMatch || descMatch || locMatch) {
                matches.add(item);
            }
        }
        return matches;
    }

    public static BenchmarkResult runComparison(List<Item> items, String query) {
        String cleanQuery = query == null ? "" : query.toLowerCase().trim();

        // 1. Run Linear Search Benchmark
        long[] linearComparisons = new long[]{0};
        long t1 = System.nanoTime();
        List<Item> linearResults = linearSearch(items, cleanQuery, linearComparisons);
        long linearDuration = Math.max(1, System.nanoTime() - t1);

        // 2. Build Inverted Index
        Map<String, Set<Integer>> invertedIndex = new HashMap<>();
        for (Item item : items) {
            String fullText = (item.getName() + " " + (item.getDescription() != null ? item.getDescription() : "")
                    + " " + (item.getLocation() != null ? item.getLocation() : "")).toLowerCase();
            for (String word : fullText.split("[^a-z0-9]+")) {
                if (word.length() >= 2) {
                    invertedIndex.computeIfAbsent(word, k -> new HashSet<>()).add(item.getId());
                }
            }
        }

        // 3. Run Indexed Lookup Benchmark
        long[] indexedComparisons = new long[]{0};
        long t2 = System.nanoTime();
        Set<Integer> matchedIds = new HashSet<>();
        String[] queryWords = cleanQuery.split("[^a-z0-9]+");
        for (String qw : queryWords) {
            indexedComparisons[0]++;
            Set<Integer> ids = invertedIndex.get(qw);
            if (ids != null) {
                matchedIds.addAll(ids);
            }
        }
        List<Item> indexedResults = new ArrayList<>();
        for (Item item : items) {
            if (matchedIds.contains(item.getId())) {
                indexedResults.add(item);
            }
        }
        long indexedDuration = Math.max(1, System.nanoTime() - t2);

        double speedup = (double) linearDuration / indexedDuration;

        return new BenchmarkResult(
                query,
                items.size(),
                linearResults.size(),
                linearComparisons[0],
                linearDuration,
                indexedResults.size(),
                indexedComparisons[0],
                indexedDuration,
                Math.round(speedup * 10.0) / 10.0
        );
    }
}
