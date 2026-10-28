package com.lostfound.service;

import com.lostfound.model.Claim;
import com.lostfound.model.Item;
import com.lostfound.model.Notification;
import com.lostfound.model.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClaimService {
    private final StorageService storage;
    private final LostFoundService lostFoundService;

    public ClaimService(StorageService storage, LostFoundService lostFoundService) {
        this.storage = storage;
        this.lostFoundService = lostFoundService;
    }

    public synchronized Claim submitClaim(Claim claim) {
        if (claim == null || claim.getItemId() <= 0 || claim.getClaimantEmail() == null) {
            throw new IllegalArgumentException("Invalid claim: Item ID and claimant email required");
        }

        Item item = storage.getItemById(claim.getItemId());
        if (item == null) {
            throw new IllegalArgumentException("Item with ID " + claim.getItemId() + " not found");
        }
        if ("RETURNED".equalsIgnoreCase(item.getStatus()) || "CLOSED".equalsIgnoreCase(item.getStatus())) {
            throw new IllegalStateException("Cannot claim an item that has already been returned or closed");
        }

        // Check for existing pending claim by the same user for this item to prevent duplicates
        List<Claim> existing = storage.getClaimsByEmail(claim.getClaimantEmail());
        for (Claim c : existing) {
            if (c.getItemId() == claim.getItemId() && "PENDING".equalsIgnoreCase(c.getStatus())) {
                throw new IllegalStateException("You already have a pending claim under review for this item");
            }
        }

        int claimId = storage.getNextClaimId();
        claim.setId(claimId);
        claim.setStatus("PENDING");
        claim.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        claim.setItem(item);

        if (claim.getMatchedItemId() != null && claim.getMatchedItemId() > 0) {
            Item matched = storage.getItemById(claim.getMatchedItemId());
            claim.setMatchedItem(matched);
        } else {
            // Auto-detect if claimant already reported a matching LOST item
            for (Item candidate : storage.getAllItems()) {
                if ("LOST".equalsIgnoreCase(candidate.getType()) && candidate.getReporterEmail() != null
                        && candidate.getReporterEmail().equalsIgnoreCase(claim.getClaimantEmail())) {
                    boolean sameCat = candidate.getCategory() != null && item.getCategory() != null 
                            && candidate.getCategory().equalsIgnoreCase(item.getCategory());
                    boolean sameName = candidate.getName() != null && item.getName() != null &&
                            (candidate.getName().toLowerCase().contains(item.getName().toLowerCase()) ||
                             item.getName().toLowerCase().contains(candidate.getName().toLowerCase()));
                    if (sameCat || sameName) {
                        claim.setMatchedItemId(candidate.getId());
                        claim.setMatchedItem(candidate);
                        break;
                    }
                }
            }
        }

        storage.addClaim(claim);

        // Update item status to indicate pending ownership verification
        item.setStatus("CLAIM_PENDING");
        storage.recordAudit(claim.getClaimantEmail(), "CLAIM_SUBMITTED", "CLAIM", claimId,
                "Submitted claim with proof details for Item #" + item.getId() + " (" + item.getName() + ")");

        // Notify the person who reported the found item
        if (item.getReporterEmail() != null && !item.getReporterEmail().equalsIgnoreCase(claim.getClaimantEmail())) {
            String claimantDisplayName = claim.getClaimantName() != null && !claim.getClaimantName().isEmpty() 
                    ? claim.getClaimantName() : claim.getClaimantEmail().split("@")[0];
            Notification notif = new Notification(
                    storage.getNextNotificationId(),
                    item.getReporterEmail(),
                    "Claim Verification: Is this claim correct?",
                    claimantDisplayName + " submitted an ownership claim with proof for your found item '" + item.getName() + "'. Please check the proof and confirm if it is correct.",
                    "CLAIM_REQUESTED",
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
            );
            notif.setClaimId(claimId);
            notif.setItemId(item.getId());
            notif.setContactName(claimantDisplayName);
            notif.setContactEmail(claim.getClaimantEmail());
            notif.setContactPhone(claim.getContactPhone());
            notif.setRequiresAction(true);
            notif.setActionType("VERIFY_CLAIM");
            notif.setProofText(claim.getDescriptionProof());
            storage.addNotification(notif);
        }

        return claim;
    }

    public List<Claim> getUserClaims(String email) {
        List<Claim> list = storage.getClaimsByEmail(email);
        for (Claim c : list) {
            populateItemSnapshots(c);
        }
        return list;
    }

    public List<Claim> getAllClaims(String statusFilter) {
        List<Claim> list = storage.getAllClaims();
        for (Claim c : list) {
            populateItemSnapshots(c);
        }
        if (statusFilter != null && !statusFilter.isEmpty() && !"ALL".equalsIgnoreCase(statusFilter)) {
            return list.stream()
                    .filter(c -> statusFilter.equalsIgnoreCase(c.getStatus()))
                    .collect(Collectors.toList());
        }
        return list;
    }

    public Claim getClaimById(int id) {
        Claim claim = storage.getClaimById(id);
        if (claim != null) {
            populateItemSnapshots(claim);
        }
        return claim;
    }

    public synchronized Claim reviewClaim(int claimId, String decision, String adminNotes, String adminEmail) {
        Claim claim = storage.getClaimById(claimId);
        if (claim == null) {
            throw new IllegalArgumentException("Claim #" + claimId + " not found");
        }
        if ("RETURNED_HANDED_OVER".equalsIgnoreCase(claim.getStatus())) {
            throw new IllegalStateException("Cannot alter a claim that has already been handed over");
        }

        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        claim.setResolvedAt(now);
        claim.setAdminEmail(adminEmail);
        claim.setAdminNotes(adminNotes != null ? adminNotes.trim() : "Reviewed by admin");

        Item item = storage.getItemById(claim.getItemId());

        if ("APPROVED".equalsIgnoreCase(decision)) {
            claim.setStatus("APPROVED");
            if (item != null) {
                item.setStatus("CLAIM_PENDING"); // Awaiting physical pickup/handover
            }
            storage.recordAudit(adminEmail, "CLAIM_APPROVED", "CLAIM", claimId,
                    "Approved claim #" + claimId + ". Reason: " + claim.getAdminNotes());
        } else if ("REJECTED".equalsIgnoreCase(decision)) {
            claim.setStatus("REJECTED");
            // Check if there are other pending claims for this item
            boolean otherPending = storage.getAllClaims().stream()
                    .anyMatch(c -> c.getId() != claimId && c.getItemId() == claim.getItemId() && "PENDING".equalsIgnoreCase(c.getStatus()));
            if (item != null && !otherPending && !"RETURNED".equalsIgnoreCase(item.getStatus())) {
                item.setStatus("OPEN");
            }
            storage.recordAudit(adminEmail, "CLAIM_REJECTED", "CLAIM", claimId,
                    "Rejected claim #" + claimId + ". Reason: " + claim.getAdminNotes());
        } else {
            throw new IllegalArgumentException("Decision must be either 'APPROVED' or 'REJECTED'");
        }

        populateItemSnapshots(claim);
        return claim;
    }

    public synchronized Claim confirmHandover(int claimId, String handoverNotes, String adminEmail) {
        Claim claim = storage.getClaimById(claimId);
        if (claim == null) {
            throw new IllegalArgumentException("Claim #" + claimId + " not found");
        }
        if (!"APPROVED".equalsIgnoreCase(claim.getStatus()) && !"PENDING".equalsIgnoreCase(claim.getStatus())) {
            throw new IllegalStateException("Only approved or verified claims can proceed to physical handover");
        }

        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        claim.setStatus("RETURNED_HANDED_OVER");
        claim.setResolvedAt(now);
        claim.setAdminEmail(adminEmail);
        if (handoverNotes != null && !handoverNotes.trim().isEmpty()) {
            claim.setAdminNotes((claim.getAdminNotes() != null ? claim.getAdminNotes() + " | " : "") + handoverNotes);
        }

        // Close the claimed item
        Item item = storage.getItemById(claim.getItemId());
        if (item != null) {
            item.setStatus("RETURNED");
            removeAssociatedLostEntry(claim, item, adminEmail);
        }

        storage.recordAudit(adminEmail, "ITEM_HANDED_OVER", "CLAIM", claimId,
                "Physical handover confirmed for Claim #" + claimId + ". Item marked RETURNED.");

        // Refresh match suggestions so completed returns are excluded
        lostFoundService.findMatches();

        populateItemSnapshots(claim);
        return claim;
    }

    public synchronized Claim acceptClaimByFinder(int claimId, String finderEmail, String notes) {
        return verifyAndShareByFinder(claimId, finderEmail, true, true, true, notes);
    }

    public synchronized Claim verifyAndShareByFinder(int claimId, String finderEmail, boolean isCorrect,
                                                     boolean sharePhone, boolean shareEmail, String notes) {
        Claim claim = storage.getClaimById(claimId);
        if (claim == null) {
            throw new IllegalArgumentException("Claim #" + claimId + " not found");
        }
        Item item = storage.getItemById(claim.getItemId());
        if (item == null) {
            throw new IllegalArgumentException("Associated item not found");
        }

        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        claim.setResolvedAt(now);

        if (!isCorrect) {
            claim.setStatus("REJECTED");
            claim.setFinderVerified(false);
            claim.setAdminNotes(notes != null && !notes.trim().isEmpty() ? notes.trim() : "Rejected by finder: Proof does not match.");

            // Check if there are other pending claims
            boolean otherPending = storage.getAllClaims().stream()
                    .anyMatch(c -> c.getId() != claimId && c.getItemId() == claim.getItemId() && "PENDING".equalsIgnoreCase(c.getStatus()));
            if (!otherPending && !"RETURNED".equalsIgnoreCase(item.getStatus())) {
                item.setStatus("OPEN");
            }

            // Notify Claimant of rejection
            Notification claimantNotif = new Notification(
                    storage.getNextNotificationId(),
                    claim.getClaimantEmail(),
                    "Claim Rejected by Finder",
                    "The finder reviewed the proof submitted for '" + item.getName() + "' and indicated that it is not correct.",
                    "CLAIM_REJECTED",
                    now
            );
            claimantNotif.setClaimId(claimId);
            claimantNotif.setItemId(item.getId());
            storage.addNotification(claimantNotif);

            // Notify Finder of completion
            Notification finderNotif = new Notification(
                    storage.getNextNotificationId(),
                    finderEmail,
                    "Claim Marked as Incorrect",
                    "You rejected the claim for '" + item.getName() + "'.",
                    "INFO",
                    now
            );
            finderNotif.setClaimId(claimId);
            finderNotif.setItemId(item.getId());
            storage.addNotification(finderNotif);

            storage.recordAudit(finderEmail, "CLAIM_REJECTED_BY_FINDER", "CLAIM", claimId,
                    "Finder marked claim #" + claimId + " as incorrect.");
            populateItemSnapshots(claim);
            return claim;
        }

        // Finder verified claim is correct!
        User finderUser = storage.getUserByEmail(finderEmail);
        String finderName = finderUser != null && finderUser.getUsername() != null 
                ? finderUser.getUsername() : (item.getReporterName() != null ? item.getReporterName() : finderEmail.split("@")[0]);
        String finderPhone = item.getContactPhone() != null ? item.getContactPhone() : "";

        claim.setStatus("APPROVED");
        claim.setFinderVerified(true);
        claim.setFinderEmail(finderEmail);
        claim.setFinderName(finderName);
        claim.setFinderPhone(finderPhone);
        claim.setFinderSharePhone(sharePhone);
        claim.setFinderShareEmail(shareEmail);
        claim.setAdminNotes(notes != null && !notes.trim().isEmpty() ? notes.trim() : "Verified correct by finder. Contacts ready.");

        item.setStatus("CLAIM_PENDING");

        // 1. Send notification to Claimant prompting for their contact sharing preference
        Notification claimantNotif = new Notification(
                storage.getNextNotificationId(),
                claim.getClaimantEmail(),
                "Claim Verified! Share Your Contact Details?",
                finderName + " confirmed your claim is correct for '" + item.getName() + "'! Do you want to share your contact details to connect and receive your item?",
                "CLAIM_VERIFIED",
                now
        );
        claimantNotif.setClaimId(claimId);
        claimantNotif.setItemId(item.getId());
        claimantNotif.setRequiresAction(true);
        claimantNotif.setActionType("SHARE_CONTACT");
        claimantNotif.setFinderSharePhone(sharePhone);
        claimantNotif.setFinderShareEmail(shareEmail);
        claimantNotif.setContactName(finderName);
        claimantNotif.setContactEmail(shareEmail ? finderEmail : null);
        claimantNotif.setContactPhone(sharePhone ? finderPhone : null);
        storage.addNotification(claimantNotif);

        // 2. Notification to Finder confirming verification
        String sharingSummary = (sharePhone && shareEmail) ? "Phone & Email" : sharePhone ? "Phone" : shareEmail ? "Email" : "None";
        Notification finderNotif = new Notification(
                storage.getNextNotificationId(),
                finderEmail,
                "Claim Verified: Sharing Preferences Saved",
                "You confirmed " + claim.getClaimantName() + "'s claim as correct with contact sharing: " + sharingSummary + ". A notification has been sent to the claimant to share their contacts.",
                "INFO",
                now
        );
        finderNotif.setClaimId(claimId);
        finderNotif.setItemId(item.getId());
        finderNotif.setFinderSharePhone(sharePhone);
        finderNotif.setFinderShareEmail(shareEmail);
        storage.addNotification(finderNotif);

        storage.recordAudit(finderEmail, "CLAIM_VERIFIED_BY_FINDER", "CLAIM", claimId,
                "Finder verified claim #" + claimId + " as correct. Sharing: " + sharingSummary);

        populateItemSnapshots(claim);
        return claim;
    }

    public synchronized Claim claimantShareContact(int claimId, String claimantEmail,
                                                   boolean shareContact, boolean sharePhone, boolean shareEmail) {
        Claim claim = storage.getClaimById(claimId);
        if (claim == null) {
            throw new IllegalArgumentException("Claim #" + claimId + " not found");
        }
        Item item = storage.getItemById(claim.getItemId());
        if (item == null) {
            throw new IllegalArgumentException("Associated item not found");
        }

        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        claim.setClaimantSharePhone(shareContact && sharePhone);
        claim.setClaimantShareEmail(shareContact && shareEmail);

        String finderEmail = claim.getFinderEmail() != null ? claim.getFinderEmail() : item.getReporterEmail();
        String finderName = claim.getFinderName() != null ? claim.getFinderName() : (item.getReporterName() != null ? item.getReporterName() : "Finder");
        String finderPhone = claim.getFinderPhone() != null ? claim.getFinderPhone() : (item.getContactPhone() != null ? item.getContactPhone() : "");

        String claimantName = claim.getClaimantName() != null && !claim.getClaimantName().isEmpty() 
                ? claim.getClaimantName() : claimantEmail.split("@")[0];
        String claimantPhone = claim.getContactPhone() != null ? claim.getContactPhone() : "";

        // 1. Notification to Finder with claimant's shared contacts
        Notification finderNotif = new Notification(
                storage.getNextNotificationId(),
                finderEmail,
                "Contact Details Exchanged!",
                claimantName + " shared contact info for '" + item.getName() + "'. You can now reach out and safely return their belongings.",
                "CLAIM_ACCEPTED",
                now
        );
        finderNotif.setClaimId(claimId);
        finderNotif.setItemId(item.getId());
        finderNotif.setContactName(claimantName);
        finderNotif.setContactEmail((shareContact && shareEmail) ? claimantEmail : null);
        finderNotif.setContactPhone((shareContact && sharePhone) ? claimantPhone : null);
        finderNotif.setClaimantSharePhone(shareContact && sharePhone);
        finderNotif.setClaimantShareEmail(shareContact && shareEmail);
        finderNotif.setFinderSharePhone(claim.isFinderSharePhone());
        finderNotif.setFinderShareEmail(claim.isFinderShareEmail());
        storage.addNotification(finderNotif);

        // 2. Notification to Claimant with finder's shared contacts
        Notification claimantNotif = new Notification(
                storage.getNextNotificationId(),
                claimantEmail,
                "Contact Details Exchanged! Arrange Return",
                "You and finder " + finderName + " have exchanged contact details for '" + item.getName() + "'. Reach out to return the item and confirm once received.",
                "CLAIM_ACCEPTED",
                now
        );
        claimantNotif.setClaimId(claimId);
        claimantNotif.setItemId(item.getId());
        claimantNotif.setContactName(finderName);
        claimantNotif.setContactEmail(claim.isFinderShareEmail() ? finderEmail : null);
        claimantNotif.setContactPhone(claim.isFinderSharePhone() ? finderPhone : null);
        claimantNotif.setFinderSharePhone(claim.isFinderSharePhone());
        claimantNotif.setFinderShareEmail(claim.isFinderShareEmail());
        claimantNotif.setClaimantSharePhone(shareContact && sharePhone);
        claimantNotif.setClaimantShareEmail(shareContact && shareEmail);
        storage.addNotification(claimantNotif);

        storage.recordAudit(claimantEmail, "CLAIMANT_SHARED_CONTACT", "CLAIM", claimId,
                "Claimant shared contacts. Phone: " + (shareContact && sharePhone) + ", Email: " + (shareContact && shareEmail));

        populateItemSnapshots(claim);
        return claim;
    }

    public synchronized Claim confirmReceivedByOwner(int claimId, String ownerEmail) {
        Claim claim = storage.getClaimById(claimId);
        if (claim == null) {
            throw new IllegalArgumentException("Claim #" + claimId + " not found");
        }
        Item item = storage.getItemById(claim.getItemId());
        if (item == null) {
            throw new IllegalArgumentException("Associated item not found");
        }

        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        claim.setStatus("RETURNED_HANDED_OVER");
        claim.setResolvedAt(now);

        // Mark item as returned
        item.setStatus("RETURNED");

        // Automatically remove the lost entry of this item
        removeAssociatedLostEntry(claim, item, ownerEmail);

        String claimantDisplayName = claim.getClaimantName() != null && !claim.getClaimantName().isEmpty() 
                ? claim.getClaimantName() : ownerEmail.split("@")[0];

        // 1. Notify lost owner
        Notification ownerNotif = new Notification(
                storage.getNextNotificationId(),
                ownerEmail,
                "Belongings Recovered & Case Closed!",
                "You confirmed receiving your '" + item.getName() + "'. We are glad your belongings are back with you!",
                "ITEM_RETURNED",
                now
        );
        ownerNotif.setClaimId(claimId);
        ownerNotif.setItemId(item.getId());
        storage.addNotification(ownerNotif);

        // 2. Notify finder
        String finderEmail = claim.getFinderEmail() != null ? claim.getFinderEmail() : item.getReporterEmail();
        if (finderEmail != null && !finderEmail.equalsIgnoreCase(ownerEmail)) {
            Notification finderNotif = new Notification(
                    storage.getNextNotificationId(),
                    finderEmail,
                    "Handover Confirmed: Item Returned!",
                    claimantDisplayName + " confirmed receiving their belongings for '" + item.getName() + "'. Thank you for your honesty and help!",
                    "ITEM_RETURNED",
                    now
            );
            finderNotif.setClaimId(claimId);
            finderNotif.setItemId(item.getId());
            storage.addNotification(finderNotif);
        }

        storage.recordAudit(ownerEmail, "OWNER_CONFIRMED_RECEIVED", "CLAIM", claimId,
                "Owner confirmed receipt of belongings for Claim #" + claimId + ". Item marked RETURNED.");

        lostFoundService.findMatches();
        populateItemSnapshots(claim);
        return claim;
    }

    /**
     * Automatically removes the lost report entry of an item once it is confirmed returned.
     */
    private void removeAssociatedLostEntry(Claim claim, Item returnedItem, String actorEmail) {
        Set<Integer> lostItemIdsToRemove = new LinkedHashSet<>();

        // 1. If the item itself was a LOST report, remove it
        if ("LOST".equalsIgnoreCase(returnedItem.getType())) {
            lostItemIdsToRemove.add(returnedItem.getId());
        }

        // 2. If claim explicitly links to a matched lost item, remove it
        if (claim.getMatchedItemId() != null && claim.getMatchedItemId() > 0) {
            Item matched = storage.getItemById(claim.getMatchedItemId());
            if (matched != null && "LOST".equalsIgnoreCase(matched.getType())) {
                lostItemIdsToRemove.add(matched.getId());
            }
        }

        // 3. Find any active LOST item reported by the claimant that corresponds to this item
        String claimantEmail = claim.getClaimantEmail();
        for (Item candidate : storage.getAllItems()) {
            if ("LOST".equalsIgnoreCase(candidate.getType()) && candidate.getReporterEmail() != null) {
                boolean matchesEmail = candidate.getReporterEmail().equalsIgnoreCase(claimantEmail) 
                        || (actorEmail != null && candidate.getReporterEmail().equalsIgnoreCase(actorEmail));
                if (matchesEmail) {
                    boolean sameCategory = candidate.getCategory() != null && returnedItem.getCategory() != null
                            && candidate.getCategory().equalsIgnoreCase(returnedItem.getCategory());
                    boolean similarName = candidate.getName() != null && returnedItem.getName() != null
                            && (candidate.getName().toLowerCase().contains(returnedItem.getName().toLowerCase())
                            || returnedItem.getName().toLowerCase().contains(candidate.getName().toLowerCase()));
                    if (sameCategory || similarName) {
                        lostItemIdsToRemove.add(candidate.getId());
                    }
                }
            }
        }

        // Execute automatic deletion of the lost entries from the registry and indexes
        for (Integer lostId : lostItemIdsToRemove) {
            Item toRemove = storage.getItemById(lostId);
            String name = toRemove != null ? toRemove.getName() : "Item #" + lostId;
            lostFoundService.deleteItem(lostId);
            storage.recordAudit(actorEmail != null ? actorEmail : "system", "LOST_ENTRY_AUTO_REMOVED", "ITEM", lostId,
                    "Automatically removed lost report entry '" + name + "' (#" + lostId + ") following item return.");
        }

        // Refresh match suggestions so returned items no longer match
        lostFoundService.findMatches();
    }

    private void populateItemSnapshots(Claim c) {
        if (c.getItem() == null && c.getItemId() > 0) {
            c.setItem(storage.getItemById(c.getItemId()));
        }
        if (c.getMatchedItem() == null && c.getMatchedItemId() != null && c.getMatchedItemId() > 0) {
            c.setMatchedItem(storage.getItemById(c.getMatchedItemId()));
        }
    }
}
