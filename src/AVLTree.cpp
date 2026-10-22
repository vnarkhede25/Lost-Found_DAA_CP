#include "../include/AVLTree.h"
#include <algorithm>
#include <iostream>

namespace LostFound {

AVLTree::AVLTree(const std::string& sort_field) : root(nullptr), sort_by(sort_field) {
    std::cout << "[AVLTree] Created for sorting by: " << sort_field << std::endl;
}

void AVLTree::insert(const Item& item) {
    root = insertNode(root, item);
    std::cout << "[AVLTree] Inserted item: " << item.name << " (sorted by " << sort_by << ")" << std::endl;
}

std::vector<Item> AVLTree::getAllSorted() {
    std::vector<Item> result;
    inorderTraversal(root, result);
    return result;
}

std::vector<Item> AVLTree::getRange(const std::string& start, const std::string& end) {
    std::vector<Item> result;
    rangeTraversal(root, start, end, result);
    std::cout << "[AVLTree] Range query '" << start << "' to '" << end << "' found " << result.size() << " items" << std::endl;
    return result;
}

void AVLTree::clear() {
    delete root;
    root = nullptr;
    std::cout << "[AVLTree] Cleared all items" << std::endl;
}

AVLNode* AVLTree::insertNode(AVLNode* node, const Item& item) {
    if (node == nullptr) {
        return new AVLNode(item);
    }
    
    std::string item_key = getSortKey(item);
    std::string node_key = getSortKey(node->item);
    
    if (compareKeys(item_key, node_key)) {
        node->left = insertNode(node->left, item);
    } else {
        node->right = insertNode(node->right, item);
    }
    
    // Update height
    node->height = 1 + std::max(getHeight(node->left), getHeight(node->right));
    
    // Get balance factor
    int balance = getBalance(node);
    
    // Balance the tree if needed
    if (balance > 1 && compareKeys(item_key, getSortKey(node->left->item))) {
        return rightRotate(node);
    }
    
    if (balance < -1 && compareKeys(getSortKey(node->right->item), item_key)) {
        return leftRotate(node);
    }
    
    if (balance > 1 && compareKeys(getSortKey(node->left->item), item_key)) {
        node->left = leftRotate(node->left);
        return rightRotate(node);
    }
    
    if (balance < -1 && compareKeys(item_key, getSortKey(node->right->item))) {
        node->right = rightRotate(node->right);
        return leftRotate(node);
    }
    
    return node;
}

int AVLTree::getHeight(AVLNode* node) {
    if (node == nullptr) return 0;
    return node->height;
}

int AVLTree::getBalance(AVLNode* node) {
    if (node == nullptr) return 0;
    return getHeight(node->left) - getHeight(node->right);
}

AVLNode* AVLTree::rightRotate(AVLNode* y) {
    AVLNode* x = y->left;
    AVLNode* T2 = x->right;
    
    x->right = y;
    y->left = T2;
    
    y->height = 1 + std::max(getHeight(y->left), getHeight(y->right));
    x->height = 1 + std::max(getHeight(x->left), getHeight(x->right));
    
    return x;
}

AVLNode* AVLTree::leftRotate(AVLNode* x) {
    AVLNode* y = x->right;
    AVLNode* T2 = y->left;
    
    y->left = x;
    x->right = T2;
    
    x->height = 1 + std::max(getHeight(x->left), getHeight(x->right));
    y->height = 1 + std::max(getHeight(y->left), getHeight(y->right));
    
    return y;
}

void AVLTree::inorderTraversal(AVLNode* node, std::vector<Item>& result) {
    if (node == nullptr) return;
    
    inorderTraversal(node->left, result);
    result.push_back(node->item);
    inorderTraversal(node->right, result);
}

void AVLTree::rangeTraversal(AVLNode* node, const std::string& start, const std::string& end, std::vector<Item>& result) {
    if (node == nullptr) return;
    
    std::string node_key = getSortKey(node->item);
    
    if (compareKeys(start, node_key)) {
        rangeTraversal(node->left, start, end, result);
    }
    
    if (compareKeys(start, node_key) && compareKeys(node_key, end)) {
        result.push_back(node->item);
    }
    
    if (compareKeys(node_key, end)) {
        rangeTraversal(node->right, start, end, result);
    }
}

std::string AVLTree::getSortKey(const Item& item) {
    if (sort_by == "date") {
        return item.date;
    } else if (sort_by == "location") {
        return item.location;
    } else {
        return item.name; // default fallback
    }
}

bool AVLTree::compareKeys(const std::string& key1, const std::string& key2) {
    return key1 < key2; // Simple string comparison
}

} // namespace LostFound
