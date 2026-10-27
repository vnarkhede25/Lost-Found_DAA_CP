package com.lostfound.controller;

import com.lostfound.daa.BipartiteMatching;
import com.lostfound.daa.LcsDynamicProgramming;
import com.lostfound.daa.MergeSort;
import com.lostfound.daa.SearchBenchmark;
import com.lostfound.model.Item;
import com.lostfound.service.LostFoundService;
import com.lostfound.service.StorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/daa")
public class DAAController {
    private final LostFoundService service;
    private final StorageService storage;

    public DAAController(LostFoundService service, StorageService storage) {
        this.service = service;
        this.storage = storage;
    }

    /**
     * DAA Concept 1: Unit I - Searching and Complexity Analysis
     * Compares Naive Linear Search (O(n)) vs Indexed Search (O(1 + k))
     */
    @GetMapping("/search-benchmark")
    public ResponseEntity<?> runSearchBenchmark(@RequestParam(defaultValue = "library") String q) {
        List<Item> items = storage.getAllItems();
        SearchBenchmark.BenchmarkResult result = SearchBenchmark.runComparison(items, q);

        Map<String, Object> resp = new HashMap<>();
        resp.put("syllabusUnit", "Unit I: Basic Introduction and Time & Space Complexity Analysis");
        resp.put("query", result.getQuery());
        resp.put("datasetSize", result.getItemsEvaluated());

        Map<String, Object> linear = new HashMap<>();
        linear.put("name", "Linear Search Baseline");
        linear.put("matchesFound", result.getLinearMatchesCount());
        linear.put("comparisons", result.getLinearComparisons());
        linear.put("durationNanos", result.getLinearTimeNanos());
        linear.put("durationMicros", Math.round(result.getLinearTimeNanos() / 1000.0 * 10.0) / 10.0);
        linear.put("complexity", Map.of(
            "bestCase", "Omega(1) - target item found at index 0",
            "averageCase", "Theta(n) - average n / 2 comparisons across fields",
            "worstCase", "O(n) - target missing or at end of list",
            "auxiliarySpace", "Theta(1)"
        ));
        resp.put("linearSearch", linear);

        Map<String, Object> indexed = new HashMap<>();
        indexed.put("name", "Inverted Token Index Lookup");
        indexed.put("matchesFound", result.getIndexedMatchesCount());
        indexed.put("comparisons", result.getIndexedComparisons());
        indexed.put("durationNanos", result.getIndexedTimeNanos());
        indexed.put("durationMicros", Math.round(result.getIndexedTimeNanos() / 1000.0 * 10.0) / 10.0);
        indexed.put("complexity", Map.of(
            "bestCase", "Omega(1) - instant hash bucket access",
            "averageCase", "Theta(1 + k) - k matches retrieved",
            "worstCase", "O(n) - hash collision or stop-word match",
            "auxiliarySpace", "Theta(W) - W distinct words in corpus"
        ));
        resp.put("indexedSearch", indexed);

        resp.put("speedupFactor", result.getSpeedupFactor() + "x");
        return ResponseEntity.ok(resp);
    }

    /**
     * DAA Concept 2: Unit II - Merge Sort (Divide and Conquer)
     * Demonstrates recursive divide-and-conquer sorting on actual report listings
     */
    @GetMapping("/merge-sort")
    public ResponseEntity<?> runMergeSortDemo(@RequestParam(defaultValue = "date") String sortBy) {
        List<Item> original = storage.getAllItems();
        long[] comparisonCounter = new long[]{0};

        long start = System.nanoTime();
        Comparator<Item> comp;
        if ("date".equalsIgnoreCase(sortBy)) {
            comp = (a, b) -> (b.getDate() != null ? b.getDate() : "").compareTo(a.getDate() != null ? a.getDate() : "");
        } else if ("name".equalsIgnoreCase(sortBy) || "title".equalsIgnoreCase(sortBy)) {
            comp = (a, b) -> (a.getName() != null ? a.getName().toLowerCase() : "")
                    .compareTo(b.getName() != null ? b.getName().toLowerCase() : "");
        } else {
            comp = (a, b) -> Double.compare(b.getPriorityScore(), a.getPriorityScore());
        }

        List<Item> sorted = MergeSort.sortWithMetrics(original, comp, comparisonCounter);
        long durationNanos = Math.max(1, System.nanoTime() - start);

        Map<String, Object> resp = new HashMap<>();
        resp.put("syllabusUnit", "Unit II: Recursion and Divide and Conquer");
        resp.put("algorithm", "Merge Sort");
        resp.put("sortBy", sortBy);
        resp.put("elementCount", sorted.size());
        resp.put("comparisons", comparisonCounter[0]);
        resp.put("elapsedMicros", Math.round(durationNanos / 1000.0 * 10.0) / 10.0);

        Map<String, String> analysis = new HashMap<>();
        analysis.put("recurrenceRelation", "T(n) = 2 * T(n / 2) + Theta(n)");
        analysis.put("masterTheorem", "Case 2: a = 2, b = 2, f(n) = Theta(n) => log_2(2) = 1 => T(n) = Theta(n log n)");
        analysis.put("timeComplexity", "Theta(n log n) Best, Average, and Worst case");
        analysis.put("auxiliarySpace", "Theta(n) for merge buffers");
        analysis.put("stability", "Stable: preserves relative order of duplicate keys");
        resp.put("theoreticalAnalysis", analysis);

        resp.put("sortedSample", sorted.stream().map(i -> Map.of(
            "id", i.getId(),
            "name", i.getName(),
            "date", i.getDate(),
            "priorityScore", i.getPriorityScore()
        )).collect(Collectors.toList()));

        return ResponseEntity.ok(resp);
    }

