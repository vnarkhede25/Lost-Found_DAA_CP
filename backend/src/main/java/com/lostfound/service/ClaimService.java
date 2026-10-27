package com.lostfound.service;

import com.lostfound.model.Claim;
import com.lostfound.model.Item;
import com.lostfound.model.Notification;
import com.lostfound.model.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
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
                    "New Claim Request for Your Found Item!",
                    claimantDisplayName + " submitted an ownership claim for your found item '" + item.getName() + "'. Review their proof to accept and return.",
                    "CLAIM_REQUESTED",
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
            );
            notif.setClaimId(claimId);
            notif.setItemId(item.getId());
            notif.setContactName(claimantDisplayName);
            notif.setContactEmail(claim.getClaimantEmail());
            notif.setContactPhone(claim.getContactPhone());
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
        }

        // If this claim was linked to an associated lost report, close that too
        if (claim.getMatchedItemId() != null && claim.getMatchedItemId() > 0) {
            Item matched = storage.getItemById(claim.getMatchedItemId());
            if (matched != null) {
                matched.setStatus("RETURNED");
            }
        }

        storage.recordAudit(adminEmail, "ITEM_HANDED_OVER", "CLAIM", claimId,
                "Physical handover confirmed for Claim #" + claimId + ". Item marked RETURNED.");

        // Refresh match suggestions so completed returns are excluded
        lostFoundService.findMatches();

        populateItemSnapshots(claim);
        return claim;
    }

    public synchronized Claim acceptClaimByFinder(int claimId, String finderEmail, String notes) {
        Claim claim = storage.getClaimById(claimId);
        if (claim == null) {
            throw new IllegalArgumentException("Claim #" + claimId + " not found");
        }
        Item item = storage.getItemById(claim.getItemId());
        if (item == null) {
            throw new IllegalArgumentException("Associated item not found");
        }

        User finderUser = storage.getUserByEmail(finderEmail);
        String finderName = finderUser != null && finderUser.getUsername() != null 
                ? finderUser.getUsername() : (item.getReporterName() != null ? item.getReporterName() : finderEmail.split("@")[0]);
        String finderPhone = item.getContactPhone() != null ? item.getContactPhone() : "";

        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        claim.setStatus("APPROVED");
        claim.setResolvedAt(now);
        claim.setFinderEmail(finderEmail);
        claim.setFinderName(finderName);
        claim.setFinderPhone(finderPhone);
        claim.setAdminNotes(notes != null && !notes.trim().isEmpty() ? notes.trim() : "Accepted by finder. Contact details exchanged.");

        item.setStatus("CLAIM_PENDING");

        // 1. Send notification to claimant with finder contact details
        Notification claimantNotif = new Notification(
                storage.getNextNotificationId(),
                claim.getClaimantEmail(),
                "Claim Accepted! Contact Details Shared",
                finderName + " accepted your claim for '" + item.getName() + "'! Please contact them to safely arrange receiving your belongings.",
                "CLAIM_ACCEPTED",
                now
        );
        claimantNotif.setClaimId(claimId);
        claimantNotif.setItemId(item.getId());
        claimantNotif.setContactName(finderName);
        claimantNotif.setContactEmail(finderEmail);
        claimantNotif.setContactPhone(finderPhone);
        storage.addNotification(claimantNotif);

        // 2. Send confirmation notification to finder with claimant contact details
        Notification finderNotif = new Notification(
                storage.getNextNotificationId(),
                finderEmail,
                "You Accepted Claim for '" + item.getName() + "'",
                "You accepted " + claim.getClaimantName() + "'s claim. Please contact them at " + claim.getClaimantEmail() + 
                        (claim.getContactPhone() != null && !claim.getContactPhone().isEmpty() ? " or " + claim.getContactPhone() : "") + 
                        " to return their belongings.",
                "CLAIM_ACCEPTED",
                now
        );
        finderNotif.setClaimId(claimId);
        finderNotif.setItemId(item.getId());
        finderNotif.setContactName(claim.getClaimantName());
        finderNotif.setContactEmail(claim.getClaimantEmail());
        finderNotif.setContactPhone(claim.getContactPhone());
        storage.addNotification(finderNotif);

        storage.recordAudit(finderEmail, "CLAIM_ACCEPTED_BY_FINDER", "CLAIM", claimId,
                "Finder accepted claim #" + claimId + " for Item #" + item.getId() + ". Contacts exchanged.");

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

        // Mark matched lost item as returned if present
        if (claim.getMatchedItemId() != null && claim.getMatchedItemId() > 0) {
            Item matched = storage.getItemById(claim.getMatchedItemId());
            if (matched != null) {
                matched.setStatus("RETURNED");
            }
        }

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

    private void populateItemSnapshots(Claim c) {
        if (c.getItem() == null && c.getItemId() > 0) {
            c.setItem(storage.getItemById(c.getItemId()));
        }
        if (c.getMatchedItem() == null && c.getMatchedItemId() != null && c.getMatchedItemId() > 0) {
            c.setMatchedItem(storage.getItemById(c.getMatchedItemId()));
        }
    }
}
