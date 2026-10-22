#pragma once
#include <string>
#include <vector>
#include "../include/models.h"

namespace LostFound {

// Simple AVL Tree node for sorted operations
class AVLNode {
public:
    Item item;
    AVLNode* left;
    AVLNode* right;
    int height;
    
    AVLNode(const Item& it) : item(it), left(nullptr), right(nullptr), height(1) {}
    ~AVLNode() {
        delete left;
        delete right;
    }
};

// Simplified AVL Tree for sorted date/location queries
class AVLTree {
private:
    AVLNode* root;
    std::string sort_by; // "date" or "location"
    
public:
    AVLTree(const std::string& sort_field = "date");
    ~AVLTree() { delete root; }
    
    // Core operations
    void insert(const Item& item);
    std::vector<Item> getRange(const std::string& start, const std::string& end);
    std::vector<Item> getAllSorted();
    void clear();
    
private:
    // AVL operations
    AVLNode* insertNode(AVLNode* node, const Item& item);
    int getHeight(AVLNode* node);
    int getBalance(AVLNode* node);
    AVLNode* rightRotate(AVLNode* y);
    AVLNode* leftRotate(AVLNode* x);
    
    // Traversal helpers
    void inorderTraversal(AVLNode* node, std::vector<Item>& result);
    void rangeTraversal(AVLNode* node, const std::string& start, const std::string& end, std::vector<Item>& result);
    
    // Comparison helpers
    std::string getSortKey(const Item& item);
    bool compareKeys(const std::string& key1, const std::string& key2);
};

} // namespace LostFound