    /**
     * DAA Concept 3: Unit III - Longest Common Subsequence (Dynamic Programming)
     * Interactive LCS comparison between two arbitrary or item descriptions
     */
    @GetMapping("/lcs-compare")
    public ResponseEntity<?> runLcsComparison(
            @RequestParam(defaultValue = "Apple AirPods Pro white case in library") String textA,
            @RequestParam(defaultValue = "Found Apple wireless earbuds in white case on library desk") String textB) {

        LcsDynamicProgramming.LcsResult result = LcsDynamicProgramming.computeLcs(textA, textB);
        double tokenSimilarity = LcsDynamicProgramming.computeTokenLcsSimilarity(textA, textB);

        Map<String, Object> resp = new HashMap<>();
        resp.put("syllabusUnit", "Unit III: Dynamic Programming");
        resp.put("concept", "Longest Common Subsequence (LCS)");
        resp.put("textA", textA);
        resp.put("textB", textB);
        resp.put("normalizedA", result.getTextA());
        resp.put("normalizedB", result.getTextB());
        resp.put("lcsLength", result.getLcsLength());
        resp.put("reconstructedSubsequence", result.getReconstructedLcs());
        resp.put("characterSimilarityRatio", Math.round(result.getSimilarityRatio() * 1000.0) / 10.0 + "%");
        resp.put("tokenLcsSimilarityRatio", Math.round(tokenSimilarity * 1000.0) / 10.0 + "%");

        Map<String, String> analysis = new HashMap<>();
        analysis.put("dpRecurrence", "dp[i][j] = (X[i-1] == Y[j-1]) ? dp[i-1][j-1] + 1 : max(dp[i-1][j], dp[i][j-1])");
        analysis.put("timeComplexity", "O(m * n) where m = |textA| and n = |textB|");
        analysis.put("auxiliarySpace", "O(m * n) for 2D matrix; O(min(m, n)) for length-only calculation");
        resp.put("theoreticalAnalysis", analysis);

        return ResponseEntity.ok(resp);
    }

    /**
     * DAA Concept 4: Unit V - Network Flows Optimization & Maximum Bipartite Matching
     * Computes maximum-cardinality candidate matching between Lost and Found items
     */
    @GetMapping("/bipartite-matching")
    public ResponseEntity<?> runBipartiteMatching(@RequestParam(defaultValue = "0.40") double threshold) {
        List<Item> all = storage.getAllItems();
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

        BipartiteMatching.MatchingResult result = BipartiteMatching.computeMaxMatching(
                lostList, foundList, threshold,
                (lost, found) -> service.calculateMatchScore(lost, found)
        );

        Map<String, Object> resp = new HashMap<>();
        resp.put("syllabusUnit", "Unit V: Network Flows Optimization (Matchings in Bipartite Graphs)");
        resp.put("concept", "Maximum Cardinality Bipartite Matching via Augmenting Paths");
        resp.put("activeLostItemsCount", result.getTotalLostCount());
        resp.put("activeFoundItemsCount", result.getTotalFoundCount());
        resp.put("candidateEdgesAboveThreshold", result.getEdgesEvaluated());
        resp.put("maxPairsCardinality", result.getCardinality());

        Map<String, String> analysis = new HashMap<>();
        analysis.put("theorem", "Berge's Lemma: A matching M is maximum iff G contains no augmenting path");
        analysis.put("timeComplexity", "O(V * E) where V = |L| + |R| and E is candidate pairs >= threshold");
        analysis.put("purpose", "Prevents a single found item from being assigned to multiple conflicting claims simultaneously.");
        resp.put("theoreticalAnalysis", analysis);

        List<Map<String, Object>> pairsList = new ArrayList<>();
        for (BipartiteMatching.MatchedPair p : result.getMatchedPairs()) {
            pairsList.add(Map.of(
                "lostItemId", p.getLostItem().getId(),
                "lostItemName", p.getLostItem().getName(),
                "foundItemId", p.getFoundItem().getId(),
                "foundItemName", p.getFoundItem().getName(),
                "similarityScore", Math.round(p.getSimilarityScore() * 100.0) / 100.0,
                "confidencePercent", Math.round(p.getSimilarityScore() * 100.0) + "%"
            ));
        }
        resp.put("matchedPairs", pairsList);

        return ResponseEntity.ok(resp);
    }
}
