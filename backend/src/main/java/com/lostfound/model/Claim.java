package com.lostfound.model;

public class Claim {
    private int id;
    private int itemId;
    private Integer matchedItemId; // Optional related report (e.g. lost report linking to found item)
    private String claimantEmail;
    private String claimantName;
    private String contactPhone;
    private String descriptionProof; // Secret identifying marks, serial numbers, wallpapers, contents
    private String proofPhotoUrl;
    private String status; // PENDING, APPROVED, REJECTED, RETURNED_HANDED_OVER
    private String adminNotes; // Stated reason for approval or rejection
    private String adminEmail;
    private String createdAt;
    private String resolvedAt;

    // Contact details shared upon approval
    private String finderName;
    private String finderEmail;
    private String finderPhone;
    private boolean finderVerified = false;
    private boolean finderSharePhone = false;
    private boolean finderShareEmail = false;
    private boolean claimantSharePhone = false;
    private boolean claimantShareEmail = false;

    // Attached item snapshots for UI convenience
    private Item item;
    private Item matchedItem;

    public Claim() {
        this.status = "PENDING";
    }

    public Claim(int id, int itemId, Integer matchedItemId, String claimantEmail, String claimantName,
                 String contactPhone, String descriptionProof, String proofPhotoUrl, String createdAt) {
        this.id = id;
        this.itemId = itemId;
        this.matchedItemId = matchedItemId;
        this.claimantEmail = claimantEmail;
        this.claimantName = claimantName;
        this.contactPhone = contactPhone;
        this.descriptionProof = descriptionProof;
        this.proofPhotoUrl = proofPhotoUrl;
        this.status = "PENDING";
        this.createdAt = createdAt;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getItemId() { return itemId; }
    public void setItemId(int itemId) { this.itemId = itemId; }

    public Integer getMatchedItemId() { return matchedItemId; }
    public void setMatchedItemId(Integer matchedItemId) { this.matchedItemId = matchedItemId; }

    public String getClaimantEmail() { return claimantEmail; }
    public void setClaimantEmail(String claimantEmail) { this.claimantEmail = claimantEmail; }

    public String getClaimantName() { return claimantName; }
    public void setClaimantName(String claimantName) { this.claimantName = claimantName; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getDescriptionProof() { return descriptionProof; }
    public void setDescriptionProof(String descriptionProof) { this.descriptionProof = descriptionProof; }

    public String getProofPhotoUrl() { return proofPhotoUrl; }
    public void setProofPhotoUrl(String proofPhotoUrl) { this.proofPhotoUrl = proofPhotoUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public String getAdminEmail() { return adminEmail; }
    public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(String resolvedAt) { this.resolvedAt = resolvedAt; }

    public Item getItem() { return item; }
    public void setItem(Item item) { this.item = item; }

    public Item getMatchedItem() { return matchedItem; }
    public void setMatchedItem(Item matchedItem) { this.matchedItem = matchedItem; }

    public String getFinderName() { return finderName; }
    public void setFinderName(String finderName) { this.finderName = finderName; }

    public String getFinderEmail() { return finderEmail; }
    public void setFinderEmail(String finderEmail) { this.finderEmail = finderEmail; }

    public String getFinderPhone() { return finderPhone; }
    public void setFinderPhone(String finderPhone) { this.finderPhone = finderPhone; }

    public boolean isFinderVerified() { return finderVerified; }
    public void setFinderVerified(boolean finderVerified) { this.finderVerified = finderVerified; }

    public boolean isFinderSharePhone() { return finderSharePhone; }
    public void setFinderSharePhone(boolean finderSharePhone) { this.finderSharePhone = finderSharePhone; }

    public boolean isFinderShareEmail() { return finderShareEmail; }
    public void setFinderShareEmail(boolean finderShareEmail) { this.finderShareEmail = finderShareEmail; }

    public boolean isClaimantSharePhone() { return claimantSharePhone; }
    public void setClaimantSharePhone(boolean claimantSharePhone) { this.claimantSharePhone = claimantSharePhone; }

    public boolean isClaimantShareEmail() { return claimantShareEmail; }
    public void setClaimantShareEmail(boolean claimantShareEmail) { this.claimantShareEmail = claimantShareEmail; }
}
