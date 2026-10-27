package com.lostfound.model;

public class AuditLog {
    private int id;
    private String actorEmail;
    private String action; // REPORT_CREATED, CLAIM_SUBMITTED, CLAIM_APPROVED, CLAIM_REJECTED, ITEM_HANDED_OVER, REPORT_DELETED
    private String targetType; // ITEM, CLAIM
    private int targetId;
    private String details;
    private String timestamp;

    public AuditLog() {}

    public AuditLog(int id, String actorEmail, String action, String targetType, int targetId, String details, String timestamp) {
        this.id = id;
        this.actorEmail = actorEmail;
        this.action = action;
        this.targetType = targetType;
        this.targetId = targetId;
        this.details = details;
        this.timestamp = timestamp;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getActorEmail() { return actorEmail; }
    public void setActorEmail(String actorEmail) { this.actorEmail = actorEmail; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public int getTargetId() { return targetId; }
    public void setTargetId(int targetId) { this.targetId = targetId; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
