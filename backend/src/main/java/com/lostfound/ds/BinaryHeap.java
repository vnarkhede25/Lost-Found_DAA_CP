package com.lostfound.ds;

import com.lostfound.model.PriorityItem;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class BinaryHeap {
    private final List<PriorityItem> heap;

    public BinaryHeap() {
        this.heap = new ArrayList<>();
    }

    private int parent(int i) { return (i - 1) / 2; }
    private int leftChild(int i) { return (2 * i) + 1; }
    private int rightChild(int i) { return (2 * i) + 2; }

    private void swap(int i, int j) {
        PriorityItem temp = heap.get(i);
        heap.set(i, heap.get(j));
        heap.set(j, temp);
    }

    public synchronized void insert(PriorityItem item) {
        if (item == null) return;
        heap.add(item);
        int current = heap.size() - 1;

        // Heapify up (Max-heap: child > parent)
        while (current > 0 && heap.get(current).getPriorityScore() > heap.get(parent(current)).getPriorityScore()) {
            swap(current, parent(current));
            current = parent(current);
        }
    }

    public synchronized PriorityItem extractMax() {
        if (heap.isEmpty()) return null;
        PriorityItem maxItem = heap.get(0);
        PriorityItem lastItem = heap.remove(heap.size() - 1);

        if (!heap.isEmpty()) {
            heap.set(0, lastItem);
            heapifyDown(0);
        }

        return maxItem;
    }

    private void heapifyDown(int i) {
        int maxIndex = i;
        int left = leftChild(i);
        int right = rightChild(i);

        if (left < heap.size() && heap.get(left).getPriorityScore() > heap.get(maxIndex).getPriorityScore()) {
            maxIndex = left;
        }

        if (right < heap.size() && heap.get(right).getPriorityScore() > heap.get(maxIndex).getPriorityScore()) {
            maxIndex = right;
        }

        if (i != maxIndex) {
            swap(i, maxIndex);
            heapifyDown(maxIndex);
        }
    }

    public synchronized PriorityItem peek() {
        return heap.isEmpty() ? null : heap.get(0);
    }

    public synchronized List<PriorityItem> getTopK(int k) {
        List<PriorityItem> copy = new ArrayList<>(heap);
        Collections.sort(copy);
        int limit = Math.min(k, copy.size());
        return new ArrayList<>(copy.subList(0, limit));
    }

    public synchronized void clear() {
        heap.clear();
    }

    public synchronized int size() {
        return heap.size();
    }
}
