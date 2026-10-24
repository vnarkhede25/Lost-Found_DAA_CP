package com.lostfound.model;

public class PriorityItem implements Comparable<PriorityItem> {
    private int itemId;
    private double priorityScore;
    private String name;
    private String reporterEmail;
    private String type;
    private String category;
    private String date;

    public PriorityItem() {}

    public PriorityItem(int itemId, double priorityScore, String name, String reporterEmail) {
        this.itemId = itemId;
        this.priorityScore = priorityScore;
        this.name = name;
        this.reporterEmail = reporterEmail;
    }

    public int getItemId() { return itemId; }
    public void setItemId(int itemId) { this.itemId = itemId; }

    public double getPriorityScore() { return priorityScore; }
    public void setPriorityScore(double priorityScore) { this.priorityScore = priorityScore; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getReporterEmail() { return reporterEmail; }
    public void setReporterEmail(String reporterEmail) { this.reporterEmail = reporterEmail; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    @Override
    public int compareTo(PriorityItem o) {
        // Higher score comes first in max-heap
        return Double.compare(o.priorityScore, this.priorityScore);
    }
}
