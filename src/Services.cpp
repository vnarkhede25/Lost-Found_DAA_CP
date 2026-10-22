#include "../include/Services.h"
#include <iostream>
#include <algorithm>
#include <sstream>
#include <iomanip>
#include <set>

namespace LostFound {

// Constructor: Initialize services with storage
Services::Services(Storage* store) : storage(store), search_trie(new Trie()),
    date_tree(new AVLTree("date")), location_tree(new AVLTree("location")),
    priority_heap(new BinaryHeap(true)), spatial_tree(new QuadTree()) {
    std::cout << "[Services] Initializing with storage and all ADS" << std::endl;
    rebuildAllIndexes();
}

// Destructor: Clean up memory
Services::~Services() {
    delete search_trie;
    delete date_tree;
    delete location_tree;
    delete priority_heap;
    delete spatial_tree;
    std::cout << "[Services] Cleaned up all resources" << std::endl;
}

// Register a new user
bool Services::registerUser(const std::string& username, const std::string& email, const std::string& password) {
    std::cout << "[Services] Registering user: " << username << " (" << email << ")" << std::endl;
    
    // Check if user already exists
    if (storage->getUserByEmail(email) != nullptr) {
        std::cout << "[Services] Registration failed: Email already exists" << std::endl;
        return false;
    }
    
    // Create new user
    User user(storage->getNextUserId(), username, email, password);
    
    // Add to storage
    bool success = storage->addUser(user);
    if (success) {
        storage->saveAll();
        std::cout << "[Services] User registered successfully" << std::endl;
    }
    
    return success;
}

// Login user with email and password
User* Services::loginUser(const std::string& email, const std::string& password) {
    std::cout << "[Services] Login attempt for: " << email << std::endl;
    
    User* user = storage->getUserByEmail(email);
    if (user != nullptr && user->password == password) {
        std::cout << "[Services] Login successful for: " << email << std::endl;
        return user;
    }
    
    std::cout << "[Services] Login failed for: " << email << std::endl;
    return nullptr;
}

// Report a lost item
Item* Services::reportLostItem(const std::string& name, const std::string& category, 
                               const std::string& description, const std::string& location,
                               const std::string& date, const std::string& email, const std::string& photo_url) {
    std::cout << "[Services] Reporting lost item: " << name << std::endl;
    
    // Create new lost item
    Item item(storage->getNextItemId(), "LOST", name, category, description, 
              location, date, email, "OPEN", photo_url);
    
    // Add to storage
    if (storage->addItem(item)) {
        storage->saveAll();
        rebuildSearchIndex(); // Update search index
        
        // Try to find matches
        findMatches();
        
        return storage->getItemById(item.id);
    }
    
    return nullptr;
}

// Report a found item
Item* Services::reportFoundItem(const std::string& name, const std::string& description,
                                const std::string& location, const std::string& date,
                                const std::string& email, const std::string& photo_url) {
    std::cout << "[Services] Reporting found item: " << name << std::endl;
    
    // Create new found item
    Item item(storage->getNextItemId(), "FOUND", name, "", description, 
              location, date, email, "OPEN", photo_url);
    
    // Add to storage
    if (storage->addItem(item)) {
        storage->saveAll();
        rebuildSearchIndex(); // Update search index
        
        // Try to find matches
        findMatches();
        
        return storage->getItemById(item.id);
    }
    
    return nullptr;
}

// Search items by query using Trie
std::vector<Item> Services::searchItems(const std::string& query) {
    std::cout << "[Services] Searching items: '" << query << "'" << std::endl;
    
    std::vector<int> item_ids = search_trie->getSuggestions(query);
    std::vector<Item> results;
    
    for (int item_id : item_ids) {
        Item* item = storage->getItemById(item_id);
        if (item != nullptr) {
            results.push_back(*item);
        }
    }
    
    std::cout << "[Services] Found " << results.size() << " items" << std::endl;
    return results;
}

// Search items by location
std::vector<Item> Services::searchByLocation(const std::string& location) {
    std::cout << "[Services] Searching by location: '" << location << "'" << std::endl;
    
    std::vector<Item> all_items = storage->getAllItems();
    std::vector<Item> results;
    std::string loc_lower = toLower(location);
    
    for (const auto& item : all_items) {
        if (toLower(item.location).find(loc_lower) != std::string::npos) {
            results.push_back(item);
        }
    }
    
    std::cout << "[Services] Found " << results.size() << " items in location" << std::endl;
    return results;
}

// Get search suggestions for autocomplete
std::vector<int> Services::getSuggestions(const std::string& prefix) {
    return search_trie->getSuggestions(prefix);
}

// Find matches between lost and found items
std::vector<Match> Services::findMatches() {
    std::cout << "[Services] Finding matches..." << std::endl;
    
    std::vector<Item> lost_items = storage->getItemsByType("LOST");
    std::vector<Item> found_items = storage->getItemsByType("FOUND");
    std::vector<Match> new_matches;
    
    for (const auto& lost_item : lost_items) {
        if (lost_item.status != "OPEN") continue; // Only match open items
        
        for (const auto& found_item : found_items) {
            if (found_item.status != "OPEN") continue; // Only match open items
            
            double score = calculateMatchScore(lost_item, found_item);
            
            // If score is above threshold, create match
            if (score > 0.5) {
                // Get current date
                auto now = std::time(nullptr);
                auto tm = *std::localtime(&now);
                std::ostringstream oss;
                oss << std::put_time(&tm, "%Y-%m-%d %H:%M:%S");
                
                Match match(lost_item.id, found_item.id, score, oss.str());
                storage->addMatch(match);
                new_matches.push_back(match);
                
                std::cout << "[Services] Match found: " << lost_item.name << " <-> " 
                          << found_item.name << " (Score: " << score << ")" << std::endl;
            }
        }
    }
    
    if (!new_matches.empty()) {
        storage->saveAll();
    }
    
    std::cout << "[Services] Found " << new_matches.size() << " new matches" << std::endl;
    return new_matches;
}

// Get matches for a specific user
std::vector<Match> Services::getMatchesForUser(const std::string& email) {
    std::cout << "[Services] Getting matches for user: " << email << std::endl;
    
    std::vector<Match> all_matches = storage->getAllMatches();
    std::vector<Match> user_matches;
    
    for (const auto& match : all_matches) {
        Item* lost_item = storage->getItemById(match.lost_item_id);
        Item* found_item = storage->getItemById(match.found_item_id);
        
        if ((lost_item && lost_item->reporter_email == email) || 
            (found_item && found_item->reporter_email == email)) {
            user_matches.push_back(match);
        }
    }
    
    std::cout << "[Services] Found " << user_matches.size() << " matches for user" << std::endl;
    return user_matches;
}

// Update item status
bool Services::updateItemStatus(int item_id, const std::string& status) {
    std::cout << "[Services] Updating item " << item_id << " status to: " << status << std::endl;
    
    Item* item = storage->getItemById(item_id);
    if (item != nullptr) {
        item->status = status;
        storage->updateItem(*item);
        storage->saveAll();
        return true;
    }
    
    return false;
}

// Delete an item
bool Services::deleteItem(int item_id) {
    std::cout << "[Services] Deleting item: " << item_id << std::endl;
    
    if (storage->deleteItem(item_id)) {
        storage->saveAll();
        rebuildSearchIndex(); // Update search index
        return true;
    }
    
    return false;
}

// Get all items
std::vector<Item> Services::getAllItems() {
    return storage->getAllItems();
}

// Rebuild all data structure indexes
void Services::rebuildAllIndexes() {
    std::cout << "[Services] Rebuilding all ADS indexes..." << std::endl;
    
    std::vector<Item> items = storage->getAllItems();
    
    // Clear all indexes
    search_trie->clear();
    date_tree->clear();
    location_tree->clear();
    priority_heap->clear();
    spatial_tree->clear();
    
    // Rebuild all indexes
    for (const auto& item : items) {
        // Trie search index
        search_trie->insert(item.name, item.id);
        search_trie->insert(item.location, item.id);
        if (!item.category.empty()) {
            search_trie->insert(item.category, item.id);
        }
        
        std::vector<std::string> words = tokenize(item.description);
        for (const auto& word : words) {
            if (word.length() >= 3) {
                search_trie->insert(word, item.id);
            }
        }
        
        // AVL trees for sorted operations
        date_tree->insert(item);
        location_tree->insert(item);
        
        // Priority heap
        double priority = calculatePriorityScore(item);
        PriorityItem pitem(item.id, priority, item.name, item.reporter_email);
        priority_heap->insert(pitem);
        
        // Quad-tree for spatial indexing
        spatial_tree->insert(const_cast<Item*>(&item));
    }
    
    std::cout << "[Services] All indexes rebuilt with " << items.size() << " items" << std::endl;
}

// Rebuild the search index (Trie) - for backward compatibility
void Services::rebuildSearchIndex() {
    rebuildAllIndexes();
}

// Calculate match score between lost and found item
double Services::calculateMatchScore(const Item& lost_item, const Item& found_item) {
    double score = 0.0;
    
    // Name similarity (40% weight)
    std::vector<std::string> lost_words = tokenize(lost_item.name);
    std::vector<std::string> found_words = tokenize(found_item.name);
    double name_similarity = jaccardSimilarity(lost_words, found_words);
    score += name_similarity * 0.4;
    
    // Location similarity (30% weight)
    if (toLower(lost_item.location) == toLower(found_item.location)) {
        score += 0.3;
    } else if (toLower(lost_item.location).find(toLower(found_item.location)) != std::string::npos ||
               toLower(found_item.location).find(toLower(lost_item.location)) != std::string::npos) {
        score += 0.15; // Partial location match
    }
    
    // Category similarity (20% weight)
    if (!lost_item.category.empty() && !found_item.category.empty()) {
        if (toLower(lost_item.category) == toLower(found_item.category)) {
            score += 0.2;
        }
    }
    
    // Date proximity (10% weight)
    int date_diff = dateDifference(lost_item.date, found_item.date);
    if (date_diff <= 7) { // Within 7 days
        score += 0.1;
    } else if (date_diff <= 30) { // Within 30 days
        score += 0.05;
    }
    
    return std::min(score, 1.0); // Cap at 1.0
}

// Convert string to lowercase
std::string Services::toLower(const std::string& s) {
    std::string result = s;
    std::transform(result.begin(), result.end(), result.begin(), 
                   [](unsigned char c) { return std::tolower(c); });
    return result;
}

// Tokenize text into words
std::vector<std::string> Services::tokenize(const std::string& s) {
    std::vector<std::string> tokens;
    std::string token;
    
    for (char c : s) {
        if (std::isalnum(static_cast<unsigned char>(c))) {
            token += c;
        } else {
            if (!token.empty()) {
                tokens.push_back(toLower(token));
                token.clear();
            }
        }
    }
    
    if (!token.empty()) {
        tokens.push_back(toLower(token));
    }
    
    return tokens;
}

// Calculate Jaccard similarity between two token sets
double Services::jaccardSimilarity(const std::vector<std::string>& a, const std::vector<std::string>& b) {
    if (a.empty() || b.empty()) return 0.0;
    
    std::set<std::string> set_a(a.begin(), a.end());
    std::set<std::string> set_b(b.begin(), b.end());
    
    std::set<std::string> intersection;
    std::set_intersection(set_a.begin(), set_a.end(), set_b.begin(), set_b.end(),
                         std::inserter(intersection, intersection.begin()));
    
    std::set<std::string> union_set;
    std::set_union(set_a.begin(), set_a.end(), set_b.begin(), set_b.end(),
                   std::inserter(union_set, union_set.begin()));
    
    if (union_set.empty()) return 0.0;
    return static_cast<double>(intersection.size()) / union_set.size();
}

// Calculate difference in days between two dates (YYYY-MM-DD format)
int Services::dateDifference(const std::string& date1, const std::string& date2) {
    // Simple implementation - just parse year, month, day
    int y1 = 0, m1 = 0, d1 = 0;
    int y2 = 0, m2 = 0, d2 = 0;
    char dash;
    
    std::istringstream ss1(date1);
    ss1 >> y1 >> dash >> m1 >> dash >> d1;
    
    std::istringstream ss2(date2);
    ss2 >> y2 >> dash >> m2 >> dash >> d2;
    
    // Simple day calculation (not accounting for leap years, etc.)
    int days1 = y1 * 365 + m1 * 30 + d1;
    int days2 = y2 * 365 + m2 * 30 + d2;
    
    return std::abs(days1 - days2);
}

// Calculate priority score for items
double Services::calculatePriorityScore(const Item& item) {
    double score = 0.0;
    
    // Recent items get higher priority (40% weight)
    int days_old = dateDifference(item.date, "2024-01-01"); // Simple baseline
    double recency_score = std::max(0.0, 1.0 - (days_old / 365.0));
    score += recency_score * 0.4;
    
    // Lost items get higher priority than found items (30% weight)
    if (item.type == "LOST") {
        score += 0.3;
    }
    
    // Open status gets higher priority (20% weight)
    if (item.status == "OPEN") {
        score += 0.2;
    }
    
    // Items with photos get higher priority (10% weight)
    if (!item.photo_url.empty()) {
        score += 0.1;
    }
    
    return score;
}

// Advanced ADS service methods
std::vector<Item> Services::getItemsByDateRange(const std::string& start, const std::string& end) {
    std::cout << "[Services] Getting items in date range: " << start << " to " << end << std::endl;
    return date_tree->getRange(start, end);
}

std::vector<Item> Services::getItemsSortedByDate() {
    std::cout << "[Services] Getting items sorted by date" << std::endl;
    return date_tree->getAllSorted();
}

std::vector<Item> Services::getItemsSortedByLocation() {
    std::cout << "[Services] Getting items sorted by location" << std::endl;
    return location_tree->getAllSorted();
}

std::vector<PriorityItem> Services::getPriorityItems(int count) {
    std::cout << "[Services] Getting top " << count << " priority items" << std::endl;
    
    std::vector<PriorityItem> result;
    BinaryHeap temp_heap(false); // Min heap to get top items
    
    // Copy all items to temp heap
    std::vector<PriorityItem> all_items = priority_heap->getAllSorted();
    for (int i = 0; i < std::min(count, (int)all_items.size()); i++) {
        result.push_back(all_items[i]);
    }
    
    return result;
}

std::vector<Item> Services::findNearbyItems(const std::string& location, double radius) {
    std::cout << "[Services] Finding items near '" << location << "' within radius " << radius << std::endl;
    
    // Convert location string to coordinates (simple hash-based)
    double hash = 0.0;
    for (char c : location) {
        hash += static_cast<double>(c);
    }
    double x = std::fmod(hash * 7.3, 100.0);
    double y = std::fmod(hash * 13.7, 100.0);
    
    std::vector<Item*> nearby_ptrs = spatial_tree->findNearby(x, y, radius);
    std::vector<Item> result;
    
    for (Item* item_ptr : nearby_ptrs) {
        result.push_back(*item_ptr);
    }
    
    return result;
}

} // namespace LostFound
