#pragma once
#include <vector>
#include <string>
#include <unordered_map>
#include "../include/models.h"

namespace LostFound {

// Simple storage interface - handles all data operations
class Storage {
private:
    std::vector<User> users;
    std::vector<Item> items;
    std::vector<Match> matches;
    
    // Fast lookup indexes
    std::unordered_map<std::string, User*> email_index;
    std::unordered_map<int, Item*> item_index;
    
    std::string users_file;
    std::string items_file;
    std::string matches_file;
    
    // Next available IDs
    int next_user_id;
    int next_item_id;
    
public:
    Storage(const std::string& user_file, const std::string& item_file, const std::string& match_file);
    ~Storage() = default;
    
    // User operations
    bool addUser(const User& user);
    User* getUserByEmail(const std::string& email);
    std::vector<User> getAllUsers();
    
    // Item operations
    bool addItem(const Item& item);
    Item* getItemById(int id);
    std::vector<Item> getAllItems();
    bool updateItem(const Item& item);
    bool deleteItem(int id);
    std::vector<Item> getItemsByType(const std::string& type);
    
    // Match operations
    bool addMatch(const Match& match);
    std::vector<Match> getAllMatches();
    std::vector<Match> getMatchesForItem(int item_id);
    
    // File operations
    bool loadAll();
    bool saveAll();
    
    // ID generation
    int getNextUserId() { return next_user_id++; }
    int getNextItemId() { return next_item_id++; }
    
private:
    // Helper methods
    void buildIndexes();
    std::string serializeUser(const User& user);
    std::string serializeItem(const Item& item);
    std::string serializeMatch(const Match& match);
    
    User deserializeUser(const std::string& line);
    Item deserializeItem(const std::string& line);
    Match deserializeMatch(const std::string& line);
    
    // Utility
    std::vector<std::string> split(const std::string& s, char delimiter);
};

} // namespace LostFound
