#include "../include/QuadTree.h"
#include <iostream>
#include <cmath>
#include <algorithm>

namespace LostFound {

QuadTree::QuadTree(double boundary_width, double boundary_height) 
    : max_items_per_node(4) {
    root = new QuadNode(Rectangle(0, 0, boundary_width, boundary_height), max_items_per_node);
    std::cout << "[QuadTree] Created with boundary: " << boundary_width << "x" << boundary_height << std::endl;
}

bool QuadTree::insert(Item* item) {
    if (item == nullptr) return false;
    
    std::pair<double, double> coords = locationToCoords(item->location);
    bool success = insert(root, item);
    
    if (success) {
        std::cout << "[QuadTree] Inserted item: " << item->name << " at (" 
                  << coords.first << ", " << coords.second << ")" << std::endl;
    }
    
    return success;
}

std::vector<Item*> QuadTree::findNearby(double x, double y, double radius) {
    std::vector<Item*> result;
    findNearby(root, x, y, radius, result);
    std::cout << "[QuadTree] Nearby search at (" << x << ", " << y << ") radius " 
              << radius << " found " << result.size() << " items" << std::endl;
    return result;
}

std::vector<Item*> QuadTree::findInRegion(const Rectangle& region) {
    std::vector<Item*> result;
    findInRegion(root, region, result);
    std::cout << "[QuadTree] Region search found " << result.size() << " items" << std::endl;
    return result;
}

std::vector<Item*> QuadTree::getAllItems() {
    std::vector<Item*> result;
    getAllItems(root, result);
    return result;
}

void QuadTree::clear() {
    delete root;
    root = new QuadNode(Rectangle(0, 0, 100, 100), max_items_per_node);
    std::cout << "[QuadTree] Cleared all items" << std::endl;
}

int QuadTree::getTotalItems() const {
    return getAllItems().size();
}

std::pair<double, double> QuadTree::locationToCoords(const std::string& location) {
    // Simple hash-based coordinate mapping
    // In real implementation, you'd use geocoding API
    double hash = 0.0;
    for (char c : location) {
        hash += static_cast<double>(c);
    }
    
    // Map hash to 0-100 range
    double x = std::fmod(hash * 7.3, 100.0);
    double y = std::fmod(hash * 13.7, 100.0);
    
    return std::make_pair(x, y);
}

bool QuadTree::insert(QuadNode* node, Item* item) {
    std::pair<double, double> coords = locationToCoords(item->location);
    
    if (!node->boundary.contains(coords.first, coords.second)) {
        return false;
    }
    
    if (node->items.size() < node->capacity && !node->divided) {
        node->items.push_back(item);
        return true;
    }
    
    if (!node->divided) {
        subdivide(node);
    }
    
    // Try to insert into children
    return insert(node->children[0], item) || // NE
           insert(node->children[1], item) || // NW  
           insert(node->children[2], item) || // SE
           insert(node->children[3], item);   // SW
}

void QuadTree::subdivide(QuadNode* node) {
    double x = node->boundary.x;
    double y = node->boundary.y;
    double w = node->boundary.width / 2.0;
    double h = node->boundary.height / 2.0;
    
    // Create quadrants
    node->children[0] = new QuadNode(Rectangle(x + w, y + h, w, h), max_items_per_node); // NE
    node->children[1] = new QuadNode(Rectangle(x, y + h, w, h), max_items_per_node);     // NW
    node->children[2] = new QuadNode(Rectangle(x + w, y, w, h), max_items_per_node);     // SE
    node->children[3] = new QuadNode(Rectangle(x, y, w, h), max_items_per_node);         // SW
    
    node->divided = true;
    
    // Reinsert existing items into children
    std::vector<Item*> items_to_reinsert = node->items;
    node->items.clear();
    
    for (Item* item : items_to_reinsert) {
        insert(node, item);
    }
}

void QuadTree::findNearby(QuadNode* node, double x, double y, double radius, std::vector<Item*>& result) {
    if (node == nullptr) return;
    
    // Check if node's boundary intersects with search circle
    double closest_x = std::max(node->boundary.x, std::min(x, node->boundary.x + node->boundary.width));
    double closest_y = std::max(node->boundary.y, std::min(y, node->boundary.y + node->boundary.height));
    double distance = std::sqrt(std::pow(closest_x - x, 2) + std::pow(closest_y - y, 2));
    
    if (distance > radius) {
        return; // Node is outside search radius
    }
    
    // Check items in this node
    for (Item* item : node->items) {
        std::pair<double, double> coords = locationToCoords(item->location);
        double item_distance = std::sqrt(std::pow(coords.first - x, 2) + std::pow(coords.second - y, 2));
        
        if (item_distance <= radius) {
            result.push_back(item);
        }
    }
    
    // Search children if divided
    if (node->divided) {
        for (int i = 0; i < 4; i++) {
            findNearby(node->children[i], x, y, radius, result);
        }
    }
}

void QuadTree::findInRegion(QuadNode* node, const Rectangle& region, std::vector<Item*>& result) {
    if (node == nullptr || !node->boundary.intersects(region)) {
        return;
    }
    
    // Check items in this node
    for (Item* item : node->items) {
        std::pair<double, double> coords = locationToCoords(item->location);
        if (region.contains(coords.first, coords.second)) {
            result.push_back(item);
        }
    }
    
    // Search children if divided
    if (node->divided) {
        for (int i = 0; i < 4; i++) {
            findInRegion(node->children[i], region, result);
        }
    }
}

void QuadTree::getAllItems(QuadNode* node, std::vector<Item*>& result) {
    if (node == nullptr) return;
    
    // Add items from this node
    result.insert(result.end(), node->items.begin(), node->items.end());
    
    // Search children if divided
    if (node->divided) {
        for (int i = 0; i < 4; i++) {
            getAllItems(node->children[i], result);
        }
    }
}

} // namespace LostFound
