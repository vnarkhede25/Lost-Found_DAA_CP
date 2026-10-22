# Makefile for Lost & Found System
# Simplified and Modular Advanced Data Structures Project

CXX = g++
CXXFLAGS = -std=c++11 -Wall -Wextra -g
INCLUDE = -I./include
SRCDIR = src
OBJDIR = obj
BINDIR = bin

# Source files
SOURCES = $(SRCDIR)/main.cpp $(SRCDIR)/Storage.cpp $(SRCDIR)/Services.cpp $(SRCDIR)/Trie.cpp $(SRCDIR)/AVLTree.cpp $(SRCDIR)/BinaryHeap.cpp $(SRCDIR)/QuadTree.cpp
OBJECTS = $(OBJDIR)/main.o $(OBJDIR)/Storage.o $(OBJDIR)/Services.o $(OBJDIR)/Trie.o $(OBJDIR)/AVLTree.o $(OBJDIR)/BinaryHeap.o $(OBJDIR)/QuadTree.o
TARGET = $(BINDIR)/lostfound

# Default target
all: directories $(TARGET)

# Create directories
directories:
	@mkdir -p $(OBJDIR) $(BINDIR)

# Build the executable
$(TARGET): $(OBJECTS)
	$(CXX) $(CXXFLAGS) $(INCLUDE) -o $@ $^

# Compile source files
$(OBJDIR)/main.o: $(SRCDIR)/main.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDE) -c $< -o $@

$(OBJDIR)/Storage.o: $(SRCDIR)/Storage.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDE) -c $< -o $@

$(OBJDIR)/Services.o: $(SRCDIR)/Services.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDE) -c $< -o $@

$(OBJDIR)/Trie.o: $(SRCDIR)/Trie.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDE) -c $< -o $@

$(OBJDIR)/AVLTree.o: $(SRCDIR)/AVLTree.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDE) -c $< -o $@

$(OBJDIR)/BinaryHeap.o: $(SRCDIR)/BinaryHeap.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDE) -c $< -o $@

$(OBJDIR)/QuadTree.o: $(SRCDIR)/QuadTree.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDE) -c $< -o $@

# Clean build files
clean:
	rm -rf $(OBJDIR) $(BINDIR)

# Run the program
run: $(TARGET)
	./$(TARGET)

# Install dependencies (placeholder)
install:
	@echo "No external dependencies required for this project"

# Help
help:
	@echo "Available targets:"
	@echo "  all      - Build the project"
	@echo "  clean    - Remove build files"
	@echo "  run      - Build and run the project"
	@echo "  install  - Install dependencies"
	@echo "  help     - Show this help message"

.PHONY: all directories clean run install help
