package com.lostfound.ds;

import com.lostfound.model.Item;
import java.util.ArrayList;
import java.util.List;

public class AVLTree {
    private static class AVLNode {
        String key;
        List<Item> items = new ArrayList<>();
        AVLNode left;
        AVLNode right;
        int height;

        AVLNode(String key, Item item) {
            this.key = key;
            this.items.add(item);
            this.height = 1;
        }
    }

    private AVLNode root;
    private final String sortKey; // "date" or "location"
    private int size;

    public AVLTree(String sortKey) {
        this.sortKey = sortKey;
        this.size = 0;
    }

    private int height(AVLNode node) {
        return node == null ? 0 : node.height;
    }

    private int getBalance(AVLNode node) {
        return node == null ? 0 : height(node.left) - height(node.right);
    }

    private AVLNode rightRotate(AVLNode y) {
        AVLNode x = y.left;
        AVLNode T2 = x.right;

        x.right = y;
        y.left = T2;

        y.height = Math.max(height(y.left), height(y.right)) + 1;
        x.height = Math.max(height(x.left), height(x.right)) + 1;

        return x;
    }

    private AVLNode leftRotate(AVLNode x) {
        AVLNode y = x.right;
        AVLNode T2 = y.left;

        y.left = x;
        x.right = T2;

        x.height = Math.max(height(x.left), height(x.right)) + 1;
        y.height = Math.max(height(y.left), height(y.right)) + 1;

        return y;
    }

    public synchronized void insert(Item item) {
        if (item == null) return;
        String key = "date".equalsIgnoreCase(sortKey) ? item.getDate() : item.getLocation();
        if (key == null) key = "";
        key = key.trim();
        root = insertRec(root, key, item);
        size++;
    }

    private AVLNode insertRec(AVLNode node, String key, Item item) {
        if (node == null) {
            return new AVLNode(key, item);
        }

        int cmp = key.compareToIgnoreCase(node.key);
        if (cmp < 0) {
            node.left = insertRec(node.left, key, item);
        } else if (cmp > 0) {
            node.right = insertRec(node.right, key, item);
        } else {
            node.items.add(item);
            return node;
        }

        node.height = 1 + Math.max(height(node.left), height(node.right));
        int balance = getBalance(node);

        // Left Left Case
        if (balance > 1 && key.compareToIgnoreCase(node.left.key) < 0) {
            return rightRotate(node);
        }
        // Right Right Case
        if (balance < -1 && key.compareToIgnoreCase(node.right.key) > 0) {
            return leftRotate(node);
        }
        // Left Right Case
        if (balance > 1 && key.compareToIgnoreCase(node.left.key) > 0) {
            node.left = leftRotate(node.left);
            return rightRotate(node);
        }
        // Right Left Case
        if (balance < -1 && key.compareToIgnoreCase(node.right.key) < 0) {
            node.right = rightRotate(node.right);
            return leftRotate(node);
        }

        return node;
    }

    public synchronized List<Item> getAllSorted() {
        List<Item> result = new ArrayList<>();
        inOrderTraversal(root, result);
        return result;
    }

    private void inOrderTraversal(AVLNode node, List<Item> result) {
        if (node != null) {
            inOrderTraversal(node.left, result);
            result.addAll(node.items);
            inOrderTraversal(node.right, result);
        }
    }

    public synchronized List<Item> getRange(String startKey, String endKey) {
        List<Item> result = new ArrayList<>();
        rangeTraversal(root, startKey, endKey, result);
        return result;
    }

    private void rangeTraversal(AVLNode node, String start, String end, List<Item> result) {
        if (node == null) return;

        if (start != null && !start.isEmpty() && node.key.compareToIgnoreCase(start) > 0) {
            rangeTraversal(node.left, start, end, result);
        }

        boolean withinStart = (start == null || start.isEmpty() || node.key.compareToIgnoreCase(start) >= 0);
        boolean withinEnd = (end == null || end.isEmpty() || node.key.compareToIgnoreCase(end) <= 0);

        if (withinStart && withinEnd) {
            result.addAll(node.items);
        }

        if (end != null && !end.isEmpty() && node.key.compareToIgnoreCase(end) < 0) {
            rangeTraversal(node.right, start, end, result);
        }
    }

    public synchronized void clear() {
        root = null;
        size = 0;
    }

    public int getHeight() {
        return height(root);
    }

    public int getSize() {
        return size;
    }
}
