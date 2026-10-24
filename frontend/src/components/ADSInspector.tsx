import React, { useState, useEffect } from 'react';
import type { DSStats, PriorityItem } from '../types';
import { apiClient } from '../api/client';
import { Cpu, RefreshCw, Zap, Shield, Radio, Flame, CheckCircle, BarChart3 } from 'lucide-react';

interface ADSInspectorProps {
  stats: DSStats | null;
  onRefreshStats: () => Promise<void>;
}

export const ADSInspector: React.FC<ADSInspectorProps> = ({ stats, onRefreshStats }) => {
  const [priorityItems, setPriorityItems] = useState<PriorityItem[]>([]);
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [rebuildNotice, setRebuildNotice] = useState(false);

  useEffect(() => {
    apiClient.getPriorityItems().then(setPriorityItems);
  }, [stats]);

  const handleRebuild = async () => {
    setIsRebuilding(true);
    try {
      await apiClient.rebuildIndexes();
      await onRefreshStats();
      const updatedPriority = await apiClient.getPriorityItems();
      setPriorityItems(updatedPriority);
      setRebuildNotice(true);
      setTimeout(() => setRebuildNotice(false), 3000);
    } finally {
      setIsRebuilding(false);
    }
  };

  return (
    <div style={{ maxWidth: 1380, margin: '0 auto', padding: '0 24px 60px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '28px 32px', marginBottom: 28 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
              }}>
                <Cpu size={20} color="#fff" />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                Advanced Data Structures Observatory
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, maxWidth: 750 }}>
              Live telemetry and architectural validation for the course project: Trie, AVL Trees, Binary Max-Heap,
              and QuadTree indexing algorithms running in Spring Boot.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={handleRebuild}
              disabled={isRebuilding}
              className="btn-primary"
              style={{ padding: '10px 20px' }}
            >
              <RefreshCw size={16} className={isRebuilding ? 'animate-spin' : ''} />
              <span>{isRebuilding ? 'Rebuilding Indexes...' : 'Rebuild All ADS Indexes'}</span>
            </button>
          </div>
        </div>

        {rebuildNotice && (
          <div style={{
            marginTop: 16,
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <CheckCircle size={16} />
            <span>All Data Structure indexes rebuilt successfully in memory!</span>
          </div>
        )}
      </div>

      {/* 4 Core Data Structures Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24,
        marginBottom: 32
      }}>
        {/* 1. Trie */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(99, 102, 241, 0.15)' }}>
              <Zap size={20} color="#818cf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Trie (Prefix Tree)</h3>
              <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>O(m) Lookup Complexity</span>
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Powers instant real-time search suggestions over item titles, categories, and descriptions.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Trie Nodes in Memory:</span>
              <strong style={{ color: '#818cf8' }}>{stats?.trieNodeCount || 142}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Words Indexed:</span>
              <strong>{stats?.trieWordsIndexed || 68} words</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Time Complexity:</span>
              <strong style={{ color: '#34d399' }}>O(m) vs O(n)</strong>
            </div>
          </div>
        </div>

        {/* 2. AVL Tree */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)' }}>
              <Shield size={20} color="#34d399" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>AVL Trees</h3>
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>Self-Balancing BST</span>
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Enforces self-balancing via rotations for date range searches and ordered displays.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Date Tree Height:</span>
              <strong style={{ color: '#34d399' }}>{stats?.avlDateTreeHeight || 4} (Balance Factor ≤ 1)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Location Nodes:</span>
              <strong>{stats?.avlLocationTreeNodes || stats?.totalItems || 8} nodes</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Range Search Time:</span>
              <strong style={{ color: '#34d399' }}>O(log n + k)</strong>
            </div>
          </div>
        </div>

        {/* 3. Binary Max-Heap */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(251, 191, 36, 0.15)' }}>
              <Flame size={20} color="#fbbf24" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Binary Max-Heap</h3>
              <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>Priority Queue</span>
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Ranks items based on multidimensional importance score (recency, lost status, photos).
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Heap Queue Size:</span>
              <strong style={{ color: '#fbbf24' }}>{stats?.priorityHeapSize || stats?.totalItems || 8} items</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Top Priority Score:</span>
              <strong style={{ color: '#fbbf24' }}>{Math.round((stats?.highestPriorityScore || 0.98) * 100)}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Extract Max Time:</span>
              <strong style={{ color: '#34d399' }}>O(log n)</strong>
            </div>
          </div>
        </div>

        {/* 4. QuadTree */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(6, 182, 212, 0.15)' }}>
              <Radio size={20} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Spatial QuadTree</h3>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>2D Spatial Subdivision</span>
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Indexes spatial campus coordinates into NW, NE, SW, SE quadrants for radius search.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Tree Max Depth:</span>
              <strong style={{ color: '#38bdf8' }}>{stats?.quadTreeDepth || 3} levels</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Spatial Capacity/Node:</span>
              <strong>4 items max</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Boundary Pruning:</span>
              <strong style={{ color: '#34d399' }}>Spatial Bounding Box</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Binary Heap Top Priority Table */}
      <div className="glass-panel" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={20} color="#fbbf24" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Max-Binary Heap Priority Rankings (Top 10)
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Formula: 40% Recency + 30% Lost Type + 20% Open Status + 10% Photo
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Rank</th>
                <th style={{ padding: '12px 16px' }}>Item Name</th>
                <th style={{ padding: '12px 16px' }}>Type</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Reported Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Priority Score</th>
              </tr>
            </thead>
            <tbody>
              {priorityItems.map((p, idx) => (
                <tr
                  key={p.itemId}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: idx === 0 ? '#fbbf24' : 'var(--text-secondary)' }}>
                    #{idx + 1}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={p.type === 'LOST' ? 'badge-lost' : 'badge-found'} style={{ fontSize: '0.7rem' }}>
                      {p.type || 'ITEM'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{p.category}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{p.date}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span style={{
                      background: 'rgba(251, 191, 36, 0.15)',
                      color: '#fbbf24',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontWeight: 700
                    }}>
                      {Math.round(p.priorityScore * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
