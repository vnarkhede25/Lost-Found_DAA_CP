#pragma once
#include <string>
#include <vector>
#include <unordered_map>
#include "../include/models.h"

namespace LostFound {

// Simple Trie node for autocomplete search
class TrieNode {
public:
    std::unordered_map<char, TrieNode*> children;
    std::vector<int> item_ids;  // Items that have this prefix
    bool is_end;
    
    TrieNode() : is_end(false) {}
    ~TrieNode() {
        for (auto& pair : children) {
            delete pair.second;
        }
    }
};

// Simple Trie implementation for search suggestions
class Trie {
private:
    TrieNode* root;
    
public:
    Trie() : root(new TrieNode()) {}
    ~Trie() { delete root; }
    
    // Insert text with item ID
    void insert(const std::string& text, int item_id);
    
    // Get suggestions for prefix
    std::vector<int> getSuggestions(const std::string& prefix);
    
    // Clear all data
    void clear();
    
private:
    // Helper: clean text (remove special chars, lowercase)
    std::string cleanText(const std::string& text);
    
    // Helper: traverse to node
    TrieNode* traverse(const std::string& prefix);
};

} // namespace LostFound
