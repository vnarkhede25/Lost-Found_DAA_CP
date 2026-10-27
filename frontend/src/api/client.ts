import type {
  Item, Match, Claim, AuditLog, AdminOverview,
  DAASearchBenchmark, DAAMergeSortResult, DAALcsResult, DAABipartiteResult
} from '../types';

const API_BASE = '/api';

export const apiClient = {
  // Items API
  async getItems(params?: { type?: string; category?: string; status?: string; q?: string; sortBy?: string }): Promise<Item[]> {
    const searchParams = new URLSearchParams();
    if (params?.type && params.type !== 'ALL') searchParams.append('type', params.type);
    if (params?.category && params.category !== 'ALL') searchParams.append('category', params.category);
    if (params?.status && params.status !== 'ALL') searchParams.append('status', params.status);
    if (params?.q) searchParams.append('q', params.q);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);

    try {
      const res = await fetch(`${API_BASE}/items?${searchParams.toString()}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend fetch failed, returning empty items array:', err);
    }
    return [];
  },

  async getItemById(id: number): Promise<Item | null> {
    try {
      const res = await fetch(`${API_BASE}/items/${id}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend fetch failed for item ID:', id, err);
    }
    return null;
  },

  async createItem(item: Partial<Item>): Promise<Item> {
    const res = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) {
      throw new Error('Failed to create item');
    }
    return await res.json();
  },

  async updateItem(id: number, item: Partial<Item>, actorEmail: string): Promise<Item> {
    const res = await fetch(`${API_BASE}/items/${id}?actorEmail=${encodeURIComponent(actorEmail)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update item');
    }
    return await res.json();
  },

  async withdrawItem(id: number, actorEmail: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/items/${id}/withdraw?actorEmail=${encodeURIComponent(actorEmail)}`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to withdraw item');
    }
    return true;
  },

  async deleteItem(id: number): Promise<boolean> {
    const res = await fetch(`${API_BASE}/items/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  async flagItem(id: number, reason: string, reporterEmail: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/items/${id}/flag?reporterEmail=${encodeURIComponent(reporterEmail)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return res.ok;
  },

  // Matches API
  async getMatches(): Promise<Match[]> {
    try {
      const res = await fetch(`${API_BASE}/matches`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend matches fetch failed:', err);
    }
    return [];
  },

  async getUserMatches(email: string): Promise<Match[]> {
    try {
      const res = await fetch(`${API_BASE}/matches/user/${encodeURIComponent(email)}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('User matches fetch failed:', err);
    }
    return [];
  },

  // Ownership Claims API
  async submitClaim(claim: {
    itemId: number;
    matchedItemId?: number;
    claimantEmail: string;
    claimantName: string;
    contactPhone?: string;
    descriptionProof: string;
    proofPhotoUrl?: string;
  }): Promise<Claim> {
    const res = await fetch(`${API_BASE}/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claim),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit ownership claim');
    }
    return await res.json();
  },

  async getMyClaims(email: string): Promise<Claim[]> {
    try {
      const res = await fetch(`${API_BASE}/claims/my?email=${encodeURIComponent(email)}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to fetch user claims:', err);
    }
    return [];
  },

  async getAllClaims(status?: string): Promise<Claim[]> {
    try {
      const url = status && status !== 'ALL' ? `${API_BASE}/claims?status=${encodeURIComponent(status)}` : `${API_BASE}/claims`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to fetch all claims:', err);
    }
    return [];
  },

  async reviewClaim(id: number, decision: 'APPROVED' | 'REJECTED', adminNotes: string, adminEmail: string): Promise<Claim> {
    const res = await fetch(`${API_BASE}/claims/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, adminNotes, adminEmail }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to review claim');
    }
    return await res.json();
  },

  async confirmHandover(id: number, handoverNotes: string, adminEmail: string): Promise<Claim> {
    const res = await fetch(`${API_BASE}/claims/${id}/handover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handoverNotes, adminEmail }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to confirm physical handover');
    }
    return await res.json();
  },

  // Admin Overview & Audit Logs
  async getAdminOverview(): Promise<AdminOverview> {
    try {
      const res = await fetch(`${API_BASE}/admin/overview`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to fetch admin overview:', err);
    }
    return {
      openLostCount: 0,
      openFoundCount: 0,
      claimPendingItemsCount: 0,
      returnedItemsCount: 0,
      pendingClaimsCount: 0,
      totalReports: 0,
      auditLogsCount: 0,
    };
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/audit-logs`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to fetch audit logs:', err);
    }
    return [];
  },

  // DAA Real Algorithm Benchmarks
  async getDAASearchBenchmark(q: string = 'library'): Promise<DAASearchBenchmark | null> {
    try {
      const res = await fetch(`${API_BASE}/daa/search-benchmark?q=${encodeURIComponent(q)}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to fetch search benchmark:', err);
    }
    return null;
  },

  async getDAAMergeSort(sortBy: string = 'date'): Promise<DAAMergeSortResult | null> {
    try {
      const res = await fetch(`${API_BASE}/daa/merge-sort?sortBy=${encodeURIComponent(sortBy)}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to fetch merge sort demo:', err);
    }
    return null;
  },

  async getDAALcsCompare(textA: string, textB: string): Promise<DAALcsResult | null> {
    try {
      const res = await fetch(`${API_BASE}/daa/lcs-compare?textA=${encodeURIComponent(textA)}&textB=${encodeURIComponent(textB)}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to fetch LCS comparison:', err);
    }
    return null;
  },

  async getDAABipartiteMatching(threshold: number = 0.40): Promise<DAABipartiteResult | null> {
    try {
      const res = await fetch(`${API_BASE}/daa/bipartite-matching?threshold=${threshold}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Failed to fetch bipartite matching:', err);
    }
    return null;
  },
};
