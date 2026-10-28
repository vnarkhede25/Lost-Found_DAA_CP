package com.lostfound.model;

public class Notification {
    private int id;
    private String recipientEmail;
    private String title;
    private String message;
    private String type; // MATCH_FOUND, CLAIM_REQUESTED, CLAIM_ACCEPTED, ITEM_RETURNED, INFO
    private String createdAt;
    private boolean read;
    private Integer claimId;
    private Integer itemId;
    private Integer matchedItemId;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String actionUrl;

    // Interactive verification & contact sharing fields
    private boolean requiresAction = false;
    private String actionType; // "VERIFY_CLAIM", "SHARE_CONTACT", "VIEW_MATCH"
    private String proofText;
    private boolean finderSharePhone = false;
    private boolean finderShareEmail = false;
    private boolean claimantSharePhone = false;
    private boolean claimantShareEmail = false;

    public Notification() {
        this.read = false;
    }

    public Notification(int id, String recipientEmail, String title, String message, String type, String createdAt) {
        this.id = id;
        this.recipientEmail = recipientEmail;
        this.title = title;
        this.message = message;
        this.type = type;
        this.createdAt = createdAt;
        this.read = false;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public Integer getClaimId() { return claimId; }
    public void setClaimId(Integer claimId) { this.claimId = claimId; }

    public Integer getItemId() { return itemId; }
    public void setItemId(Integer itemId) { this.itemId = itemId; }

    public Integer getMatchedItemId() { return matchedItemId; }
    public void setMatchedItemId(Integer matchedItemId) { this.matchedItemId = matchedItemId; }

    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }

    public boolean isRequiresAction() { return requiresAction; }
    public void setRequiresAction(boolean requiresAction) { this.requiresAction = requiresAction; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getProofText() { return proofText; }
    public void setProofText(String proofText) { this.proofText = proofText; }

    public boolean isFinderSharePhone() { return finderSharePhone; }
    public void setFinderSharePhone(boolean finderSharePhone) { this.finderSharePhone = finderSharePhone; }

    public boolean isFinderShareEmail() { return finderShareEmail; }
    public void setFinderShareEmail(boolean finderShareEmail) { this.finderShareEmail = finderShareEmail; }

    public boolean isClaimantSharePhone() { return claimantSharePhone; }
    public void setClaimantSharePhone(boolean claimantSharePhone) { this.claimantSharePhone = claimantSharePhone; }

    public boolean isClaimantShareEmail() { return claimantShareEmail; }
    public void setClaimantShareEmail(boolean claimantShareEmail) { this.claimantShareEmail = claimantShareEmail; }
}
