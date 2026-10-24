package com.lostfound.ds;

import com.lostfound.model.Item;
import java.util.ArrayList;
import java.util.List;

public class QuadTree {
    public static class BoundingBox {
        public double minX, minY, maxX, maxY;

        public BoundingBox(double minX, double minY, double maxX, double maxY) {
            this.minX = minX;
            this.minY = minY;
            this.maxX = maxX;
            this.maxY = maxY;
        }

        public boolean contains(double x, double y) {
            return x >= minX && x <= maxX && y >= minY && y <= maxY;
        }

        public boolean intersects(double qMinX, double qMinY, double qMaxX, double qMaxY) {
            return !(qMinX > maxX || qMaxX < minX || qMinY > maxY || qMaxY < minY);
        }
    }

    private static class QuadNode {
        BoundingBox box;
        int capacity;
        List<Item> items = new ArrayList<>();
        boolean divided = false;
        QuadNode nw, ne, sw, se;

        QuadNode(BoundingBox box, int capacity) {
            this.box = box;
            this.capacity = capacity;
        }

        void subdivide() {
            double midX = (box.minX + box.maxX) / 2.0;
            double midY = (box.minY + box.maxY) / 2.0;

            nw = new QuadNode(new BoundingBox(box.minX, midY, midX, box.maxY), capacity);
            ne = new QuadNode(new BoundingBox(midX, midY, box.maxX, box.maxY), capacity);
            sw = new QuadNode(new BoundingBox(box.minX, box.minY, midX, midY), capacity);
            se = new QuadNode(new BoundingBox(midX, box.minY, box.maxX, midY), capacity);

            divided = true;
        }
    }

    private QuadNode root;
    private final int capacity;
    private int totalCount;

    public QuadTree() {
        // Default coordinate boundary: e.g. 0 to 100 or campus coordinate plane
        this.capacity = 4;
        this.root = new QuadNode(new BoundingBox(0, 0, 100, 100), capacity);
        this.totalCount = 0;
    }

    public synchronized boolean insert(Item item) {
        if (item == null) return false;
        double[] coords = resolveCoordinates(item);
        double x = coords[0];
        double y = coords[1];

        if (!root.box.contains(x, y)) {
            // Expand boundary if outside default 0..100
            root.box.minX = Math.min(root.box.minX, x - 10);
            root.box.minY = Math.min(root.box.minY, y - 10);
            root.box.maxX = Math.max(root.box.maxX, x + 10);
            root.box.maxY = Math.max(root.box.maxY, y + 10);
        }

        boolean inserted = insertNode(root, item, x, y);
        if (inserted) {
            totalCount++;
        }
        return inserted;
    }

    private boolean insertNode(QuadNode node, Item item, double x, double y) {
        if (!node.box.contains(x, y)) {
            return false;
        }

        if (node.items.size() < node.capacity && !node.divided) {
            node.items.add(item);
            return true;
        }

        if (!node.divided) {
            node.subdivide();
            List<Item> existing = new ArrayList<>(node.items);
            node.items.clear();
            for (Item ex : existing) {
                double[] c = resolveCoordinates(ex);
                insertNode(node, ex, c[0], c[1]);
            }
        }

        if (insertNode(node.nw, item, x, y)) return true;
        if (insertNode(node.ne, item, x, y)) return true;
        if (insertNode(node.sw, item, x, y)) return true;
        return insertNode(node.se, item, x, y);
    }

    public synchronized List<Item> findNearby(double x, double y, double radius) {
        List<Item> results = new ArrayList<>();
        double qMinX = x - radius;
        double qMaxX = x + radius;
        double qMinY = y - radius;
        double qMaxY = y + radius;

        queryRec(root, qMinX, qMinY, qMaxX, qMaxY, x, y, radius, results);
        return results;
    }

    private void queryRec(QuadNode node, double qMinX, double qMinY, double qMaxX, double qMaxY,
                          double centerX, double centerY, double radius, List<Item> results) {
        if (node == null || !node.box.intersects(qMinX, qMinY, qMaxX, qMaxY)) {
            return;
        }

        for (Item item : node.items) {
            double[] c = resolveCoordinates(item);
            double dist = Math.hypot(c[0] - centerX, c[1] - centerY);
            if (dist <= radius) {
                results.add(item);
            }
        }

        if (node.divided) {
            queryRec(node.nw, qMinX, qMinY, qMaxX, qMaxY, centerX, centerY, radius, results);
            queryRec(node.ne, qMinX, qMinY, qMaxX, qMaxY, centerX, centerY, radius, results);
            queryRec(node.sw, qMinX, qMinY, qMaxX, qMaxY, centerX, centerY, radius, results);
            queryRec(node.se, qMinX, qMinY, qMaxX, qMaxY, centerX, centerY, radius, results);
        }
    }

    public synchronized void clear() {
        root = new QuadNode(new BoundingBox(0, 0, 100, 100), capacity);
        totalCount = 0;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public int getMaxDepth() {
        return getDepthRec(root);
    }

    private int getDepthRec(QuadNode node) {
        if (node == null) return 0;
        if (!node.divided) return 1;
        return 1 + Math.max(Math.max(getDepthRec(node.nw), getDepthRec(node.ne)),
                            Math.max(getDepthRec(node.sw), getDepthRec(node.se)));
    }

    public static double[] resolveCoordinates(Item item) {
        if (item.getLatitude() != 0.0 || item.getLongitude() != 0.0) {
            return new double[]{ item.getLatitude(), item.getLongitude() };
        }
        // Deterministic pseudo coordinates from location name hash
        String loc = item.getLocation() != null ? item.getLocation() : "Campus";
        int hash = Math.abs(loc.hashCode());
        double x = (hash % 85) + 10.0;
        double y = ((hash / 100) % 85) + 10.0;
        item.setLatitude(x);
        item.setLongitude(y);
        return new double[]{ x, y };
    }
}
