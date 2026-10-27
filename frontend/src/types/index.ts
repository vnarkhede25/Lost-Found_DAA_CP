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
  status: 'OPEN' | 'CLAIM_PENDING' | 'MATCHED' | 'RETURNED' | 'RESOLVED' | 'CLOSED';
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

export interface Claim {
  id: number;
  itemId: number;
  matchedItemId?: number;
  claimantEmail: string;
  claimantName: string;
  contactPhone?: string;
  descriptionProof: string;
  proofPhotoUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED_HANDED_OVER';
  adminNotes?: string;
  adminEmail?: string;
  createdAt: string;
  resolvedAt?: string;
  item?: Item;
  matchedItem?: Item;
}

export interface AuditLog {
  id: number;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: number;
  details: string;
  timestamp: string;
}

export interface AdminOverview {
  openLostCount: number;
  openFoundCount: number;
  claimPendingItemsCount: number;
  returnedItemsCount: number;
  pendingClaimsCount: number;
  totalReports: number;
  auditLogsCount: number;
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
  categoryDistribution?: Record<string, number>;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
}

export interface DAASearchBenchmark {
  syllabusUnit: string;
  query: string;
  datasetSize: number;
  linearSearch: {
    name: string;
    matchesFound: number;
    comparisons: number;
    durationNanos: number;
    durationMicros: number;
    complexity: Record<string, string>;
  };
  indexedSearch: {
    name: string;
    matchesFound: number;
    comparisons: number;
    durationNanos: number;
    durationMicros: number;
    complexity: Record<string, string>;
  };
  speedupFactor: string;
}

export interface DAAMergeSortResult {
  syllabusUnit: string;
  algorithm: string;
  sortBy: string;
  elementCount: number;
  comparisons: number;
  elapsedMicros: number;
  theoreticalAnalysis: Record<string, string>;
  sortedSample: Array<{
    id: number;
    name: string;
    date: string;
    priorityScore: number;
  }>;
}

export interface DAALcsResult {
  syllabusUnit: string;
  concept: string;
  textA: string;
  textB: string;
  normalizedA: string;
  normalizedB: string;
  lcsLength: number;
  reconstructedSubsequence: string;
  characterSimilarityRatio: string;
  tokenLcsSimilarityRatio: string;
  theoreticalAnalysis: Record<string, string>;
}

export interface DAABipartiteResult {
  syllabusUnit: string;
  concept: string;
  activeLostItemsCount: number;
  activeFoundItemsCount: number;
  candidateEdgesAboveThreshold: number;
  maxPairsCardinality: number;
  matchedPairs: Array<{
    lostItemId: number;
    lostItemName: string;
    foundItemId: number;
    foundItemName: string;
    similarityScore: number;
    confidencePercent: string;
  }>;
  theoreticalAnalysis: Record<string, string>;
}
