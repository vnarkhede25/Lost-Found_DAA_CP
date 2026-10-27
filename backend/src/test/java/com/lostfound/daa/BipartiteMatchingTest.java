package com.lostfound.daa;

import com.lostfound.model.Item;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

public class BipartiteMatchingTest {

    private Item createItem(int id, String type, String name, String category) {
        Item item = new Item(id, type, name, category, "desc", "loc", "2026-10-20", "user@test.edu", "OPEN", null);
        return item;
    }

    @Test
    public void testEmptyPartitions() {
        List<Item> lost = Collections.emptyList();
        List<Item> found = List.of(createItem(1, "FOUND", "Keys", "Keys"));

        BipartiteMatching.MatchingResult res = BipartiteMatching.computeMaxMatching(lost, found, 0.5, (l, f) -> 0.8);
        assertEquals(0, res.getCardinality());
        assertTrue(res.getMatchedPairs().isEmpty());
    }

    @Test
    public void testNoEdgesAboveThreshold() {
        List<Item> lost = List.of(createItem(1, "LOST", "Earbuds", "Electronics"));
        List<Item> found = List.of(createItem(2, "FOUND", "Umbrella", "Accessories"));

        BipartiteMatching.MatchingResult res = BipartiteMatching.computeMaxMatching(lost, found, 0.7, (l, f) -> 0.2);
        assertEquals(0, res.getCardinality());
        assertEquals(1, res.getUnmatchedLostItems().size());
        assertEquals(1, res.getUnmatchedFoundItems().size());
    }

    @Test
    public void testCompetingPairingsOneToOneConstraint() {
        // Lost 1 matches Found A & Found B
        // Lost 2 only matches Found A
        // A greedy approach matching Lost 1 to Found A might leave Lost 2 with nothing.
        // The augmenting path algorithm must backtrack and match Lost 1 to Found B and Lost 2 to Found A, yielding cardinality 2!
        Item l1 = createItem(1, "LOST", "Lost Item 1", "General");
        Item l2 = createItem(2, "LOST", "Lost Item 2", "General");

        Item fA = createItem(10, "FOUND", "Found A", "General");
        Item fB = createItem(20, "FOUND", "Found B", "General");

        BipartiteMatching.SimilarityEvaluator evaluator = (l, f) -> {
            if (l.getId() == 1 && (f.getId() == 10 || f.getId() == 20)) return 0.8;
            if (l.getId() == 2 && f.getId() == 10) return 0.8;
            return 0.1;
        };

        BipartiteMatching.MatchingResult res = BipartiteMatching.computeMaxMatching(
                List.of(l1, l2), List.of(fA, fB), 0.5, evaluator
        );

        assertEquals(2, res.getCardinality(), "Augmenting path must achieve maximum cardinality of 2");

        Set<Integer> matchedLostIds = new HashSet<>();
        Set<Integer> matchedFoundIds = new HashSet<>();
        for (BipartiteMatching.MatchedPair p : res.getMatchedPairs()) {
            matchedLostIds.add(p.getLostItem().getId());
            matchedFoundIds.add(p.getFoundItem().getId());
        }

        assertEquals(Set.of(1, 2), matchedLostIds);
        assertEquals(Set.of(10, 20), matchedFoundIds);
    }
}
