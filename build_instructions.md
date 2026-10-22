# Build Instructions for Lost & Found System

## Windows Build Options

### Option 1: Visual Studio Build Tools (Recommended)
1. Download and install Visual Studio Build Tools from Microsoft
2. Run `build.bat` in the project directory
3. The program will be compiled to `bin/lostfound.exe`

### Option 2: MinGW-w64
1. Install MinGW-w64 from https://www.mingw-w64.org/
2. Add MinGW to your PATH
3. Run: `g++ -std=c++11 -Wall -Wextra -g -I./include -o bin/lostfound.exe src/main.cpp src/Storage.cpp src/Services.cpp src/Trie.cpp`

### Option 3: Online Compilers (Easiest)
If you don't want to install anything:

1. **OnlineGDB** (https://www.onlinegdb.com/)
   - Create new C++ project
   - Copy-paste all source files
   - Run online

2. **Replit** (https://replit.com/)
   - Create new C++ repl
   - Upload all files
   - Run online

3. **Compiler Explorer** (https://godbolt.org/)
   - For testing individual components

## Project Structure for Online Compilers
```
include/
  - models.h
  - Storage.h
  - Services.h
  - Trie.h

src/
  - main.cpp
  - Storage.cpp
  - Services.cpp
  - Trie.cpp

data/
  - users.txt (empty)
  - items.txt (empty)
  - matches.txt (empty)
```

## Running the Program
Once compiled, run the executable:
```bash
# On Windows
bin\lostfound.exe

# Or with build script
build.bat
```

## Demo Account
- Email: demo@example.com
- Password: demo

## Features to Test
1. User registration and login
2. Report lost/found items
3. Search with autocomplete (Trie)
4. View automatic matches
5. Fast lookups (Hash Tables)

## Troubleshooting
- If you get "compiler not found", install Visual Studio Build Tools
- If you get "file not found", make sure all files are in correct directories
- If you get linking errors, ensure all source files are compiled together

## What Makes This Project Special
- **Trie Data Structure**: O(m) autocomplete search
- **Hash Tables**: O(1) user/item lookups
- **Modular Design**: Clean separation of concerns
- **Smart Matching**: Jaccard similarity algorithm
- **Production Ready**: Scalable architecture for Android app
