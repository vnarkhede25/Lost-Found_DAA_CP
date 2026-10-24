package com.lostfound.model;

public class Match {
    private int lostItemId;
    private int foundItemId;
    private double score;           // 0.0 to 1.0 (or percentage 0 to 100%)
    private String matchReason;     // e.g. "95% title match + matching Electronics category + 2 days apart"
    private String dateCreated;
    private String status;          // "POTENTIAL", "CONFIRMED", "REJECTED"
    private Item lostItem;
    private Item foundItem;

    public Match() {}

    public Match(int lostItemId, int foundItemId, double score, String dateCreated) {
        this.lostItemId = lostItemId;
        this.foundItemId = foundItemId;
        this.score = score;
        this.dateCreated = dateCreated;
        this.status = "POTENTIAL";
    }

    public int getLostItemId() { return lostItemId; }
    public void setLostItemId(int lostItemId) { this.lostItemId = lostItemId; }

    public int getFoundItemId() { return foundItemId; }
    public void setFoundItemId(int foundItemId) { this.foundItemId = foundItemId; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }

    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }

    public String getDateCreated() { return dateCreated; }
    public void setDateCreated(String dateCreated) { this.dateCreated = dateCreated; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Item getLostItem() { return lostItem; }
    public void setLostItem(Item lostItem) { this.lostItem = lostItem; }

    public Item getFoundItem() { return foundItem; }
    public void setFoundItem(Item foundItem) { this.foundItem = foundItem; }
}
