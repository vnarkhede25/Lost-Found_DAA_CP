#pragma once
#include <vector>
#include <string>
#include "../include/models.h"
#include "../include/Trie.h"
#include "../include/AVLTree.h"
#include "../include/BinaryHeap.h"
#include "../include/QuadTree.h"
#include "../include/Storage.h"

namespace LostFound {

// Business logic layer - handles all operations
class Services {
private:
    Storage* storage;
    Trie* search_trie;
    AVLTree* date_tree;
    AVLTree* location_tree;
    BinaryHeap* priority_heap;
    QuadTree* spatial_tree;
    
public:
    Services(Storage* store);
    ~Services();
    
    // User services
    bool registerUser(const std::string& username, const std::string& email, const std::string& password);
    User* loginUser(const std::string& email, const std::string& password);
    
    // Item services
    Item* reportLostItem(const std::string& name, const std::string& category, 
                        const std::string& description, const std::string& location,
                        const std::string& date, const std::string& email, const std::string& photo_url);
    
    Item* reportFoundItem(const std::string& name, const std::string& description,
                         const std::string& location, const std::string& date,
                         const std::string& email, const std::string& photo_url);
    
    // Search services
    std::vector<Item> searchItems(const std::string& query);
    std::vector<Item> searchByLocation(const std::string& location);
    std::vector<int> getSuggestions(const std::string& prefix);
    
    // Advanced ADS services
    std::vector<Item> getItemsByDateRange(const std::string& start, const std::string& end);
    std::vector<Item> getItemsSortedByDate();
    std::vector<Item> getItemsSortedByLocation();
    std::vector<PriorityItem> getPriorityItems(int count = 10);
    std::vector<Item> findNearbyItems(const std::string& location, double radius = 10.0);
    
    // Matching services
    std::vector<Match> findMatches();
    std::vector<Match> getMatchesForUser(const std::string& email);
    
    // Admin services
    bool updateItemStatus(int item_id, const std::string& status);
    bool deleteItem(int item_id);
    std::vector<Item> getAllItems();
    
    // Utility
    void rebuildSearchIndex();
    void rebuildAllIndexes();
    
private:
    // Matching algorithm
    double calculateMatchScore(const Item& lost_item, const Item& found_item);
    
    // Text processing
    std::string toLower(const std::string& s);
    std::vector<std::string> tokenize(const std::string& s);
    double jaccardSimilarity(const std::vector<std::string>& a, const std::vector<std::string>& b);
    
    // Date utilities
    int dateDifference(const std::string& date1, const std::string& date2);
    
    // Priority scoring
    double calculatePriorityScore(const Item& item);
};

} // namespace LostFound
