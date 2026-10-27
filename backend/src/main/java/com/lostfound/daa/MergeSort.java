package com.lostfound.daa;

import java.util.*;

/**
 * Syllabus Reference: Unit-II Recursion and Divide and Conquer
 * Concept: Merge Sort Algorithm
 *
 * Divide and Conquer Strategy:
 *   1. Divide: Split the collection into two sublists of size floor(n/2) and ceil(n/2).
 *   2. Conquer: Recursively sort each sublist using Merge Sort.
 *   3. Combine: Merge the two sorted sublists into a single sorted list in linear time.
 *
 * Recurrence Relation:
 *   T(n) = 2 * T(n / 2) + Theta(n)   for n > 1
 *   T(1) = Theta(1)
 *
 * Master Theorem Application:
 *   a = 2, b = 2, f(n) = Theta(n)
 *   log_b(a) = log_2(2) = 1
 *   Since f(n) = Theta(n^{log_b(a)}), Case 2 of Master Theorem applies:
 *   T(n) = Theta(n^{log_2(2)} * log n) = Theta(n log n).
 *
 * Time Complexity:
 *   Best Case:    Omega(n log n)
 *   Average Case: Theta(n log n)
 *   Worst Case:   O(n log n)
 *
 * Auxiliary Space:
 *   Theta(n) for temporary merge buffers.
 *
 * Stability:
 *   Stable sort: preserves relative order of elements with equal keys.
 */
public class MergeSort {

    public static class SortMetrics {
        private final long comparisons;
        private final long elapsedNanos;
        private final int elementsSorted;

        public SortMetrics(long comparisons, long elapsedNanos, int elementsSorted) {
            this.comparisons = comparisons;
            this.elapsedNanos = elapsedNanos;
            this.elementsSorted = elementsSorted;
        }

        public long getComparisons() { return comparisons; }
        public long getElapsedNanos() { return elapsedNanos; }
        public int getElementsSorted() { return elementsSorted; }
    }

    /**
     * Pure Merge Sort on a list with custom comparator.
     * Returns a new sorted list (does not mutate original in-place unless specified).
     */
    public static <T> List<T> sort(List<T> list, Comparator<T> comparator) {
        if (list == null || list.size() <= 1) {
            return list == null ? new ArrayList<>() : new ArrayList<>(list);
        }
        List<T> result = new ArrayList<>(list);
        mergeSortInternal(result, 0, result.size() - 1, comparator, null);
        return result;
    }

    /**
     * Merge sort with metric tracking (comparisons count and execution time).
     */
    public static <T> List<T> sortWithMetrics(List<T> list, Comparator<T> comparator, long[] comparisonCounter) {
        if (list == null || list.size() <= 1) {
            return list == null ? new ArrayList<>() : new ArrayList<>(list);
        }
        List<T> result = new ArrayList<>(list);
        mergeSortInternal(result, 0, result.size() - 1, comparator, comparisonCounter);
        return result;
    }

    private static <T> void mergeSortInternal(List<T> list, int left, int right,
                                              Comparator<T> comparator, long[] counter) {
        if (left < right) {
            int mid = left + (right - left) / 2; // Prevents integer overflow
            mergeSortInternal(list, left, mid, comparator, counter);
            mergeSortInternal(list, mid + 1, right, comparator, counter);
            merge(list, left, mid, right, comparator, counter);
        }
    }

    private static <T> void merge(List<T> list, int left, int mid, int right,
                                  Comparator<T> comparator, long[] counter) {
        int n1 = mid - left + 1;
        int n2 = right - mid;

        List<T> leftList = new ArrayList<>(n1);
        List<T> rightList = new ArrayList<>(n2);

        for (int i = 0; i < n1; i++) leftList.add(list.get(left + i));
        for (int j = 0; j < n2; j++) rightList.add(list.get(mid + 1 + j));

        int i = 0, j = 0, k = left;
        while (i < n1 && j < n2) {
            if (counter != null) counter[0]++;
            // Use <= to ensure stability
            if (comparator.compare(leftList.get(i), rightList.get(j)) <= 0) {
                list.set(k++, leftList.get(i++));
            } else {
                list.set(k++, rightList.get(j++));
            }
        }

        while (i < n1) {
            list.set(k++, leftList.get(i++));
        }

        while (j < n2) {
            list.set(k++, rightList.get(j++));
        }
    }
}
