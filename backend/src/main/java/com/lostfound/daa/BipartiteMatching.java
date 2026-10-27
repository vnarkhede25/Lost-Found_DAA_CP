package com.lostfound.daa;

import com.lostfound.model.Item;

import java.util.*;

/**
 * Syllabus Reference: Unit-V Network Flows Optimization
 * Concept: Maximum Cardinality Matching in Bipartite Graphs
 *
 * Problem Formulation:
 *   Let G = (L union R, E) be an undirected bipartite graph where:
 *     - L: Set of active, unresolved Lost item reports
 *     - R: Set of active, unresolved Found item reports
 *     - E: Edge (u, v) exists iff SimilarityScore(u, v) >= threshold
 *
 * Goal:
 *   Find a subset of edges M subset of E of maximum size such that no two edges share a common vertex.
 *   This ensures no single found item is tentatively promised to multiple lost reports simultaneously,
 *   enabling administrators to evaluate global, non-conflicting candidate pairings.
 *
 * Algorithm:
 *   Augmenting Path Algorithm (Hopcroft-Karp / DFS-based Ford-Fulkerson Bipartite Matching).
 *   By Berge's Theorem, a matching M is maximum if and only if G contains no M-augmenting path.
 *
 * Time Complexity:
 *   O(V * E) where V = |L| + |R| and E is the number of edges.
 * Space Complexity:
 *   O(V + E) for adjacency list and recursion stack.
 */
public class BipartiteMatching {

    public static class MatchedPair {
        private final Item lostItem;
        private final Item foundItem;
        private final double similarityScore;

        public MatchedPair(Item lostItem, Item foundItem, double similarityScore) {
            this.lostItem = lostItem;
            this.foundItem = foundItem;
            this.similarityScore = similarityScore;
        }

        public Item getLostItem() { return lostItem; }
        public Item getFoundItem() { return foundItem; }
        public double getSimilarityScore() { return similarityScore; }
    }

    public static class MatchingResult {
        private final List<MatchedPair> matchedPairs;
        private final List<Item> unmatchedLostItems;
        private final List<Item> unmatchedFoundItems;
        private final int totalLostCount;
        private final int totalFoundCount;
        private final int edgesEvaluated;

        public MatchingResult(List<MatchedPair> matchedPairs, List<Item> unmatchedLostItems,
                              List<Item> unmatchedFoundItems, int totalLostCount, int totalFoundCount, int edgesEvaluated) {
            this.matchedPairs = matchedPairs;
            this.unmatchedLostItems = unmatchedLostItems;
            this.unmatchedFoundItems = unmatchedFoundItems;
            this.totalLostCount = totalLostCount;
            this.totalFoundCount = totalFoundCount;
            this.edgesEvaluated = edgesEvaluated;
        }

        public List<MatchedPair> getMatchedPairs() { return matchedPairs; }
        public List<Item> getUnmatchedLostItems() { return unmatchedLostItems; }
        public List<Item> getUnmatchedFoundItems() { return unmatchedFoundItems; }
        public int getTotalLostCount() { return totalLostCount; }
        public int getTotalFoundCount() { return totalFoundCount; }
        public int getEdgesEvaluated() { return edgesEvaluated; }
        public int getCardinality() { return matchedPairs.size(); }
    }

    public interface SimilarityEvaluator {
        double calculateScore(Item lost, Item found);
    }

    /**
     * Compute maximum cardinality bipartite matching between Lost and Found items.
     */
    public static MatchingResult computeMaxMatching(List<Item> lostItems, List<Item> foundItems,
                                                    double scoreThreshold, SimilarityEvaluator evaluator) {
        int m = lostItems.size();
        int n = foundItems.size();

        if (m == 0 || n == 0) {
            return new MatchingResult(Collections.emptyList(), lostItems, foundItems, m, n, 0);
        }

        // Build adjacency matrix / list where edge (u, v) exists if score >= threshold
        List<List<Integer>> adj = new ArrayList<>(m);
        double[][] scoreMatrix = new double[m][n];
        int edgeCount = 0;

        for (int u = 0; u < m; u++) {
            List<Integer> neighbors = new ArrayList<>();
            for (int v = 0; v < n; v++) {
                double score = evaluator.calculateScore(lostItems.get(u), foundItems.get(v));
                scoreMatrix[u][v] = score;
                if (score >= scoreThreshold) {
                    neighbors.add(v);
                    edgeCount++;
                }
            }
            adj.add(neighbors);
        }

        // matchFoundToLost[v] stores the index of the Lost item assigned to Found item v (-1 if unassigned)
        int[] matchFoundToLost = new int[n];
        Arrays.fill(matchFoundToLost, -1);

        int maxMatches = 0;
        for (int u = 0; u < m; u++) {
            boolean[] visitedFound = new boolean[n];
            if (findAugmentingPath(u, adj, visitedFound, matchFoundToLost)) {
                maxMatches++;
            }
        }

        // Construct matched pairs result
        List<MatchedPair> pairs = new ArrayList<>(maxMatches);
        Set<Integer> matchedLostIndices = new HashSet<>();
        Set<Integer> matchedFoundIndices = new HashSet<>();

        for (int v = 0; v < n; v++) {
            int u = matchFoundToLost[v];
            if (u != -1) {
                pairs.add(new MatchedPair(lostItems.get(u), foundItems.get(v), scoreMatrix[u][v]));
                matchedLostIndices.add(u);
                matchedFoundIndices.add(v);
            }
        }

        // Identify unmatched items
        List<Item> unmatchedLost = new ArrayList<>();
        for (int u = 0; u < m; u++) {
            if (!matchedLostIndices.contains(u)) {
                unmatchedLost.add(lostItems.get(u));
            }
        }

        List<Item> unmatchedFound = new ArrayList<>();
        for (int v = 0; v < n; v++) {
            if (!matchedFoundIndices.contains(v)) {
                unmatchedFound.add(foundItems.get(v));
            }
        }

        return new MatchingResult(pairs, unmatchedLost, unmatchedFound, m, n, edgeCount);
    }

    /**
     * DFS augmenting path finder.
     * Returns true if an augmenting path starting at Lost item u can be found.
     */
    private static boolean findAugmentingPath(int u, List<List<Integer>> adj,
                                              boolean[] visitedFound, int[] matchFoundToLost) {
        for (int v : adj.get(u)) {
            if (!visitedFound[v]) {
                visitedFound[v] = true;

                // If Found item v is not yet matched OR previously matched Lost item can find another partner
                if (matchFoundToLost[v] < 0 || findAugmentingPath(matchFoundToLost[v], adj, visitedFound, matchFoundToLost)) {
                    matchFoundToLost[v] = u;
                    return true;
                }
            }
        }
        return false;
    }
}
