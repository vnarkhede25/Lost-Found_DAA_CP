#include "../include/Storage.h"
#include <fstream>
#include <sstream>
#include <iostream>
#include <algorithm>

namespace LostFound {

// Constructor: Initialize storage with file paths
Storage::Storage(const std::string& user_file, const std::string& item_file, const std::string& match_file)
    : users_file(user_file), items_file(item_file), matches_file(match_file),
      next_user_id(1), next_item_id(1) {
    
    std::cout << "[Storage] Initializing with files: " << user_file << ", " << item_file << ", " << match_file << std::endl;
}

// Add a new user to storage
bool Storage::addUser(const User& user) {
    // Check if email already exists
    if (email_index.find(user.email) != email_index.end()) {
        std::cout << "[Storage] User with email " << user.email << " already exists" << std::endl;
        return false;
    }
    
    // Add user to vector and update index
    users.push_back(user);
    email_index[user.email] = &users.back();
    
    std::cout << "[Storage] Added user: " << user.username << " (" << user.email << ")" << std::endl;
    return true;
}

// Get user by email using hash table (O(1) lookup)
User* Storage::getUserByEmail(const std::string& email) {
    auto it = email_index.find(email);
    if (it != email_index.end()) {
        return it->second;
    }
    return nullptr;
}

// Add a new item to storage
bool Storage::addItem(const Item& item) {
    // Check if item ID already exists
    if (item_index.find(item.id) != item_index.end()) {
        std::cout << "[Storage] Item with ID " << item.id << " already exists" << std::endl;
        return false;
    }
    
    // Add item to vector and update index
    items.push_back(item);
    item_index[item.id] = &items.back();
    
    std::cout << "[Storage] Added item: " << item.name << " (ID: " << item.id << ")" << std::endl;
    return true;
}

// Get item by ID using hash table (O(1) lookup)
Item* Storage::getItemById(int id) {
    auto it = item_index.find(id);
    if (it != item_index.end()) {
        return it->second;
    }
    return nullptr;
}

// Get all items
std::vector<Item> Storage::getAllItems() {
    return items;
}

// Update an existing item
bool Storage::updateItem(const Item& item) {
    Item* existing = getItemById(item.id);
    if (!existing) {
        return false;
    }
    
    *existing = item;
    std::cout << "[Storage] Updated item: " << item.name << " (ID: " << item.id << ")" << std::endl;
    return true;
}

// Delete an item
bool Storage::deleteItem(int id) {
    // Find item in vector
    auto it = std::find_if(items.begin(), items.end(), [id](const Item& item) {
        return item.id == id;
    });
    
    if (it != items.end()) {
        // Remove from index
        item_index.erase(id);
        
        // Remove from vector
        items.erase(it);
        
        std::cout << "[Storage] Deleted item with ID: " << id << std::endl;
        return true;
    }
    
    return false;
}

// Get items by type (LOST or FOUND)
std::vector<Item> Storage::getItemsByType(const std::string& type) {
    std::vector<Item> result;
    for (const auto& item : items) {
        if (item.type == type) {
            result.push_back(item);
        }
    }
    return result;
}

// Add a match between lost and found items
bool Storage::addMatch(const Match& match) {
    matches.push_back(match);
    std::cout << "[Storage] Added match: Lost ID " << match.lost_item_id << " -> Found ID " << match.found_item_id 
              << " (Score: " << match.score << ")" << std::endl;
    return true;
}

// Get all matches
std::vector<Match> Storage::getAllMatches() {
    return matches;
}

// Get matches for a specific item
std::vector<Match> Storage::getMatchesForItem(int item_id) {
    std::vector<Match> result;
    for (const auto& match : matches) {
        if (match.lost_item_id == item_id || match.found_item_id == item_id) {
            result.push_back(match);
        }
    }
    return result;
}

// Load all data from files
bool Storage::loadAll() {
    std::cout << "[Storage] Loading data from files..." << std::endl;
    
    // Load users
    std::ifstream user_file(users_file);
    if (user_file.is_open()) {
        std::string line;
        while (std::getline(user_file, line)) {
            if (!line.empty()) {
                User user = deserializeUser(line);
                users.push_back(user);
            }
        }
        user_file.close();
    }
    
    // Load items
    std::ifstream item_file(items_file);
    if (item_file.is_open()) {
        std::string line;
        while (std::getline(item_file, line)) {
            if (!line.empty()) {
                Item item = deserializeItem(line);
                items.push_back(item);
            }
        }
        item_file.close();
    }
    
    // Load matches
    std::ifstream match_file(matches_file);
    if (match_file.is_open()) {
        std::string line;
        while (std::getline(match_file, line)) {
            if (!line.empty()) {
                Match match = deserializeMatch(line);
                matches.push_back(match);
            }
        }
        match_file.close();
    }
    
    // Build fast lookup indexes
    buildIndexes();
    
    // Update next IDs
    if (!users.empty()) {
        next_user_id = std::max_element(users.begin(), users.end(), 
            [](const User& a, const User& b) { return a.id < b.id; })->id + 1;
    }
    if (!items.empty()) {
        next_item_id = std::max_element(items.begin(), items.end(), 
            [](const Item& a, const Item& b) { return a.id < b.id; })->id + 1;
    }
    
    std::cout << "[Storage] Loaded " << users.size() << " users, " << items.size() << " items, " 
              << matches.size() << " matches" << std::endl;
    return true;
}

// Save all data to files
bool Storage::saveAll() {
    std::cout << "[Storage] Saving data to files..." << std::endl;
    
    // Save users
    std::ofstream user_file(users_file);
    if (user_file.is_open()) {
        for (const auto& user : users) {
            user_file << serializeUser(user) << std::endl;
        }
        user_file.close();
    }
    
    // Save items
    std::ofstream item_file(items_file);
    if (item_file.is_open()) {
        for (const auto& item : items) {
            item_file << serializeItem(item) << std::endl;
        }
        item_file.close();
    }
    
    // Save matches
    std::ofstream match_file(matches_file);
    if (match_file.is_open()) {
        for (const auto& match : matches) {
            match_file << serializeMatch(match) << std::endl;
        }
        match_file.close();
    }
    
    std::cout << "[Storage] Data saved successfully" << std::endl;
    return true;
}

// Build hash table indexes for fast lookups
void Storage::buildIndexes() {
    email_index.clear();
    item_index.clear();
    
    // Build email index
    for (auto& user : users) {
        email_index[user.email] = &user;
    }
    
    // Build item ID index
    for (auto& item : items) {
        item_index[item.id] = &item;
    }
    
    std::cout << "[Storage] Built indexes: " << email_index.size() << " emails, " 
              << item_index.size() << " items" << std::endl;
}

// Serialize user to string for file storage
std::string Storage::serializeUser(const User& user) {
    return std::to_string(user.id) + "|" + user.username + "|" + user.email + "|" + user.password;
}

// Serialize item to string for file storage
std::string Storage::serializeItem(const Item& item) {
    return std::to_string(item.id) + "|" + item.type + "|" + item.name + "|" + item.category + "|" +
           item.description + "|" + item.location + "|" + item.date + "|" + item.reporter_email + "|" +
           item.status + "|" + item.photo_url;
}

// Serialize match to string for file storage
std::string Storage::serializeMatch(const Match& match) {
    return std::to_string(match.lost_item_id) + "|" + std::to_string(match.found_item_id) + "|" +
           std::to_string(match.score) + "|" + match.date_created;
}

// Deserialize user from string
User Storage::deserializeUser(const std::string& line) {
    std::vector<std::string> parts = split(line, '|');
    User user;
    if (parts.size() >= 4) {
        user.id = std::stoi(parts[0]);
        user.username = parts[1];
        user.email = parts[2];
        user.password = parts[3];
    }
    return user;
}

// Deserialize item from string
Item Storage::deserializeItem(const std::string& line) {
    std::vector<std::string> parts = split(line, '|');
    Item item;
    if (parts.size() >= 10) {
        item.id = std::stoi(parts[0]);
        item.type = parts[1];
        item.name = parts[2];
        item.category = parts[3];
        item.description = parts[4];
        item.location = parts[5];
        item.date = parts[6];
        item.reporter_email = parts[7];
        item.status = parts[8];
        item.photo_url = parts[9];
    }
    return item;
}

// Deserialize match from string
Match Storage::deserializeMatch(const std::string& line) {
    std::vector<std::string> parts = split(line, '|');
    Match match;
    if (parts.size() >= 4) {
        match.lost_item_id = std::stoi(parts[0]);
        match.found_item_id = std::stoi(parts[1]);
        match.score = std::stod(parts[2]);
        match.date_created = parts[3];
    }
    return match;
}

// Utility: split string by delimiter
std::vector<std::string> Storage::split(const std::string& s, char delimiter) {
    std::vector<std::string> tokens;
    std::string token;
    std::istringstream tokenStream(s);
    while (std::getline(tokenStream, token, delimiter)) {
        tokens.push_back(token);
    }
    return tokens;
}

// Get all users
std::vector<User> Storage::getAllUsers() {
    return users;
}

} // namespace LostFound
