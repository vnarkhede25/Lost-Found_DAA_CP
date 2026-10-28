package com.lostfound.service;

import com.lostfound.model.Claim;
import com.lostfound.model.Item;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class ClaimServiceTest {
    private StorageService storage;
    private LostFoundService lostFoundService;
    private ClaimService claimService;

    @BeforeEach
    public void setup() {
        storage = new StorageService();
        Item testFoundItem = new Item(2, "FOUND", "White Wireless Earbuds in Black Case", "Electronics",
                "Found a pair of Apple wireless earbuds in a dark case on desk #14 in the library.",
                "Central Library - 2nd Floor", "2026-10-23", "sophia.p@university.edu", "OPEN", null);
        storage.addItem(testFoundItem);
        lostFoundService = new LostFoundService(storage);
        claimService = new ClaimService(storage, lostFoundService);
    }

    @Test
    public void testSubmitValidClaim() {
        Claim claim = new Claim();
        claim.setItemId(2); // Found earbuds
        claim.setClaimantEmail("alex.morgan@university.edu");
        claim.setClaimantName("Alex Morgan");
        claim.setDescriptionProof("Serial number ends in 492X, black silicone case has tiny scratch on hinge.");

        Claim submitted = claimService.submitClaim(claim);
        assertNotNull(submitted);
        assertEquals("PENDING", submitted.getStatus());
        assertTrue(submitted.getId() > 0);

        Item targetItem = storage.getItemById(2);
        assertEquals("CLAIM_PENDING", targetItem.getStatus());
    }

    @Test
    public void testPreventDuplicatePendingClaims() {
        Claim claim1 = new Claim();
        claim1.setItemId(2);
        claim1.setClaimantEmail("alex.morgan@university.edu");
        claim1.setDescriptionProof("First attempt evidence");
        claimService.submitClaim(claim1);

        Claim claim2 = new Claim();
        claim2.setItemId(2);
        claim2.setClaimantEmail("alex.morgan@university.edu");
        claim2.setDescriptionProof("Duplicate submission");

        assertThrows(IllegalStateException.class, () -> claimService.submitClaim(claim2));
    }

    @Test
    public void testAdminReviewAndHandover() {
        Claim claim = new Claim();
        claim.setItemId(2);
        claim.setClaimantEmail("sophia.p@university.edu");
        claim.setDescriptionProof("Valid serial proof");
        Claim created = claimService.submitClaim(claim);

        // Admin approves claim
        Claim approved = claimService.reviewClaim(created.getId(), "APPROVED", "Matching proof verified with receipt", "security@university.edu");
        assertEquals("APPROVED", approved.getStatus());

        // Admin confirms physical custody handover
        Claim handedOver = claimService.confirmHandover(created.getId(), "Handed over at security office", "security@university.edu");
        assertEquals("RETURNED_HANDED_OVER", handedOver.getStatus());

        Item item = storage.getItemById(2);
        assertEquals("RETURNED", item.getStatus());
    }

    @Test
    public void testAutomaticRemovalOfLostEntryUponReturn() {
        // 1. Alex reports a LOST item
        Item lostItem = new Item(1, "LOST", "Blue Herschel Backpack", "Bags",
                "Dark blue backpack with NASA patch", "Library", "2026-10-25",
                "alex.morgan@university.edu", "OPEN", null);
        storage.addItem(lostItem);

        // 2. Sophia found it (item ID 2 in setup)
        // 3. Alex submits claim with proof
        Claim claim = new Claim();
        claim.setItemId(2);
        claim.setMatchedItemId(1);
        claim.setClaimantEmail("alex.morgan@university.edu");
        claim.setClaimantName("Alex Morgan");
        claim.setDescriptionProof("NASA patch on front zipper");
        Claim submitted = claimService.submitClaim(claim);

        // 4. Sophia verifies
        claimService.verifyAndShareByFinder(submitted.getId(), "sophia.p@university.edu", true, true, true, "Verified");

        // 5. Alex confirms receipt
        claimService.confirmReceivedByOwner(submitted.getId(), "alex.morgan@university.edu");

        // 6. Verify that the LOST entry #1 has been automatically removed from the registry
        assertNull(storage.getItemById(1), "Lost item entry should be automatically removed upon return");

        // 7. Verify found item is marked RETURNED
        Item foundItem = storage.getItemById(2);
        assertEquals("RETURNED", foundItem.getStatus());
    }
}
