# CampusFind — Real-World College Lost & Found Platform

A production-ready full-stack college Lost & Found web platform engineered for students and campus security administrators, integrated with core algorithmic principles from the **Design and Analysis of Algorithms (DAA)** curriculum.

---

## 🏛️ Architecture & Tech Stack

The application is completely built with a modern full-stack web architecture:
- **Backend**: Java 21, Spring Boot 3.3.4, REST APIs, Maven
- **Frontend**: TypeScript, React 19, Vite, Tailwind/Vanilla CSS
- **Data Persistence**: JSON-based persistent storage (`users.json`, `items.json`, `claims.json`, `audit_logs.json`) with secure password hashing (BCrypt)

```
lost-and-found/
├── backend/                  # Java 21 & Spring Boot REST API
│   ├── src/main/java/com/lostfound/
│   │   ├── controller/      # REST API endpoints (Items, Claims, DAA, Admin, Auth)
│   │   ├── daa/             # Exact DAA Syllabus Implementations
│   │   ├── model/           # Data models (Item, Claim, User, AuditLog, etc.)
│   │   └── service/         # Business logic, matching, and storage
│   ├── src/test/java/       # Comprehensive JUnit 5 Test Suite (15 passing tests)
│   └── pom.xml              # Maven dependencies & build config
│
├── frontend/                 # React 19 & TypeScript SPA
│   ├── src/
│   │   ├── api/             # Typed API clients for backend integration
│   │   ├── components/      # UI components (Explorer, Admin, Claims, DAA Inspector)
│   │   ├── types/           # Domain TypeScript definitions
│   │   └── index.css        # Professional titanium/slate design system
│   ├── package.json         # Frontend dependencies (React, Lucide icons, Vite)
│   └── vite.config.ts       # Vite proxy & build config
│
└── data/                     # Persistent JSON storage
```

---

## 🧠 DAA Course Syllabus Implementations

CampusFind directly demonstrates four exact concepts from the DAA syllabus:

### 1. Unit I: Asymptotic Analysis & Searching (`SearchBenchmark.java`)
- **Real-World Problem**: Fast campus catalog item filtering by category and keywords.
- **Algorithms Compared**:
  - Linear Search baseline: $\Theta(n)$ worst-case time complexity.
  - In-memory Indexed Hash Lookup: $\Theta(1 + k)$ average-case retrieval where $k$ is result set size.
- **Empirical Benchmarking**: Built-in microsecond timer demonstrating orders of magnitude speedups as catalog scales.

### 2. Unit II: Divide & Conquer — Merge Sort (`MergeSort.java`)
- **Real-World Problem**: Deterministic, stable ordering of campus listings by reporting date, item name, or resolution status.
- **Recurrence Relation**:
  $$T(n) = 2T(n/2) + \Theta(n) \implies \Theta(n \log n)$$
- **Properties**: Stable sort preserving order of equally-dated items; tracks exact comparison count during recursion.

### 3. Unit III: Dynamic Programming — Longest Common Subsequence (`LcsDynamicProgramming.java`)
- **Real-World Problem**: Semantic similarity matching between lost descriptions and found listings (e.g., student reports *"Navy blue Dell XPS laptop in library"* and finder reports *"Dell laptop blue color at reading desk"*).
- **Recurrence Formulation**:
  $$c[i,j] = \begin{cases} 0 & \text{if } i=0 \text{ or } j=0 \\ c[i-1,j-1] + 1 & \text{if } X[i-1] = Y[j-1] \\ \max(c[i-1,j], c[i,j-1]) & \text{otherwise} \end{cases}$$
- **Implementations**:
  - Full $O(m \times n)$ 2D matrix dynamic programming table with traceback for UI visualization.
  - Memory-optimized 2-row rolling array using $O(\min(m, n))$ space.

### 4. Unit V: Network Flows — Maximum Bipartite Matching (`BipartiteMatching.java`)
- **Real-World Problem**: Globally optimal, conflict-free 1-to-1 matching between the set of reported Lost Items ($U$) and Found Items ($V$).
- **Methodology**: Augmented path DFS search (specialization of Ford-Fulkerson on unit networks).
- **Guarantee**: Guarantees no single found item is concurrently paired to multiple lost claims, maximizing total campus recoveries in $O(V \cdot E)$ time.

---

## 🚀 Running the Application

### 1. Start the Java Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
*The REST API will start at `http://localhost:8080`.*

### 2. Run the Automated Test Suite
```bash
cd backend
mvn test
```
*Runs all 15 JUnit unit tests verifying DAA algorithm correctness, edge cases, and claim state transitions.*

### 3. Start the TypeScript & React Frontend
```bash
cd frontend
npm install
npm run dev
```
*The client application will start at `http://localhost:5173`.*

---

## 🔒 Security & Admin Workflows
- **Secret Evidence Claims**: Students claiming found items must provide secret identifying marks (engravings, wallpaper, serial tags).
- **Physical Handover Desk**: Security administrators verify physical IDs before completing claims.
- **Audit Logging**: Immutable tracking of reports, claims, approvals, and withdrawals.