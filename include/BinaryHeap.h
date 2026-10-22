#pragma once
#include <vector>
#include <string>
#include "../include/models.h"

namespace LostFound {

// Priority item for heap operations
struct PriorityItem {
    int item_id;
    double priority_score;
    std::string item_name;
    std::string reporter_email;
    
    PriorityItem(int id, double score, const std::string& name, const std::string& email)
        : item_id(id), priority_score(score), item_name(name), reporter_email(email) {}
    
    // For max heap (higher priority = more important)
    bool operator<(const PriorityItem& other) const {
        return priority_score < other.priority_score;
    }
};

// Simplified Binary Heap for priority item processing
class BinaryHeap {
private:
    std::vector<PriorityItem> heap;
    bool is_max_heap; // true for max heap, false for min heap
    
public:
    BinaryHeap(bool max_heap = true);
    ~BinaryHeap() = default;
    
    // Core operations
    void insert(const PriorityItem& item);
    PriorityItem extractTop();
    PriorityItem peekTop() const;
    bool isEmpty() const;
    int getSize() const;
    void clear();
    
    // Utility
    std::vector<PriorityItem> getAllSorted();
    
private:
    // Heap operations
    void heapifyUp(int index);
    void heapifyDown(int index);
    int getParent(int index) { return (index - 1) / 2; }
    int getLeft(int index) { return 2 * index + 1; }
    int getRight(int index) { return 2 * index + 2; }
    void swap(int i, int j);
};

} // namespace LostFound
