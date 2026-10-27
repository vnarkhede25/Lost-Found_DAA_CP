package com.lostfound.model;

public class Item {
    private int id;
    private String type;           // "LOST" or "FOUND"
    private String name;
    private String category;       // "Electronics", "IDs & Cards", "Bags & Wallets", "Keys", "Accessories", "Books & Stationery", "Other"
    private String description;
    private String location;
    private String date;           // "YYYY-MM-DD"
    private String reporterEmail;
    private String reporterName;
    private String status;         // "OPEN", "MATCHED", "RESOLVED"
    private String photoUrl;
    private double latitude;
    private double longitude;
    private String contactPhone;
    private String reward;
    private double priorityScore;

    public Item() {
        this.status = "OPEN";
    }

    public Item(int id, String type, String name, String category, String description,
                String location, String date, String reporterEmail, String status, String photoUrl) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.category = category;
        this.description = description;
        this.location = location;
        this.date = date;
        this.reporterEmail = reporterEmail;
        this.status = status != null ? status : "OPEN";
        this.photoUrl = photoUrl;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getReporterEmail() { return reporterEmail; }
    public void setReporterEmail(String reporterEmail) { this.reporterEmail = reporterEmail; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getReward() { return reward; }
    public void setReward(String reward) { this.reward = reward; }

    public double getPriorityScore() { return priorityScore; }
    public void setPriorityScore(double priorityScore) { this.priorityScore = priorityScore; }

    private boolean flaggedSuspicious = false;
    private String flagReason;

    public boolean isFlaggedSuspicious() { return flaggedSuspicious; }
    public void setFlaggedSuspicious(boolean flaggedSuspicious) { this.flaggedSuspicious = flaggedSuspicious; }

    public String getFlagReason() { return flagReason; }
    public void setFlagReason(String flagReason) { this.flagReason = flagReason; }
}
