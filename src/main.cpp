#include "../include/Services.h"
#include "../include/Storage.h"
#include <iostream>
#include <limits>
#include <iomanip>

using namespace LostFound;

// Simple utility functions
void clearScreen() {
    #ifdef _WIN32
        system("cls");
    #else
        system("clear");
    #endif
}

void printHeader() {
    std::cout << "\n" << std::string(60, '=') << "\n";
    std::cout << "           LOST & FOUND SYSTEM (Advanced DS)\n";
    std::cout << std::string(60, '=') << "\n\n";
}

void printItemTableHeader() {
    std::cout << std::left << std::setw(5) << "ID" 
              << std::setw(8) << "TYPE" 
              << std::setw(20) << "NAME"
              << std::setw(15) << "CATEGORY"
              << std::setw(25) << "LOCATION" 
              << std::setw(12) << "DATE" 
              << std::setw(10) << "STATUS" << "\n";
    std::cout << std::string(95, '-') << "\n";
}

void printItem(const Item& item) {
    std::cout << std::left << std::setw(5) << item.id 
              << std::setw(8) << item.type 
              << std::setw(20) << item.name
              << std::setw(15) << item.category
              << std::setw(25) << item.location 
              << std::setw(12) << item.date 
              << std::setw(10) << item.status << "\n";
}

void printMatchesTableHeader() {
    std::cout << std::left << std::setw(8) << "LOST ID" 
              << std::setw(20) << "LOST ITEM"
              << std::setw(8) << "FOUND ID"
              << std::setw(20) << "FOUND ITEM"
              << std::setw(10) << "SCORE"
              << std::setw(20) << "DATE" << "\n";
    std::cout << std::string(86, '-') << "\n";
}

void printMatch(const Match& match, Storage& storage) {
    Item* lost = storage.getItemById(match.lost_item_id);
    Item* found = storage.getItemById(match.found_item_id);
    
    std::cout << std::left << std::setw(8) << match.lost_item_id 
              << std::setw(20) << (lost ? lost->name : "Unknown")
              << std::setw(8) << match.found_item_id
              << std::setw(20) << (found ? found->name : "Unknown")
              << std::setw(10) << std::fixed << std::setprecision(2) << match.score
              << std::setw(20) << match.date_created << "\n";
}

// ADS Demo Functions
void showDateRangeSearch(Services& services) {
    clearScreen();
    printHeader();
    std::cout << "DATE RANGE SEARCH (AVL Tree)\n\n";
    
    std::string start = getStringInput("Enter start date (YYYY-MM-DD): ");
    std::string end = getStringInput("Enter end date (YYYY-MM-DD): ");
    
    std::vector<Item> results = services.getItemsByDateRange(start, end);
    
    if (results.empty()) {
        std::cout << "No items found in date range.\n";
    } else {
        std::cout << "Found " << results.size() << " items:\n\n";
        printItemTableHeader();
        for (const auto& item : results) {
            printItem(item);
        }
    }
    
    std::cout << "\nPress Enter to continue...";
    std::cin.ignore();
}

void showItemsSortedByDate(Services& services) {
    clearScreen();
    printHeader();
    std::cout << "ITEMS SORTED BY DATE (AVL Tree)\n\n";
    
    std::vector<Item> results = services.getItemsSortedByDate();
    
    if (results.empty()) {
        std::cout << "No items found.\n";
    } else {
        std::cout << "Total items: " << results.size() << "\n\n";
        printItemTableHeader();
        for (const auto& item : results) {
            printItem(item);
        }
    }
    
    std::cout << "\nPress Enter to continue...";
    std::cin.ignore();
}

void showItemsSortedByLocation(Services& services) {
    clearScreen();
    printHeader();
    std::cout << "ITEMS SORTED BY LOCATION (AVL Tree)\n\n";
    
    std::vector<Item> results = services.getItemsSortedByLocation();
    
    if (results.empty()) {
        std::cout << "No items found.\n";
    } else {
        std::cout << "Total items: " << results.size() << "\n\n";
        printItemTableHeader();
        for (const auto& item : results) {
            printItem(item);
        }
    }
    
    std::cout << "\nPress Enter to continue...";
    std::cin.ignore();
}

void showPriorityItems(Services& services) {
    clearScreen();
    printHeader();
    std::cout << "PRIORITY ITEMS (Binary Heap)\n\n";
    
    std::vector<PriorityItem> priority_items = services.getPriorityItems(10);
    
    if (priority_items.empty()) {
        std::cout << "No priority items found.\n";
    } else {
        std::cout << "Top " << priority_items.size() << " priority items:\n\n";
        std::cout << std::left << std::setw(8) << "ID" 
                  << std::setw(20) << "NAME"
                  << std::setw(25) << "EMAIL"
                  << std::setw(10) << "PRIORITY" << "\n";
        std::cout << std::string(63, '-') << "\n";
        
        for (const auto& pitem : priority_items) {
            std::cout << std::left << std::setw(8) << pitem.item_id 
                      << std::setw(20) << pitem.item_name
                      << std::setw(25) << pitem.reporter_email
                      << std::setw(10) << std::fixed << std::setprecision(2) << pitem.priority_score << "\n";
        }
    }
    
    std::cout << "\nPress Enter to continue...";
    std::cin.ignore();
}

