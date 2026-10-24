export interface Item {
  id: number;
  type: 'LOST' | 'FOUND';
  name: string;
  category: string;
  description: string;
  location: string;
  date: string;
  reporterEmail: string;
  reporterName?: string;
  status: 'OPEN' | 'MATCHED' | 'RESOLVED';
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
  reward?: string;
  priorityScore?: number;
}

export interface Match {
  lostItemId: number;
  foundItemId: number;
  score: number;
  matchReason?: string;
  dateCreated: string;
  status?: string;
  lostItem?: Item;
  foundItem?: Item;
}

export interface PriorityItem {
  itemId: number;
  priorityScore: number;
  name: string;
  reporterEmail: string;
  type?: string;
  category?: string;
  date?: string;
}

export interface DSStats {
  totalItems: number;
  lostCount: number;
  foundCount: number;
  matchedCount: number;
  resolvedCount: number;
  trieNodeCount: number;
  trieWordsIndexed: number;
  avlDateTreeNodes: number;
  avlDateTreeHeight: number;
  avlLocationTreeNodes: number;
  avlLocationTreeHeight: number;
  priorityHeapSize: number;
  highestPriorityScore: number;
  quadTreeItemsCount: number;
  quadTreeDepth: number;
  categoryDistribution?: Record<string, number>;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}
