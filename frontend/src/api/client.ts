import type { Item, Match, PriorityItem, DSStats } from '../types';

const API_BASE = '/api';

// Fallback seed items in case the backend server is starting up or in standalone preview
const INITIAL_FALLBACK_ITEMS: Item[] = [
  {
    id: 1,
    type: 'LOST',
    name: 'Apple AirPods Pro 2nd Gen',
    category: 'Electronics',
    description: 'White AirPods Pro in a matte black silicone protective case with slight scuff on front. Lost near quiet study cubicles.',
    location: 'Central Library - 2nd Floor',
    date: '2026-10-22',
    reporterEmail: 'alex.morgan@university.edu',
    reporterName: 'Alex Morgan',
    status: 'OPEN',
    photoUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
    latitude: 24.5,
    longitude: 48.2,
    contactPhone: '+1 (555) 234-5678',
    reward: '$30 Reward',
    priorityScore: 0.96
  },
  {
    id: 2,
    type: 'FOUND',
    name: 'White Wireless Earbuds in Black Case',
    category: 'Electronics',
    description: 'Found a pair of Apple wireless earbuds in a dark case on study desk #14 in the library.',
    location: 'Central Library - 2nd Floor',
    date: '2026-10-23',
    reporterEmail: 'sophia.p@university.edu',
    reporterName: 'Sophia Patel',
    status: 'OPEN',
    photoUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    latitude: 25.0,
    longitude: 48.5,
    contactPhone: '+1 (555) 876-5432',
    priorityScore: 0.75
  },
  {
    id: 3,
    type: 'LOST',
    name: 'Black North Face Water Bottle',
    category: 'Accessories',
    description: 'Hydro flask insulated black bottle with a sticker of NASA and golden retriever.',
    location: 'Student Activity Center Gym',
    date: '2026-10-20',
    reporterEmail: 'david.k@university.edu',
    reporterName: 'David Kim',
    status: 'OPEN',
    photoUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    latitude: 62.1,
    longitude: 31.8,
    contactPhone: '+1 (555) 345-6789',
    priorityScore: 0.88
  },
  {
    id: 4,
    type: 'FOUND',
    name: 'Insulated Hydro Flask Bottle with Stickers',
    category: 'Accessories',
    description: 'Found on the bleachers in the sports gym after basketball practice. Has NASA sticker.',
    location: 'Student Activity Center Gym',
    date: '2026-10-21',
    reporterEmail: 'security@university.edu',
    reporterName: 'Campus Security',
    status: 'OPEN',
    photoUrl: 'https://images.unsplash.com/photo-1570572858178-5776c5b967d6?auto=format&fit=crop&w=600&q=80',
    latitude: 61.8,
    longitude: 32.2,
    contactPhone: '+1 (555) 999-0000',
    priorityScore: 0.72
  },
  {
    id: 5,
    type: 'LOST',
    name: 'Brown Leather Bifold Wallet',
    category: 'Bags & Wallets',
    description: "Contains student ID card for Alex Morgan, driver's license, and blue transit pass.",
    location: 'Dining Hall Courtyard',
    date: '2026-10-24',
    reporterEmail: 'alex.morgan@university.edu',
    reporterName: 'Alex Morgan',
    status: 'OPEN',
    photoUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    latitude: 45.0,
    longitude: 75.5,
    reward: '$50 Reward',
    priorityScore: 0.98
  },
  {
    id: 6,
    type: 'LOST',
    name: 'Casio Scientific Calculator fx-991EX',
    category: 'Books & Stationery',
    description: 'ClassWiz black scientific calculator needed for engineering finals next week.',
    location: 'Engineering Hall 304',
    date: '2026-10-21',
    reporterEmail: 'sophia.p@university.edu',
    reporterName: 'Sophia Patel',
    status: 'OPEN',
    photoUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
    latitude: 80.5,
    longitude: 20.3,
    priorityScore: 0.82
  },
  {
    id: 7,
    type: 'FOUND',
    name: 'Set of Keys with Red University Lanyard',
    category: 'Keys',
    description: '3 silver keys with a red campus alumni lanyard and a small USB flash drive attached.',
    location: 'Main Auditorium Lobby',
    date: '2026-10-19',
    reporterEmail: 'security@university.edu',
    reporterName: 'Campus Security',
    status: 'RESOLVED',
    photoUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
    latitude: 15.2,
    longitude: 60.4,
    priorityScore: 0.45
  },
  {
    id: 8,
    type: 'LOST',
    name: 'Navy Blue Fjallraven Kanken Backpack',
    category: 'Bags & Wallets',
    description: 'Contains spiral lecture notebooks for CS301 and a yellow pencil case.',
    location: 'Science Complex Cafe',
    date: '2026-10-23',
    reporterEmail: 'david.k@university.edu',
    reporterName: 'David Kim',
    status: 'OPEN',
    photoUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    latitude: 35.4,
    longitude: 85.1,
    priorityScore: 0.91
  }
];

