package com.lostfound.ds;

import java.util.*;

public class Trie {
    private static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        Set<Integer> itemIds = new LinkedHashSet<>();
        boolean isEndOfWord = false;
    }

    private final TrieNode root;
    private int nodeCount;
    private int wordCount;

    public Trie() {
        this.root = new TrieNode();
        this.nodeCount = 1;
        this.wordCount = 0;
    }

    public synchronized void insert(String word, int itemId) {
        if (word == null || word.trim().isEmpty()) return;
        String clean = word.trim().toLowerCase();

        TrieNode current = root;
        current.itemIds.add(itemId);

        for (int i = 0; i < clean.length(); i++) {
            char c = clean.charAt(i);
            if (!current.children.containsKey(c)) {
                current.children.put(c, new TrieNode());
                nodeCount++;
            }
            current = current.children.get(c);
            current.itemIds.add(itemId);
        }

        if (!current.isEndOfWord) {
            current.isEndOfWord = true;
            wordCount++;
        }
    }

    public synchronized List<Integer> getSuggestions(String prefix) {
        if (prefix == null || prefix.trim().isEmpty()) {
            return new ArrayList<>();
        }
        String clean = prefix.trim().toLowerCase();

        TrieNode current = root;
        for (int i = 0; i < clean.length(); i++) {
            char c = clean.charAt(i);
            if (!current.children.containsKey(c)) {
                return new ArrayList<>();
            }
            current = current.children.get(c);
        }

        return new ArrayList<>(current.itemIds);
    }

    public synchronized void clear() {
        root.children.clear();
        root.itemIds.clear();
        root.isEndOfWord = false;
        nodeCount = 1;
        wordCount = 0;
    }

    public int getNodeCount() {
        return nodeCount;
    }

    public int getWordCount() {
        return wordCount;
    }
}
