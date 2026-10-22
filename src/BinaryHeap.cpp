#include "../include/BinaryHeap.h"
#include <algorithm>
#include <iostream>

namespace LostFound {

BinaryHeap::BinaryHeap(bool max_heap) : is_max_heap(max_heap) {
    std::cout << "[BinaryHeap] Created " << (max_heap ? "MAX" : "MIN") << " heap" << std::endl;
}

void BinaryHeap::insert(const PriorityItem& item) {
    heap.push_back(item);
    heapifyUp(heap.size() - 1);
    std::cout << "[BinaryHeap] Inserted: " << item.item_name << " (Priority: " << item.priority_score << ")" << std::endl;
}

PriorityItem BinaryHeap::extractTop() {
    if (heap.empty()) {
        throw std::runtime_error("Heap is empty");
    }
    
    PriorityItem top = heap[0];
    heap[0] = heap.back();
    heap.pop_back();
    
    if (!heap.empty()) {
        heapifyDown(0);
    }
    
    std::cout << "[BinaryHeap] Extracted: " << top.item_name << " (Priority: " << top.priority_score << ")" << std::endl;
    return top;
}

PriorityItem BinaryHeap::peekTop() const {
    if (heap.empty()) {
        throw std::runtime_error("Heap is empty");
    }
    return heap[0];
}

bool BinaryHeap::isEmpty() const {
    return heap.empty();
}

int BinaryHeap::getSize() const {
    return heap.size();
}

void BinaryHeap::clear() {
    heap.clear();
    std::cout << "[BinaryHeap] Cleared all items" << std::endl;
}

std::vector<PriorityItem> BinaryHeap::getAllSorted() {
    std::vector<PriorityItem> result = heap;
    
    if (is_max_heap) {
        // Sort in descending order (highest priority first)
        std::sort(result.begin(), result.end(), std::greater<PriorityItem>());
    } else {
        // Sort in ascending order (lowest priority first)
        std::sort(result.begin(), result.end());
    }
    
    return result;
}

void BinaryHeap::heapifyUp(int index) {
    while (index > 0) {
        int parent = getParent(index);
        
        bool should_swap = is_max_heap ? 
            heap[index].priority_score > heap[parent].priority_score :
            heap[index].priority_score < heap[parent].priority_score;
        
        if (should_swap) {
            swap(index, parent);
            index = parent;
        } else {
            break;
        }
    }
}

void BinaryHeap::heapifyDown(int index) {
    int size = heap.size();
    
    while (true) {
        int left = getLeft(index);
        int right = getRight(index);
        int extreme = index;
        
        if (is_max_heap) {
            // Max heap: find largest
            if (left < size && heap[left].priority_score > heap[extreme].priority_score) {
                extreme = left;
            }
            if (right < size && heap[right].priority_score > heap[extreme].priority_score) {
                extreme = right;
            }
        } else {
            // Min heap: find smallest
            if (left < size && heap[left].priority_score < heap[extreme].priority_score) {
                extreme = left;
            }
            if (right < size && heap[right].priority_score < heap[extreme].priority_score) {
                extreme = right;
            }
        }
        
        if (extreme != index) {
            swap(index, extreme);
            index = extreme;
        } else {
            break;
        }
    }
}

void BinaryHeap::swap(int i, int j) {
    std::swap(heap[i], heap[j]);
}

} // namespace LostFound