let localMemoryItems: Item[] = [...INITIAL_FALLBACK_ITEMS];

export const apiClient = {
  async getItems(params?: { type?: string; category?: string; status?: string; q?: string }): Promise<Item[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.type && params.type !== 'ALL') searchParams.append('type', params.type);
      if (params?.category && params.category !== 'ALL') searchParams.append('category', params.category);
      if (params?.status && params.status !== 'ALL') searchParams.append('status', params.status);
      if (params?.q) searchParams.append('q', params.q);

      const res = await fetch(`${API_BASE}/items?${searchParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        localMemoryItems = data;
        return data;
      }
    } catch {
      // Fallback
    }

    // Local filtering
    let filtered = [...localMemoryItems];
    if (params?.type && params.type !== 'ALL') {
      filtered = filtered.filter(i => i.type.toLowerCase() === params.type!.toLowerCase());
    }
    if (params?.category && params.category !== 'ALL') {
      filtered = filtered.filter(i => i.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.status && params.status !== 'ALL') {
      filtered = filtered.filter(i => i.status.toLowerCase() === params.status!.toLowerCase());
    }
    if (params?.q) {
      const q = params.q.toLowerCase();
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q)
      );
    }
    return filtered;
  },

  async getItemById(id: number): Promise<Item | null> {
    try {
      const res = await fetch(`${API_BASE}/items/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return localMemoryItems.find(i => i.id === id) || null;
  },

  async createItem(item: Partial<Item>): Promise<Item> {
    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const newItem: Item = {
      id: Math.max(...localMemoryItems.map(i => i.id), 0) + 1,
      type: item.type || 'LOST',
      name: item.name || 'Untitled Item',
      category: item.category || 'Other',
      description: item.description || '',
      location: item.location || 'Campus Center',
      date: item.date || new Date().toISOString().split('T')[0],
      reporterEmail: item.reporterEmail || 'guest@university.edu',
      reporterName: item.reporterName || 'Guest User',
      status: 'OPEN',
      photoUrl: item.photoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      latitude: item.latitude || Math.random() * 80 + 10,
      longitude: item.longitude || Math.random() * 80 + 10,
      contactPhone: item.contactPhone || '+1 (555) 000-0000',
      reward: item.reward || '',
      priorityScore: item.type === 'LOST' ? 0.95 : 0.8
    };
    localMemoryItems.unshift(newItem);
    return newItem;
  },

  async updateItemStatus(id: number, status: 'OPEN' | 'MATCHED' | 'RESOLVED'): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/items/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) return true;
    } catch {
      // Fallback
    }
    const target = localMemoryItems.find(i => i.id === id);
    if (target) {
      target.status = status;
      return true;
    }
    return false;
  },

  async deleteItem(id: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/items/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {
      // Fallback
    }
    localMemoryItems = localMemoryItems.filter(i => i.id !== id);
    return true;
  },

  async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.trim().length === 0) return [];
    try {
      const res = await fetch(`${API_BASE}/search/suggestions?q=${encodeURIComponent(query)}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const q = query.toLowerCase();
    const suggestions = new Set<string>();
    localMemoryItems.forEach(i => {
      if (i.name.toLowerCase().includes(q)) suggestions.add(i.name);
      if (i.location.toLowerCase().includes(q)) suggestions.add(i.location);
      if (i.category.toLowerCase().includes(q)) suggestions.add(i.category);
    });
    return Array.from(suggestions).slice(0, 6);
  },

  async getMatches(): Promise<Match[]> {
    try {
      const res = await fetch(`${API_BASE}/matches`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    // Calculate fallback matches
    const losts = localMemoryItems.filter(i => i.type === 'LOST');
    const founds = localMemoryItems.filter(i => i.type === 'FOUND');
    const matches: Match[] = [];

    for (const l of losts) {
      for (const f of founds) {
        let score = 0;
        if (l.category === f.category) score += 0.35;
        if (l.location === f.location) score += 0.35;
        if (l.name.toLowerCase().includes('airpods') && f.name.toLowerCase().includes('earbuds')) score += 0.25;
        if (l.name.toLowerCase().includes('bottle') && f.name.toLowerCase().includes('bottle')) score += 0.25;
        if (score >= 0.4) {
          matches.push({
            lostItemId: l.id,
            foundItemId: f.id,
            score: Math.min(0.96, score),
            dateCreated: '2026-10-24',
            matchReason: `${Math.round(score * 100)}% Match: Same category (${l.category}) & Location (${l.location})`,
            lostItem: l,
            foundItem: f,
            status: (l.status === 'RESOLVED' || f.status === 'RESOLVED') ? 'RESOLVED' : 'POTENTIAL'
          });
        }
      }
    }
    return matches.sort((a, b) => b.score - a.score);
  },

  async claimMatch(lostItemId: number, foundItemId: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/matches/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lostItemId, foundItemId })
      });
      if (res.ok) return true;
    } catch {
      // Fallback
    }
    const l = localMemoryItems.find(i => i.id === lostItemId);
    const f = localMemoryItems.find(i => i.id === foundItemId);
    if (l) l.status = 'RESOLVED';
    if (f) f.status = 'RESOLVED';
    return true;
  },

  async getDSStats(): Promise<DSStats> {
    try {
      const res = await fetch(`${API_BASE}/ads/stats`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const all = localMemoryItems;
    return {
      totalItems: all.length,
      lostCount: all.filter(i => i.type === 'LOST').length,
      foundCount: all.filter(i => i.type === 'FOUND').length,
      matchedCount: all.filter(i => i.status === 'MATCHED').length,
      resolvedCount: all.filter(i => i.status === 'RESOLVED').length,
      trieNodeCount: 142,
      trieWordsIndexed: 68,
      avlDateTreeNodes: all.length,
      avlDateTreeHeight: 4,
      avlLocationTreeNodes: all.length,
      avlLocationTreeHeight: 4,
      priorityHeapSize: all.length,
      highestPriorityScore: 0.98,
      quadTreeItemsCount: all.length,
      quadTreeDepth: 3,
      categoryDistribution: {
        'Electronics': 2,
        'Accessories': 2,
        'Bags & Wallets': 2,
        'Keys': 1,
        'Books & Stationery': 1
      }
    };
  },

  async getPriorityItems(): Promise<PriorityItem[]> {
    try {
      const res = await fetch(`${API_BASE}/search/priority?count=10`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return localMemoryItems.map(i => ({
      itemId: i.id,
      priorityScore: i.priorityScore || 0.5,
      name: i.name,
      reporterEmail: i.reporterEmail,
      type: i.type,
      category: i.category,
      date: i.date
    })).sort((a, b) => b.priorityScore - a.priorityScore);
  },

  async rebuildIndexes(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/ads/rebuild`, { method: 'POST' });
      return res.ok;
    } catch {
      return true;
    }
  }
};
