# TrackBack | Lost & Found System (React + Spring Boot + TypeScript)

> **Advanced Data Structures & Algorithms Course Project**  
> An intelligent lost and found recovery platform featuring high-performance data structures: **Trie (Prefix Tree)**, **AVL Balanced Trees**, **Binary Max-Heap Priority Queue**, and **2D Spatial QuadTree**, packaged into a clean, modern dark-mode **React + TypeScript** interface and a **Spring Boot** REST backend.

---

## 🛠 Tech Stack Overview

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS Design System with Glassmorphism, Neon Accents, and Smooth Keyframe Animations
- **Icons & Effects**: [Lucide React](https://lucide.dev/), Canvas Confetti
- **Backend**: [Spring Boot 3.3.4](https://spring.io/projects/spring-boot), Java 21+ REST APIs
- **Build Tools**: Apache Maven 3.9+ & npm

---

## 🏗 Modular Architecture

```
lost-and-found/
├── backend/                              # Spring Boot REST API
│   ├── pom.xml                           # Maven dependencies (Web, Validation)
│   └── src/main/java/com/lostfound/
│       ├── LostFoundApplication.java     # Spring Boot application entry point
│       ├── config/WebCorsConfig.java     # CORS cross-origin configuration
│       ├── model/                        # Domain models (Item, Match, PriorityItem, User, DSStats)
│       ├── ds/                           # Core Advanced Data Structures
│       │   ├── Trie.java                 # Prefix tree for real-time autocomplete search
│       │   ├── AVLTree.java              # Self-balancing BST for date/location range search
│       │   ├── BinaryHeap.java           # Max-Heap for priority item scoring
│       │   └── QuadTree.java             # 2D Spatial quadtree for radius & coordinate search
│       ├── service/
│       │   ├── StorageService.java       # Seed data & in-memory item storage
│       │   └── LostFoundService.java     # Algorithmic orchestration & Jaccard matching
│       └── controller/
│           ├── ItemController.java       # CRUD REST endpoints (/api/items)
│           ├── SearchController.java     # Trie, AVL, & Quadtree endpoints (/api/search)
│           ├── MatchController.java      # Jaccard matching & claim endpoints (/api/matches)
│           ├── AuthController.java       # Registration & login (/api/auth)
│           └── ADSController.java        # Telemetry & index rebuild (/api/ads)
│
├── frontend/                             # React + TypeScript + Vite UI
│   ├── package.json                      # React, Lucide, Canvas-Confetti, Vite
│   ├── vite.config.ts                    # Reverse proxy to port 8080
│   └── src/
│       ├── types/index.ts                # TypeScript interface definitions
│       ├── api/client.ts                 # Full-featured API client with offline fallback
│       ├── index.css                     # Master design system (glassmorphism & tokens)
│       ├── components/
│       │   ├── Navbar.tsx                # Brand header, tab navigation & user switcher
│       │   ├── HeroSection.tsx           # Search banner with real-time Trie autocomplete
│       │   ├── ItemExplorer.tsx          # Filterable catalog with grid/list view & sorting
│       │   ├── SmartMatchmaker.tsx       # Jaccard confidence gauges & claim resolution
│       │   ├── QuadTreeRadar.tsx         # Interactive 2D campus radar & radius scanner
│       │   ├── ADSInspector.tsx          # Real-time algorithm observatory & heap rankings
│       │   ├── ReportModal.tsx           # Wizard modal for reporting lost/found items
│       │   └── ItemDetailModal.tsx       # Comprehensive detail drawer & item actions
│       └── App.tsx                       # Master application component
└── README.md
```

---

## ⚡ Data Structures & Algorithms

| Data Structure | Optimization Purpose | Time Complexity | Feature Implementation |
|---|---|---|---|
| **Trie (Prefix Tree)** | Search Autocomplete | **O(m)** | Real-time search predictions as you type item titles, categories, or keywords. |
| **AVL Balanced Tree** | Range & Sorted Queries | **O(log n + k)** | Date range filtering (`start` to `end`) and sorted displays with rotations. |
| **Binary Max-Heap** | Urgency & Priority Queue | **O(log n)** | Prioritizes recent items, lost items, and items with photos into top-10 rankings. |
| **Spatial QuadTree** | 2D Geolocation Search | **O(log n)** | Spatial subdivisions (NW, NE, SW, SE) for radius queries ("items near me"). |
| **Jaccard Similarity** | Smart Match Scoring | **O(v + w)** | Multi-factor matching between lost and found items (token overlap + proximity). |

---

## 🚀 Running the Application Locally

### 1. Start the Spring Boot Backend
```powershell
cd backend
mvn spring-boot:run
```
*The REST API will launch at `http://localhost:8080`.*

### 2. Start the React Frontend
```powershell
cd frontend
npm install
npm run dev
```
*The React UI will launch at `http://localhost:5173`.*

---

## 🎨 UI Features

1. **Attractive Dark Glassmorphism**: Deep slate palette, vibrant functional neon status indicators, and sleek typography (`Outfit` and `Plus Jakarta Sans`).
2. **Instant Trie Autocomplete**: Dropdown suggestions pop up with sub-millisecond response as you type in the search bar.
3. **Interactive 2D QuadTree Radar**: Click anywhere on the coordinate map or drag the radius slider to visualize real-time spatial partition querying.
4. **Automated Matchmaker & Confetti**: Side-by-side comparison of matching lost and found reports with confidence gauges and celebratory confetti when claimed.
5. **ADS Observatory**: Live telemetry dashboard detailing node counts, tree heights, heap orders, and index rebuild status.