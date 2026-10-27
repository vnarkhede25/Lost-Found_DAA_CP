import React, { useState, useEffect } from 'react';
import {
  Binary, GitMerge, FileCode, Network, RefreshCw,
  Zap, Clock, CheckCircle2, ArrowRight, ShieldAlert, Cpu
} from 'lucide-react';
import type {
  DAASearchBenchmark, DAAMergeSortResult, DAALcsResult, DAABipartiteResult
} from '../types';
import { apiClient } from '../api/client';

export const DAAInspector: React.FC = () => {
  const [activeConcept, setActiveConcept] = useState<'search' | 'mergeSort' | 'lcs' | 'bipartite'>('lcs');

  // Concept 1: Search Benchmark
  const [searchQuery, setSearchQuery] = useState('library');
  const [searchResult, setSearchResult] = useState<DAASearchBenchmark | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Concept 2: Merge Sort
  const [sortField, setSortField] = useState('date');
  const [sortResult, setSortResult] = useState<DAAMergeSortResult | null>(null);
  const [sortLoading, setSortLoading] = useState(false);

  // Concept 3: LCS Dynamic Programming
  const [lcsTextA, setLcsTextA] = useState('Apple AirPods Pro 2nd Gen white case in library');
  const [lcsTextB, setLcsTextB] = useState('White wireless earbuds in black case found on library desk');
  const [lcsResult, setLcsResult] = useState<DAALcsResult | null>(null);
  const [lcsLoading, setLcsLoading] = useState(false);

  // Concept 4: Bipartite Matching
  const [threshold, setThreshold] = useState(0.40);
  const [bipartiteResult, setBipartiteResult] = useState<DAABipartiteResult | null>(null);
  const [bipartiteLoading, setBipartiteLoading] = useState(false);

  useEffect(() => {
    runSearchBenchmark();
    runMergeSortDemo();
    runLcsComparison();
    runBipartiteMatching();
  }, []);

  const runSearchBenchmark = async () => {
    setSearchLoading(true);
    try {
      const res = await apiClient.getDAASearchBenchmark(searchQuery);
      setSearchResult(res);
    } finally {
      setSearchLoading(false);
    }
  };

  const runMergeSortDemo = async () => {
    setSortLoading(true);
    try {
      const res = await apiClient.getDAAMergeSort(sortField);
      setSortResult(res);
    } finally {
      setSortLoading(false);
    }
  };

  const runLcsComparison = async () => {
    setLcsLoading(true);
    try {
      const res = await apiClient.getDAALcs(lcsTextA, lcsTextB);
      setLcsResult(res);
    } finally {
      setLcsLoading(false);
    }
  };

  const runBipartiteMatching = async () => {
    setBipartiteLoading(true);
    try {
      const res = await apiClient.getDAABipartiteMatching(threshold);
      setBipartiteResult(res);
    } finally {
      setBipartiteLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px 60px' }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '24px 28px', marginBottom: 24, backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Cpu size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              DAA Course Syllabus Inspector
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              Live interactive verification of four exact concepts from the Design &amp; Analysis of Algorithms curriculum.
            </p>
          </div>
        </div>

        {/* 4 Concept Tab Selectors */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          {[
            { id: 'lcs', label: 'Unit III: Dynamic Programming (LCS)', icon: <FileCode size={16} /> },
            { id: 'mergeSort', label: 'Unit II: Divide & Conquer (MergeSort)', icon: <GitMerge size={16} /> },
            { id: 'bipartite', label: 'Unit V: Network Flows (Bipartite)', icon: <Network size={16} /> },
            { id: 'search', label: 'Unit I: Complexity & Searching', icon: <Binary size={16} /> }
          ].map(tab => {
            const isActive = activeConcept === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveConcept(tab.id as any)}
                className={isActive ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.84rem', padding: '8px 16px' }}
              >
                {tab.icon} {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Concept 1: LCS */}
      {activeConcept === 'lcs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>
              Description Similarity via Longest Common Subsequence
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
              Computes semantic match between student reports using the classic DP recurrence:
              <code style={{ marginLeft: 8, padding: '2px 6px', background: 'var(--bg-surface)', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
                c[i,j] = c[i-1,j-1] + 1 if X[i] == Y[j] else max(c[i-1,j], c[i,j-1])
              </code>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 16 }}>
              <div>
                <label className="form-label">Lost Item Description (String X)</label>
                <input
                  type="text"
                  value={lcsTextA}
                  onChange={(e) => setLcsTextA(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Found Item Description (String Y)</label>
                <input
                  type="text"
                  value={lcsTextB}
                  onChange={(e) => setLcsTextB(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <button
              onClick={runLcsComparison}
              disabled={lcsLoading}
              className="btn-primary"
            >
              <RefreshCw size={14} /> Calculate DP Matrix &amp; Subsequence
            </button>
          </div>

          {lcsResult && (
            <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                <div style={{ padding: 14, backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>LCS Token Length</span>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>{lcsResult.lcsLength} tokens</strong>
                </div>
                <div style={{ padding: 14, backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Semantic Similarity</span>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--found-color)' }}>{Math.round(lcsResult.similarityScore * 100)}%</strong>
                </div>
                <div style={{ padding: 14, backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Optimized Space Bound</span>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>O(min(m, n))</strong>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <strong style={{ fontSize: '0.86rem', display: 'block', marginBottom: 6 }}>Subsequence Traceback:</strong>
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.88rem',
                  color: 'var(--primary)'
                }}>
                  "{lcsResult.lcsSequence}"
                </div>
              </div>

              {/* 2D Matrix Table */}
              {lcsResult.dpMatrix && lcsResult.dpMatrix.length > 0 && (
                <div>
                  <strong style={{ fontSize: '0.86rem', display: 'block', marginBottom: 8 }}>
                    Dynamic Programming Matrix c[i,j] (First {Math.min(lcsResult.dpMatrix.length, 10)} Tokens):
                  </strong>
                  <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                      <tbody>
                        {lcsResult.dpMatrix.slice(0, 10).map((row, rIdx) => (
                          <tr key={rIdx} style={{ backgroundColor: rIdx === 0 ? 'var(--bg-surface)' : '#ffffff' }}>
                            {row.slice(0, 12).map((cell, cIdx) => (
                              <td key={cIdx} style={{ padding: '6px 10px', border: '1px solid var(--border-subtle)' }}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Concept 2: MergeSort */}
      {activeConcept === 'mergeSort' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>
              Divide &amp; Conquer: Stable Merge Sort
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
              Recursively partitions catalog into halves and merges sorted sub-arrays. Satisfies the recurrence:
              <code style={{ marginLeft: 8, padding: '2px 6px', background: 'var(--bg-surface)', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
                T(n) = 2T(n/2) + Θ(n) ⟹ Θ(n log n)
              </code>
            </p>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="form-input"
                style={{ width: 'auto' }}
              >
                <option value="date">Sort by Incident Date</option>
                <option value="name">Sort by Item Name</option>
                <option value="status">Sort by Status</option>
              </select>

              <button
                onClick={runMergeSortDemo}
                disabled={sortLoading}
                className="btn-primary"
              >
                <RefreshCw size={14} /> Execute Merge Sort
              </button>
            </div>
          </div>

          {sortResult && (
            <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                <div style={{ padding: 14, backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Array Size (n)</span>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>{sortResult.itemCount} items</strong>
                </div>
                <div style={{ padding: 14, backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Comparisons Tracked</span>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--found-color)' }}>{sortResult.comparisonsCount} ops</strong>
                </div>
                <div style={{ padding: 14, backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Theoretical Upper Bound</span>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>n ⌈log₂ n⌉ ≈ {Math.ceil(sortResult.itemCount * Math.log2(Math.max(2, sortResult.itemCount)))} ops</strong>
                </div>
              </div>

              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, marginBottom: 12 }}>Sorted Items Result:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sortResult.sortedItems.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.84rem'
                    }}
                  >
                    <span><strong>#{idx + 1}</strong> {item.name} ({item.category})</span>
                    <span style={{ color: 'var(--text-muted)' }}>{item.date} • {item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Concept 3: Bipartite Matching */}
      {activeConcept === 'bipartite' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>
              Network Flows: Maximum Cardinality Bipartite Matching
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
              Constructs a bipartite graph between Lost Reports (U) and Found Items (V). Finds maximum independent recovery pairs via augmenting paths in O(V · E) time.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Acceptance Threshold:</span>
                <input
                  type="range"
                  min="0.2"
                  max="0.8"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                />
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {Math.round(threshold * 100)}%
                </span>
              </div>

              <button
                onClick={runBipartiteMatching}
                disabled={bipartiteLoading}
                className="btn-primary"
              >
                <RefreshCw size={14} /> Compute Optimal Assignment
              </button>
            </div>
          </div>

          {bipartiteResult && (
            <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                <div style={{ padding: 14, backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Maximum Cardinality Match</span>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>{bipartiteResult.maxMatchingSize} Pairs</strong>
                </div>
                <div style={{ padding: 14, backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Lost Reports (U)</span>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--lost-color)' }}>{bipartiteResult.lostItemsCount}</strong>
                </div>
                <div style={{ padding: 14, backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Found Items (V)</span>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--found-color)' }}>{bipartiteResult.foundItemsCount}</strong>
                </div>
              </div>

              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, marginBottom: 12 }}>Matched 1-to-1 Disjoint Pairs:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bipartiteResult.assignedPairs.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.86rem'
                    }}
                  >
                    <span><strong>Lost:</strong> {p.lostItemName}</span>
                    <ArrowRight size={16} color="var(--primary)" />
                    <span><strong>Found:</strong> {p.foundItemName}</span>
                    <span className="badge badge-found">Score: {Math.round(p.matchScore * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Concept 4: Search Benchmark */}
      {activeConcept === 'search' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>
              Unit I: Asymptotic Time Complexity Analysis
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
              Direct microsecond comparison between baseline Linear Search (O(n) scans) versus In-Memory Hash/Indexed search (O(1+k) retrieval).
            </p>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search term..."
                className="form-input"
                style={{ maxWidth: 300 }}
              />

              <button
                onClick={runSearchBenchmark}
                disabled={searchLoading}
                className="btn-primary"
              >
                <RefreshCw size={14} /> Run Benchmark
              </button>
            </div>
          </div>

          {searchResult && (
            <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
                <div style={{ padding: 14, backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Linear Search O(n)</span>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--lost-color)' }}>{searchResult.linearTimeMicros} µs</strong>
                </div>
                <div style={{ padding: 14, backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Indexed Search O(1+k)</span>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--found-color)' }}>{searchResult.indexedTimeMicros} µs</strong>
                </div>
                <div style={{ padding: 14, backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Speedup Multiplier</span>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>
                    {searchResult.speedupFactor.toFixed(1)}x faster
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
