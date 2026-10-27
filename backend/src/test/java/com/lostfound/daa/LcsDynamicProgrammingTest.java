package com.lostfound.daa;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class LcsDynamicProgrammingTest {

    @Test
    public void testEmptyStrings() {
        LcsDynamicProgramming.LcsResult res1 = LcsDynamicProgramming.computeLcs("", "hello");
        assertEquals(0, res1.getLcsLength());
        assertEquals("", res1.getReconstructedLcs());
        assertEquals(0.0, res1.getSimilarityRatio());

        LcsDynamicProgramming.LcsResult res2 = LcsDynamicProgramming.computeLcs("", "");
        assertEquals(0, res2.getLcsLength());
    }

    @Test
    public void testIdenticalStrings() {
        String text = "apple airpods pro in black case";
        LcsDynamicProgramming.LcsResult res = LcsDynamicProgramming.computeLcs(text, text);
        assertEquals(text.replaceAll("[^a-z0-9 ]", "").length(), res.getLcsLength());
        assertEquals(1.0, res.getSimilarityRatio(), 0.001);
    }

    @Test
    public void testPartialOverlapAndBacktracking() {
        String a = "black hydro flask bottle";
        String b = "dark hydro flask water bottle";

        LcsDynamicProgramming.LcsResult res = LcsDynamicProgramming.computeLcs(a, b);
        assertTrue(res.getLcsLength() > 0);
        assertTrue(res.getSimilarityRatio() > 0.60);
        assertTrue(res.getReconstructedLcs().contains("hydro flask"));
    }

    @Test
    public void testCompletelyDisjointStrings() {
        String a = "calculator engineering hall";
        String b = "leather wallet courtyard";

        double tokenSim = LcsDynamicProgramming.computeTokenLcsSimilarity(a, b);
        assertEquals(0.0, tokenSim, 0.001);
    }

    @Test
    public void testSpaceOptimizedLcsMatchesFullTable() {
        String a = "north face backpack navy blue";
        String b = "blue fjallraven kanken backpack";

        int tableLcs = LcsDynamicProgramming.computeLcs(a, b).getLcsLength();
        int spaceOptLcs = LcsDynamicProgramming.computeLcsLengthOptimizedSpace(a, b);
        assertEquals(tableLcs, spaceOptLcs);
    }
}
