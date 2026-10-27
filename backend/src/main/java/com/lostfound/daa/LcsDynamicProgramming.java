package com.lostfound.daa;

import java.util.*;

/**
 * Syllabus Reference: Unit-III Dynamic Programming
 * Concept: Longest Common Subsequence (LCS)
 *
 * Recurrence Relation:
 *   LCS(i, j) = 0                                       if i == 0 or j == 0
 *   LCS(i, j) = 1 + LCS(i - 1, j - 1)                   if X[i-1] == Y[j-1]
 *   LCS(i, j) = max(LCS(i - 1, j), LCS(i, j - 1))       if X[i-1] != Y[j-1]
 *
 * Time Complexity: O(m * n) where m = |X| and n = |Y|
 * Space Complexity: O(m * n) for 2D DP matrix; O(min(m, n)) for space-optimized length
 */
public class LcsDynamicProgramming {

    public static class LcsResult {
        private final int lcsLength;
        private final String reconstructedLcs;
        private final double similarityRatio; // 2 * LCS / (|A| + |B|) in range [0.0, 1.0]
        private final int[][] dpMatrix;
        private final String textA;
        private final String textB;

        public LcsResult(int lcsLength, String reconstructedLcs, double similarityRatio,
                         int[][] dpMatrix, String textA, String textB) {
            this.lcsLength = lcsLength;
            this.reconstructedLcs = reconstructedLcs;
            this.similarityRatio = similarityRatio;
            this.dpMatrix = dpMatrix;
            this.textA = textA;
            this.textB = textB;
        }

        public int getLcsLength() { return lcsLength; }
        public String getReconstructedLcs() { return reconstructedLcs; }
        public double getSimilarityRatio() { return similarityRatio; }
        public int[][] getDpMatrix() { return dpMatrix; }
        public String getTextA() { return textA; }
        public String getTextB() { return textB; }
    }

    /**
     * Compute full 2D Dynamic Programming table and reconstruct the actual common subsequence.
     */
    public static LcsResult computeLcs(String a, String b) {
        String cleanA = normalize(a);
        String cleanB = normalize(b);

        int m = cleanA.length();
        int n = cleanB.length();

        if (m == 0 || n == 0) {
            return new LcsResult(0, "", 0.0, new int[1][1], cleanA, cleanB);
        }

        int[][] dp = new int[m + 1][n + 1];

        // Fill DP table
        for (int i = 1; i <= m; i++) {
            char ca = cleanA.charAt(i - 1);
            for (int j = 1; j <= n; j++) {
                char cb = cleanB.charAt(j - 1);
                if (ca == cb) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        // Backtrack to reconstruct the LCS string
        StringBuilder lcsBuilder = new StringBuilder();
        int i = m, j = n;
        while (i > 0 && j > 0) {
            if (cleanA.charAt(i - 1) == cleanB.charAt(j - 1)) {
                lcsBuilder.append(cleanA.charAt(i - 1));
                i--;
                j--;
            } else if (dp[i - 1][j] >= dp[i][j - 1]) {
                i--;
            } else {
                j--;
            }
        }

        String reconstructed = lcsBuilder.reverse().toString();
        int lcsLen = dp[m][n];
        double similarity = (2.0 * lcsLen) / (m + n);

        return new LcsResult(lcsLen, reconstructed, similarity, dp, cleanA, cleanB);
    }

    /**
     * Space-optimized LCS: Uses only 2 rows of size min(m, n), achieving O(min(m, n)) auxiliary space.
     */
    public static int computeLcsLengthOptimizedSpace(String a, String b) {
        String s1 = normalize(a);
        String s2 = normalize(b);

        if (s1.length() < s2.length()) {
            String temp = s1;
            s1 = s2;
            s2 = temp;
        }

        int m = s1.length();
        int n = s2.length();
        if (n == 0) return 0;

        int[] prev = new int[n + 1];
        int[] curr = new int[n + 1];

        for (int i = 1; i <= m; i++) {
            char c1 = s1.charAt(i - 1);
            for (int j = 1; j <= n; j++) {
                char c2 = s2.charAt(j - 1);
                if (c1 == c2) {
                    curr[j] = prev[j - 1] + 1;
                } else {
                    curr[j] = Math.max(prev[j], curr[j - 1]);
                }
            }
            System.arraycopy(curr, 0, prev, 0, n + 1);
        }

        return curr[n];
    }

    /**
     * Token-level LCS similarity on normalized words.
     * Prevents character-level coincidences on completely distinct words.
     */
    public static double computeTokenLcsSimilarity(String textA, String textB) {
        List<String> tokensA = tokenize(textA);
        List<String> tokensB = tokenize(textB);

        int m = tokensA.size();
        int n = tokensB.size();
        if (m == 0 || n == 0) return 0.0;

        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++) {
            String wA = tokensA.get(i - 1);
            for (int j = 1; j <= n; j++) {
                String wB = tokensB.get(j - 1);
                if (wA.equalsIgnoreCase(wB)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        int commonTokens = dp[m][n];
        return (2.0 * commonTokens) / (m + n);
    }

    public static String normalize(String s) {
        if (s == null) return "";
        return s.toLowerCase().replaceAll("[^a-z0-9 ]", " ").replaceAll("\\s+", " ").trim();
    }

    public static List<String> tokenize(String s) {
        if (s == null) return Collections.emptyList();
        String clean = normalize(s);
        if (clean.isEmpty()) return Collections.emptyList();
        String[] words = clean.split(" ");
        List<String> result = new ArrayList<>();
        Set<String> stopWords = Set.of("the", "a", "an", "in", "on", "at", "and", "or", "for", "with", "is", "was", "it");
        for (String w : words) {
            if (w.length() >= 2 && !stopWords.contains(w)) {
                result.add(w);
            }
        }
        return result;
    }
}
