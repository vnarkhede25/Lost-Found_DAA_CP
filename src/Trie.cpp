#include "../include/Trie.h"
#include <algorithm>
#include <cctype>

namespace LostFound {

// Insert text with associated item ID into Trie
void Trie::insert(const std::string& text, int item_id) {
    std::string cleaned = cleanText(text);
    TrieNode* current = root;
    
    // Traverse/insert each character
    for (char c : cleaned) {
        if (current->children.find(c) == current->children.end()) {
            current->children[c] = new TrieNode();
        }
        current = current->children[c];
        
        // Add item ID to this prefix's suggestions
        if (std::find(current->item_ids.begin(), current->item_ids.end(), item_id) == current->item_ids.end()) {
            current->item_ids.push_back(item_id);
        }
    }
    
    current->is_end = true;
    
    std::cout << "[Trie] Inserted: '" << text << "' -> Item ID: " << item_id << std::endl;
}

// Get item IDs that match the given prefix
std::vector<int> Trie::getSuggestions(const std::string& prefix) {
    std::string cleaned = cleanText(prefix);
    TrieNode* node = traverse(cleaned);
    
    if (node == nullptr) {
        return std::vector<int>();
    }
    
    std::cout << "[Trie] Found " << node->item_ids.size() << " suggestions for prefix: '" << prefix << "'" << std::endl;
    return node->item_ids;
}

// Clear all data from Trie
void Trie::clear() {
    delete root;
    root = new TrieNode();
    std::cout << "[Trie] Cleared all data" << std::endl;
}

// Clean text: remove special characters and convert to lowercase
std::string Trie::cleanText(const std::string& text) {
    std::string cleaned;
    for (char c : text) {
        if (std::isalnum(static_cast<unsigned char>(c))) {
            cleaned += std::tolower(static_cast<unsigned char>(c));
        }
    }
    return cleaned;
}

// Traverse to the node representing the given prefix
TrieNode* Trie::traverse(const std::string& prefix) {
    TrieNode* current = root;
    
    for (char c : prefix) {
        if (current->children.find(c) == current->children.end()) {
            return nullptr; // Prefix not found
        }
        current = current->children[c];
    }
    
    return current;
}

} // namespace LostFound