void showNearbyItems(Services& services) {
    clearScreen();
    printHeader();
    std::cout << "NEARBY ITEMS (Quad-tree)\n\n";
    
    std::string location = getStringInput("Enter location: ");
    std::string radius_str = getStringInput("Enter radius (default 10.0): ");
    double radius = radius_str.empty() ? 10.0 : std::stod(radius_str);
    
    std::vector<Item> results = services.findNearbyItems(location, radius);
    
    if (results.empty()) {
        std::cout << "No nearby items found.\n";
    } else {
        std::cout << "Found " << results.size() << " items near '" << location << "':\n\n";
        printItemTableHeader();
        for (const auto& item : results) {
            printItem(item);
        }
    }
    
    std::cout << "\nPress Enter to continue...";
    std::cin.ignore();
}

// Get string input from user
std::string getStringInput(const std::string& prompt) {
    std::string input;
    std::cout << prompt;
    std::getline(std::cin, input);
    return input;
}

// Get date input from user
std::string getDateInput(const std::string& prompt) {
    std::string date;
    std::cout << prompt << " (YYYY-MM-DD): ";
    std::getline(std::cin, date);
    return date;
}

// Show user registration
void showRegistration(Services& services) {
    clearScreen();
    printHeader();
    std::cout << "USER REGISTRATION\n\n";
    
    std::string username = getStringInput("Enter username: ");
    std::string email = getStringInput("Enter email: ");
    std::string password = getStringInput("Enter password: ");
    
    if (services.registerUser(username, email, password)) {
        std::cout << "\nRegistration successful!\n";
    } else {
        std::cout << "\nRegistration failed! Email might already exist.\n";
    }
    
    std::cout << "\nPress Enter to continue...";
    std::cin.ignore();
}

// Show user login
User* showLogin(Services& services) {
    clearScreen();
    printHeader();
    std::cout << "USER LOGIN\n\n";
    
    std::string email = getStringInput("Enter email: ");
    std::string password = getStringInput("Enter password: ");
    
    User* user = services.loginUser(email, password);
    
    if (user) {
        std::cout << "\nLogin successful! Welcome, " << user->username << "!\n";
    } else {
        std::cout << "\nLogin failed! Invalid email or password.\n";
    }
    
    std::cout << "\nPress Enter to continue...";
    std::cin.ignore();
    
    return user;
}

// Show report lost item
void showReportLostItem(Services& services, const std::string& email) {
    clearScreen();
    printHeader();
    std::cout << "REPORT LOST ITEM\n\n";
    
    std::string name = getStringInput("Enter item name: ");
    std::string category = getStringInput("Enter category (Wallet/Mobile/Keys/Documents/Other): ");
    std::string description = getStringInput("Enter description: ");
    std::string location = getStringInput("Enter location: ");
    std::string date = getDateInput("Enter date when item was lost");
    std::string photo_url = getStringInput("Enter photo URL (optional): ");
    
    Item* item = services.reportLostItem(name, category, description, location, date, email, photo_url);
    
    if (item) {
        std::cout << "\nItem reported successfully! Item ID: " << item->id << "\n";
    } else {
        std::cout << "\nFailed to report item.\n";
    }
    
    std::cout << "\nPress Enter to continue...";
    std::cin.ignore();
}

// Show report found item
void showReportFoundItem(Services& services, const std::string& email) {
    clearScreen();
    printHeader();
    std::cout << "REPORT FOUND ITEM\n\n";
    
    std::string name = getStringInput("Enter item name: ");
    std::string description = getStringInput("Enter description: ");
    std::string location = getStringInput("Enter location where item was found: ");
    std::string date = getDateInput("Enter date when item was found");
    std::string photo_url = getStringInput("Enter photo URL (optional): ");
    
    Item* item = services.reportFoundItem(name, description, location, date, email, photo_url);
    
    if (item) {
        std::cout << "\nItem reported successfully! Item ID: " << item->id << "\n";
    } else {
        std::cout << "\nFailed to report item.\n";
    }
    
    std::cout << "\nPress Enter to continue...";
    std::cin.ignore();
}

// Show search items
void showSearchItems(Services& services) {
    clearScreen();
    printHeader();
    std::cout << "SEARCH ITEMS\n\n";
    
    std::string query = getStringInput("Enter search query: ");
    std::vector<Item> results = services.searchItems(query);
    
    if (results.empty()) {
        std::cout << "No items found matching your search.\n";
    } else {
        std::cout << "Found " << results.size() << " items:\n\n";
        printItemTableHeader();
        for (const auto& item : results) {
            printItem(item);
        }
    }
    
    std::cout << "\nPress Enter to continue...";
    std::cin.ignore();
}

