#pragma once
#include <vector>
#include <string>
#include "../include/models.h"

namespace LostFound {

// Simple rectangle for spatial boundaries
struct Rectangle {
    double x, y;      // Bottom-left corner
    double width, height; // Dimensions
    
    Rectangle(double x_pos, double y_pos, double w, double h)
        : x(x_pos), y(y_pos), width(w), height(h) {}
    
    bool contains(double px, double py) const {
        return px >= x && px <= x + width && py >= y && py <= y + height;
    }
    
    bool intersects(const Rectangle& other) const {
        return !(x + width < other.x || other.x + other.width < x ||
                y + height < other.y || other.y + other.height < y);
    }
};

// Simplified Quad-tree node for spatial indexing
class QuadNode {
public:
    Rectangle boundary;
    std::vector<Item*> items;
    QuadNode* children[4]; // NE, NW, SE, SW
    bool divided;
    int capacity;
    
    QuadNode(const Rectangle& bounds, int cap = 4) 
        : boundary(bounds), divided(false), capacity(cap) {
        for (int i = 0; i < 4; i++) {
            children[i] = nullptr;
        }
    }
    
    ~QuadNode() {
        for (int i = 0; i < 4; i++) {
            delete children[i];
        }
    }
};

// Simplified Quad-tree for location-based queries
class QuadTree {
private:
    QuadNode* root;
    int max_items_per_node;
    
    // Simple coordinate mapping from location string
    std::pair<double, double> locationToCoords(const std::string& location);
    
public:
    QuadTree(double boundary_width = 100.0, double boundary_height = 100.0);
    ~QuadTree() { delete root; }
    
    // Core operations
    bool insert(Item* item);
    std::vector<Item*> findNearby(double x, double y, double radius);
    std::vector<Item*> findInRegion(const Rectangle& region);
    std::vector<Item*> getAllItems();
    void clear();
    
    // Utility
    int getTotalItems() const;
    
private:
    bool insert(QuadNode* node, Item* item);
    void subdivide(QuadNode* node);
    void findNearby(QuadNode* node, double x, double y, double radius, std::vector<Item*>& result);
    void findInRegion(QuadNode* node, const Rectangle& region, std::vector<Item*>& result);
    void getAllItems(QuadNode* node, std::vector<Item*>& result);
};

} // namespace LostFound
