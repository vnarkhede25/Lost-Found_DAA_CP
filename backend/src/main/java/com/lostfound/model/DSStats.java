package com.lostfound.model;

import java.util.Map;

public class DSStats {
    private int totalItems;
    private int lostCount;
    private int foundCount;
    private int matchedCount;
    private int resolvedCount;
    
    // ADS Structure Metrics
    private int trieNodeCount;
    private int trieWordsIndexed;
    private int avlDateTreeNodes;
    private int avlDateTreeHeight;
    private int avlLocationTreeNodes;
    private int avlLocationTreeHeight;
    private int priorityHeapSize;
    private double highestPriorityScore;
    private int quadTreeItemsCount;
    private int quadTreeDepth;
    private Map<String, Integer> categoryDistribution;

    public DSStats() {}

    public int getTotalItems() { return totalItems; }
    public void setTotalItems(int totalItems) { this.totalItems = totalItems; }

    public int getLostCount() { return lostCount; }
    public void setLostCount(int lostCount) { this.lostCount = lostCount; }

    public int getFoundCount() { return foundCount; }
    public void setFoundCount(int foundCount) { this.foundCount = foundCount; }

    public int getMatchedCount() { return matchedCount; }
    public void setMatchedCount(int matchedCount) { this.matchedCount = matchedCount; }

    public int getResolvedCount() { return resolvedCount; }
    public void setResolvedCount(int resolvedCount) { this.resolvedCount = resolvedCount; }

    public int getTrieNodeCount() { return trieNodeCount; }
    public void setTrieNodeCount(int trieNodeCount) { this.trieNodeCount = trieNodeCount; }

    public int getTrieWordsIndexed() { return trieWordsIndexed; }
    public void setTrieWordsIndexed(int trieWordsIndexed) { this.trieWordsIndexed = trieWordsIndexed; }

    public int getAvlDateTreeNodes() { return avlDateTreeNodes; }
    public void setAvlDateTreeNodes(int avlDateTreeNodes) { this.avlDateTreeNodes = avlDateTreeNodes; }

    public int getAvlDateTreeHeight() { return avlDateTreeHeight; }
    public void setAvlDateTreeHeight(int avlDateTreeHeight) { this.avlDateTreeHeight = avlDateTreeHeight; }

    public int getAvlLocationTreeNodes() { return avlLocationTreeNodes; }
    public void setAvlLocationTreeNodes(int avlLocationTreeNodes) { this.avlLocationTreeNodes = avlLocationTreeNodes; }

    public int getAvlLocationTreeHeight() { return avlLocationTreeHeight; }
    public void setAvlLocationTreeHeight(int avlLocationTreeHeight) { this.avlLocationTreeHeight = avlLocationTreeHeight; }

    public int getPriorityHeapSize() { return priorityHeapSize; }
    public void setPriorityHeapSize(int priorityHeapSize) { this.priorityHeapSize = priorityHeapSize; }

    public double getHighestPriorityScore() { return highestPriorityScore; }
    public void setHighestPriorityScore(double highestPriorityScore) { this.highestPriorityScore = highestPriorityScore; }

    public int getQuadTreeItemsCount() { return quadTreeItemsCount; }
    public void setQuadTreeItemsCount(int quadTreeItemsCount) { this.quadTreeItemsCount = quadTreeItemsCount; }

    public int getQuadTreeDepth() { return quadTreeDepth; }
    public void setQuadTreeDepth(int quadTreeDepth) { this.quadTreeDepth = quadTreeDepth; }

    public Map<String, Integer> getCategoryDistribution() { return categoryDistribution; }
    public void setCategoryDistribution(Map<String, Integer> categoryDistribution) { this.categoryDistribution = categoryDistribution; }
}
