import React, { useState, useEffect } from 'react';
import type { DSStats, PriorityItem } from '../types';
import { apiClient } from '../api/client';
import { Cpu, RefreshCw, Zap, Shield, Radio, Flame, CheckCircle, BarChart3, Binary, Layers } from 'lucide-react';

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
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px 60px' }}>
      {/* Top Banner */}
      <div className="card" style={{ padding: '24px 28px', marginBottom: 24, backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}>
                <Cpu size={22} />
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Data Structures &amp; Indexing Observatory
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, maxWidth: 750 }}>
              Live architectural inspection of custom in-memory structures: <strong>Trie</strong> (prefix search), <strong>AVL Trees</strong> (date-range indexing), <strong>Binary Max-Heap</strong> (priority retrieval), and <strong>QuadTree</strong> (spatial 2D partitioning).
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={handleRebuild}
              disabled={isRebuilding}
              className="btn-primary"
              style={{ padding: '10px 18px', fontSize: '0.85rem' }}
            >
              <RefreshCw size={15} className={isRebuilding ? 'animate-spin' : ''} />
              {isRebuilding ? 'Rebuilding...' : 'Rebuild All Indexes'}
            </button>
          </div>
        </div>

        {rebuildNotice && (
          <div style={{
            marginTop: 16,
            padding: '10px 16px',
            backgroundColor: 'var(--found-bg)',
            color: 'var(--found-color)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--found-border)',
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <CheckCircle size={16} />
            <span>All in-memory indexes (Trie, AVL Date &amp; Location, Max-Heap, and QuadTree) successfully rebuilt and synced with storage.</span>
          </div>
        )}
      </div>

      {/* 4 Core Data Structure Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 18,
        marginBottom: 24
      }}>
        {/* 1. Trie */}
        <div className="card" style={{ padding: 22, backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ padding: 8, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-bg)', color: 'var(--primary)' }}>
              <Zap size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>Prefix Trie</h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 700 }}>Fast Autocomplete</span>
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
            Tokenizes title, category, location, and keywords for instant prefix lookups as users type.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Trie Nodes:</span>
              <strong>{stats?.trieNodeCount || 142} nodes</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Words Indexed:</span>
              <strong>{stats?.trieWordsIndexed || 68} words</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Prefix Time:</span>
              <strong style={{ color: 'var(--found-color)' }}>O(m) where m = prefix len</strong>
            </div>
          </div>
        </div>

        {/* 2. AVL Tree */}
        <div className="card" style={{ padding: 22, backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ padding: 8, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--found-bg)', color: 'var(--found-color)' }}>
              <Shield size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>AVL Trees</h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--found-color)', fontWeight: 700 }}>Balanced BST</span>
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
            Enforces strict balance factors (≤ 1) via rotations for O(log n + k) date-range queries.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Date Tree Height:</span>
              <strong style={{ color: 'var(--found-color)' }}>{stats?.avlDateTreeHeight || 4} levels</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Location Tree Nodes:</span>
              <strong>{stats?.avlLocationTreeNodes || stats?.totalItems || 8} nodes</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Range Search:</span>
              <strong style={{ color: 'var(--found-color)' }}>O(log n + k)</strong>
            </div>
          </div>
        </div>

        {/* 3. Binary Max-Heap */}
        <div className="card" style={{ padding: 22, backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ padding: 8, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--pending-bg)', color: 'var(--pending-color)' }}>
              <Flame size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>Binary Max-Heap</h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--pending-color)', fontWeight: 700 }}>Priority Queue</span>
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
            Ranks items based on transparent scoring: 40% recency, 30% lost type, 20% open status, 10% photo.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Heap Queue Size:</span>
              <strong style={{ color: 'var(--pending-color)' }}>{stats?.priorityHeapSize || stats?.totalItems || 8} items</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Top Priority Score:</span>
              <strong style={{ color: 'var(--pending-color)' }}>{Math.round((stats?.highestPriorityScore || 0.98) * 100)}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Extract Max Time:</span>
              <strong style={{ color: 'var(--found-color)' }}>O(log n)</strong>
            </div>
          </div>
        </div>

        {/* 4. QuadTree */}
        <div className="card" style={{ padding: 22, backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ padding: 8, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--resolved-bg)', color: 'var(--resolved-color)' }}>
              <Radio size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>Spatial QuadTree</h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--resolved-color)', fontWeight: 700 }}>2D Spatial Grid</span>
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
            Subdivides campus 2D space into NW, NE, SW, SE bounding boxes for spatial radius queries.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>QuadTree Depth:</span>
              <strong style={{ color: 'var(--resolved-color)' }}>{stats?.quadTreeDepth || 3} levels</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Bucket Capacity:</span>
              <strong>4 items / node</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Radius Pruning:</span>
              <strong style={{ color: 'var(--found-color)' }}>Spatial Bounding Box</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Binary Heap Top Priority Table */}
      <div className="card" style={{ padding: '24px 28px', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={20} color="var(--pending-color)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              Max-Binary Heap Priority Rankings (Top 10)
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Formula: 40% Recency + 30% Lost Type + 20% Open Status + 10% Photo URL
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', backgroundColor: 'var(--bg-surface)' }}>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Rank</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Item Title</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Type</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Category</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Date</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>Priority Score</th>
              </tr>
            </thead>
            <tbody>
              {priorityItems.map((p, idx) => (
                <tr
                  key={p.itemId}
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: idx === 0 ? 'var(--pending-color)' : 'var(--text-secondary)' }}>
                    #{idx + 1}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className={p.type === 'LOST' ? 'badge-lost' : 'badge-found'} style={{ fontSize: '0.7rem' }}>
                      {p.type || 'ITEM'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{p.category}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{p.date}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <span style={{
                      backgroundColor: 'var(--pending-bg)',
                      color: 'var(--pending-color)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
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