// Show all items
void showAllItems(Services& services) {
    clearScreen();
    printHeader();
    std::cout << "ALL ITEMS\n\n";
    
    std::vector<Item> items = services.getAllItems();
    
    if (items.empty()) {
        std::cout << "No items in the system.\n";
    } else {
        std::cout << "Total items: " << items.size() << "\n\n";
        printItemTableHeader();
        for (const auto& item : items) {
            printItem(item);
        }
    }
    
    std::cout << "\nPress Enter to continue...";
    std::cin.ignore();
}

// Show matches
void showMatches(Services& services, Storage& storage, const std::string& email) {
    clearScreen();
    printHeader();
    std::cout << "YOUR MATCHES\n\n";
    
    std::vector<Match> matches = services.getMatchesForUser(email);
    
    if (matches.empty()) {
        std::cout << "No matches found for your items.\n";
    } else {
        std::cout << "Found " << matches.size() << " matches:\n\n";
        printMatchesTableHeader();
        for (const auto& match : matches) {
            printMatch(match, storage);
        }
    }
    
    std::cout << "\nPress Enter to continue...";
    std::cin.ignore();
}

// Main menu
void showMainMenu(Services& services, Storage& storage, User* user) {
    while (true) {
        clearScreen();
        printHeader();
        
        if (user) {
            std::cout << "Logged in as: " << user->username << " (" << user->email << ")\n\n";
            std::cout << "=== BASIC FEATURES ===\n";
            std::cout << "1. Report Lost Item\n";
            std::cout << "2. Report Found Item\n";
            std::cout << "3. Search Items (Trie)\n";
            std::cout << "4. View All Items\n";
            std::cout << "5. View My Matches\n";
            std::cout << "\n=== ADVANCED DATA STRUCTURES ===\n";
            std::cout << "6. Date Range Search (AVL Tree)\n";
            std::cout << "7. Items Sorted by Date (AVL Tree)\n";
            std::cout << "8. Items Sorted by Location (AVL Tree)\n";
            std::cout << "9. Priority Items (Binary Heap)\n";
            std::cout << "10. Nearby Items (Quad-tree)\n";
            std::cout << "\n=== SYSTEM ===\n";
            std::cout << "11. Logout\n";
            std::cout << "12. Exit\n";
        } else {
            std::cout << "1. Register\n";
            std::cout << "2. Login\n";
            std::cout << "3. Search Items (Guest)\n";
            std::cout << "4. View All Items (Guest)\n";
            std::cout << "5. Exit\n";
        }
        
        std::cout << "\nEnter your choice: ";
        
        int choice;
        std::cin >> choice;
        std::cin.ignore(); // Clear newline
        
        if (user) {
            switch (choice) {
                case 1:
                    showReportLostItem(services, user->email);
                    break;
                case 2:
                    showReportFoundItem(services, user->email);
                    break;
                case 3:
                    showSearchItems(services);
                    break;
                case 4:
                    showAllItems(services);
                    break;
                case 5:
                    showMatches(services, storage, user->email);
                    break;
                case 6:
                    showDateRangeSearch(services);
                    break;
                case 7:
                    showItemsSortedByDate(services);
                    break;
                case 8:
                    showItemsSortedByLocation(services);
                    break;
                case 9:
                    showPriorityItems(services);
                    break;
                case 10:
                    showNearbyItems(services);
                    break;
                case 11:
                    user = nullptr;
                    std::cout << "Logged out successfully!\n";
                    std::cout << "Press Enter to continue...";
                    std::cin.ignore();
                    break;
                case 12:
                    return;
                default:
                    std::cout << "Invalid choice! Press Enter to continue...";
                    std::cin.ignore();
                    break;
            }
        } else {
            switch (choice) {
                case 1:
                    showRegistration(services);
                    break;
                case 2:
                    user = showLogin(services);
                    break;
                case 3:
                    showSearchItems(services);
                    break;
                case 4:
                    showAllItems(services);
                    break;
                case 5:
                    return;
                default:
                    std::cout << "Invalid choice! Press Enter to continue...";
                    std::cin.ignore();
                    break;
            }
        }
    }
}

int main() {
    std::cout << "Starting Lost & Found System...\n";
    
    // Initialize storage with data files
    Storage storage("data/users.txt", "data/items.txt", "data/matches.txt");
    
    // Load existing data
    if (!storage.loadAll()) {
        std::cout << "Warning: Could not load data files. Starting fresh.\n";
    }
    
    // Initialize services
    Services services(&storage);
    
    std::cout << "System initialized successfully!\n";
    
    // Create demo user if no users exist
    if (storage.getAllUsers().empty()) {
        std::cout << "Creating demo user...\n";
        services.registerUser("demo", "demo@example.com", "demo");
        std::cout << "Demo user created: demo@example.com / demo\n";
    }
    
    // Start main menu
    User* current_user = nullptr;
    showMainMenu(services, storage, current_user);
    
    std::cout << "\nThank you for using Lost & Found System!\n";
    return 0;
}
