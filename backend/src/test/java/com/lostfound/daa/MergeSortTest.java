package com.lostfound.daa;

import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

public class MergeSortTest {

    @Test
    public void testEmptyAndSingleElement() {
        List<Integer> empty = Collections.emptyList();
        List<Integer> sortedEmpty = MergeSort.sort(empty, Integer::compareTo);
        assertTrue(sortedEmpty.isEmpty());

        List<Integer> single = List.of(42);
        List<Integer> sortedSingle = MergeSort.sort(single, Integer::compareTo);
        assertEquals(List.of(42), sortedSingle);
    }

    @Test
    public void testRandomCollectionAgainstStandardSort() {
        Random rand = new Random(42);
        List<Integer> data = new ArrayList<>();
        for (int i = 0; i < 500; i++) {
            data.add(rand.nextInt(1000));
        }

        List<Integer> expected = new ArrayList<>(data);
        Collections.sort(expected);

        long[] metrics = new long[]{0};
        List<Integer> actual = MergeSort.sortWithMetrics(data, Integer::compareTo, metrics);

        assertEquals(expected, actual);
        assertTrue(metrics[0] > 0, "Comparisons must be tracked");
    }

    @Test
    public void testDuplicatesAndReverseOrder() {
        List<Integer> reverse = new ArrayList<>(List.of(9, 8, 7, 7, 6, 5, 5, 4, 3, 2, 1, 0));
        List<Integer> actual = MergeSort.sort(reverse, Integer::compareTo);

        for (int i = 0; i < actual.size() - 1; i++) {
            assertTrue(actual.get(i) <= actual.get(i + 1), "Array must be in non-decreasing order");
        }
    }

    static class ItemKey {
        final int key;
        final String tag;
        ItemKey(int key, String tag) { this.key = key; this.tag = tag; }
    }

    @Test
    public void testSortStability() {
        // Equal keys should preserve insertion order
        List<ItemKey> items = List.of(
            new ItemKey(10, "first"),
            new ItemKey(5, "A"),
            new ItemKey(10, "second"),
            new ItemKey(5, "B"),
            new ItemKey(10, "third")
        );

        List<ItemKey> sorted = MergeSort.sort(items, Comparator.comparingInt(k -> k.key));

        assertEquals("A", sorted.get(0).tag);
        assertEquals("B", sorted.get(1).tag);
        assertEquals("first", sorted.get(2).tag);
        assertEquals("second", sorted.get(3).tag);
        assertEquals("third", sorted.get(4).tag);
    }
}
