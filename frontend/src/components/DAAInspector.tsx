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

  // Fetch initial data
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
      const res = await apiClient.getDAALcsCompare(lcsTextA, lcsTextB);
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
    <div style={{ padding: '30px 0' }}>
      <div className="container">
        {/* Banner */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 'var(--radius-full)', color: '#60a5fa', fontSize: '0.78rem', fontWeight: 700, marginBottom: 8 }}>
            <Cpu size={14} /> DAA COURSE PROJECT CURRICULUM VERIFICATION
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            Algorithmic Engine &amp; Complexity Benchmarks
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Direct, verifiable implementations from the DAA syllabus applied to college lost &amp; found operations.
          </p>
        </div>

        {/* Concept Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 28 }}>
          <button
            onClick={() => setActiveConcept('lcs')}
            className="card"
            style={{
              padding: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              border: activeConcept === 'lcs' ? '2px solid #818cf8' : '1px solid var(--border-subtle)',
              background: activeConcept === 'lcs' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-secondary)'
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase' }}>
              Unit III • Dynamic Programming
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileCode size={18} color="#818cf8" />
              Longest Common Subsequence
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Title &amp; description semantic matching (O(mn))
            </div>
          </button>

          <button
            onClick={() => setActiveConcept('mergeSort')}
            className="card"
            style={{
              padding: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              border: activeConcept === 'mergeSort' ? '2px solid #38bdf8' : '1px solid var(--border-subtle)',
              background: activeConcept === 'mergeSort' ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-secondary)'
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
              Unit II • Divide and Conquer
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <GitMerge size={18} color="#38bdf8" />
              Merge Sort &amp; Recurrences
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              T(n) = 2T(n/2) + Θ(n) stable item sorting
            </div>
          </button>

          <button
            onClick={() => setActiveConcept('search')}
            className="card"
            style={{
              padding: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              border: activeConcept === 'search' ? '2px solid #34d399' : '1px solid var(--border-subtle)',
              background: activeConcept === 'search' ? 'rgba(52, 211, 153, 0.08)' : 'var(--bg-secondary)'
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
              Unit I • Complexity Analysis
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Binary size={18} color="#34d399" />
              Searching &amp; Asymptotics
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Linear O(n) vs Indexed O(1) benchmarks
            </div>
          </button>

          <button
            onClick={() => setActiveConcept('bipartite')}
            className="card"
            style={{
              padding: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              border: activeConcept === 'bipartite' ? '2px solid #fbbf24' : '1px solid var(--border-subtle)',
              background: activeConcept === 'bipartite' ? 'rgba(251, 191, 36, 0.08)' : 'var(--bg-secondary)'
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase' }}>
              Unit V • Network Flows
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Network size={18} color="#fbbf24" />
              Bipartite Matching
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Augmenting paths for non-conflicting pairs
            </div>
          </button>
        </div>

        {/* CONCEPT 3: LONGEST COMMON SUBSEQUENCE (LCS) */}
        {activeConcept === 'lcs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                    Concept 3: Longest Common Subsequence (LCS) Comparator
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Evaluates semantic description agreement between Lost reports and Found items using 2D dynamic programming.
                  </p>
                </div>
                <button onClick={runLcsComparison} className="btn-secondary" disabled={lcsLoading}>
                  <RefreshCw size={14} className={lcsLoading ? 'spin' : ''} /> Recompute LCS Table
                </button>
              </div>

              {/* Interactive Input Comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--lost-color)', marginBottom: 6 }}>
                    Lost Report Description (Sequence X)
                  </label>
                  <textarea
                    rows={3}
                    value={lcsTextA}
                    onChange={e => setLcsTextA(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--found-color)', marginBottom: 6 }}>
                    Found Item Description (Sequence Y)
                  </label>
                  <textarea
                    rows={3}
                    value={lcsTextB}
                    onChange={e => setLcsTextB(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              {/* LCS Results Display */}
              {lcsResult && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
                  <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>LCS Length</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#818cf8', marginTop: 2 }}>{lcsResult.lcsLength} chars</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Matching character units</div>
                  </div>

                  <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Token LCS Ratio</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>{lcsResult.tokenLcsSimilarityRatio}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Word-level common order</div>
                  </div>

                  <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Reconstructed Common Subsequence</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                      "{lcsResult.reconstructedSubsequence}"
                    </div>
                  </div>
                </div>
              )}

              {/* Theoretical Recurrence Card */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.06)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                fontSize: '0.85rem'
              }}>
                <div style={{ fontWeight: 700, color: '#a5b4fc', marginBottom: 6 }}>
                  Syllabus Mathematical Model: Dynamic Programming Recurrence
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#e2e8f0', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 6, marginBottom: 8 }}>
                  LCS(i, j) = 0                                       if i == 0 or j == 0<br/>
                  LCS(i, j) = 1 + LCS(i - 1, j - 1)                   if X[i-1] == Y[j-1]<br/>
                  LCS(i, j) = max(LCS(i - 1, j), LCS(i, j - 1))       if X[i-1] != Y[j-1]
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  <strong>Complexity:</strong> Time O(m · n), Space O(m · n) for table reconstruction and O(min(m, n)) for space-optimized length.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONCEPT 2: MERGE SORT */}
        {activeConcept === 'mergeSort' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                    Concept 2: Merge Sort &amp; Divide and Conquer Analysis
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Recursive divide-and-conquer sorting on actual campus reports, benchmarked with operation counts.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    value={sortField}
                    onChange={e => {
                      setSortField(e.target.value);
                      setTimeout(runMergeSortDemo, 50);
                    }}
                    style={{
                      padding: '8px 12px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="date">Sort by Date (Newest)</option>
                    <option value="name">Sort by Item Title (A-Z)</option>
                    <option value="priority">Sort by Urgency Priority Score</option>
                  </select>
                  <button onClick={runMergeSortDemo} className="btn-secondary">
                    <RefreshCw size={14} /> Run Sort
                  </button>
                </div>
              </div>

              {sortResult && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
                    <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Elements Sorted</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>{sortResult.elementCount} items</div>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Tracked Comparisons</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', marginTop: 2 }}>{sortResult.comparisons} comparisons</div>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Execution Time</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginTop: 2 }}>{sortResult.elapsedMicros} μs</div>
                    </div>
                  </div>

                  {/* Theoretical Recurrence Relation Box */}
                  <div style={{
                    background: 'rgba(56, 189, 248, 0.06)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    fontSize: '0.85rem',
                    marginBottom: 20
                  }}>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>
                      Recurrence Relation &amp; Master Theorem Proof:
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#e2e8f0', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 6, marginBottom: 8 }}>
                      T(n) = 2 · T(n / 2) + Θ(n)   [Divide into 2 halves, combine in linear merge time]<br/>
                      By Master Theorem: a = 2, b = 2, f(n) = Θ(n)<br/>
                      log_b(a) = log_2(2) = 1. Since f(n) = Θ(n^1), Case 2 applies: T(n) = Θ(n log n).
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      <strong>Auxiliary Space:</strong> Θ(n) for merge buffers • <strong>Stability:</strong> Proven stable (preserves identical key order).
                    </div>
                  </div>

                  {/* Sorted Output Sample */}
                  <div>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 8 }}>Sorted Output Order:</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
                      {sortResult.sortedSample.map(item => (
                        <div key={item.id} style={{ background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
                          <span style={{ fontWeight: 600 }}>#{item.id} {item.name}</span>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                            Date: {item.date} • Priority: {item.priorityScore}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* CONCEPT 1: SEARCH & ASYMPTOTICS */}
        {activeConcept === 'search' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                    Concept 1: Searching &amp; Asymptotic Complexity Analysis
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Direct comparison of naive Linear Search baseline versus Inverted Keyword Index lookup.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Enter query..."
                    style={{
                      padding: '8px 12px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                  <button onClick={runSearchBenchmark} className="btn-secondary">
                    <RefreshCw size={14} /> Benchmark
                  </button>
                </div>
              </div>

              {searchResult && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Linear Search Card */}
                  <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--lost-color)' }}>
                        Linear Search Baseline
                      </h4>
                      <span className="badge badge-lost">O(n) Scanning</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', marginBottom: 14 }}>
                      <div>Matches Found: <strong>{searchResult.linearSearch.matchesFound}</strong></div>
                      <div>Comparisons Count: <strong>{searchResult.linearSearch.comparisons}</strong></div>
                      <div>Elapsed Execution Time: <strong>{searchResult.linearSearch.durationMicros} μs</strong></div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: 6, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <div>• Best Case: <span style={{ color: '#fff' }}>Ω(1)</span> (match at head)</div>
                      <div>• Average Case: <span style={{ color: '#fff' }}>Θ(n)</span> (n / 2 scans)</div>
                      <div>• Worst Case: <span style={{ color: '#fff' }}>O(n)</span> (exhaustive scan)</div>
                      <div>• Auxiliary Space: <span style={{ color: '#fff' }}>Θ(1)</span></div>
                    </div>
                  </div>

                  {/* Indexed Search Card */}
                  <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--found-border)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--found-color)' }}>
                        Inverted Token Index
                      </h4>
                      <span className="badge badge-found">O(1 + k) Lookup</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', marginBottom: 14 }}>
                      <div>Matches Found: <strong>{searchResult.indexedSearch.matchesFound}</strong></div>
                      <div>Comparisons Count: <strong>{searchResult.indexedSearch.comparisons}</strong></div>
                      <div>Elapsed Execution Time: <strong>{searchResult.indexedSearch.durationMicros} μs</strong></div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: 6, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <div>• Best Case: <span style={{ color: '#fff' }}>Ω(1)</span> (direct hash hit)</div>
                      <div>• Average Case: <span style={{ color: '#fff' }}>Θ(1 + k)</span> (bucket access)</div>
                      <div>• Worst Case: <span style={{ color: '#fff' }}>O(n)</span> (stop-word flood)</div>
                      <div>• Speedup Factor: <strong style={{ color: '#34d399' }}>{searchResult.speedupFactor}</strong></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONCEPT 4: MAXIMUM BIPARTITE MATCHING */}
        {activeConcept === 'bipartite' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                    Concept 4: Maximum Bipartite Matching (Network Flows)
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Unit V network flows optimization using augmenting paths to compute global, non-conflicting pairings between Lost and Found items.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Threshold: {Math.round(threshold * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.30"
                    max="0.80"
                    step="0.05"
                    value={threshold}
                    onChange={e => {
                      setThreshold(parseFloat(e.target.value));
                      setTimeout(runBipartiteMatching, 50);
                    }}
                  />
                  <button onClick={runBipartiteMatching} className="btn-secondary">
                    <RefreshCw size={14} /> Recompute
                  </button>
                </div>
              </div>

              {bipartiteResult && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
                    <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Lost Items (L)</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--lost-color)', marginTop: 2 }}>{bipartiteResult.activeLostItemsCount}</div>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Found Items (R)</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--found-color)', marginTop: 2 }}>{bipartiteResult.activeFoundItemsCount}</div>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Candidate Edges (E)</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>{bipartiteResult.candidateEdgesAboveThreshold}</div>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Max Cardinality |M|</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24', marginTop: 2 }}>{bipartiteResult.maxPairsCardinality} pairs</div>
                    </div>
                  </div>

                  {/* Theoretical Explanation */}
                  <div style={{
                    background: 'rgba(251, 191, 36, 0.06)',
                    border: '1px solid rgba(251, 191, 36, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    fontSize: '0.85rem',
                    marginBottom: 20
                  }}>
                    <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: 4 }}>
                      Berge's Lemma &amp; Augmenting Path Matching:
                    </div>
                    <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      A matching M in bipartite graph G is maximum if and only if G contains no M-augmenting path. The DFS-based augmenting path algorithm has time complexity <strong>O(V · E)</strong>. Crucially, maximum cardinality matching guarantees that <em>no single found item is simultaneously promised to multiple competing lost claims</em>, resolving global inventory conflicts before administrative verification.
                    </div>
                  </div>

                  {/* Computed Matching Table */}
                  <div>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>
                      Non-Conflicting Global Pairings Suggested for Admin Verification:
                    </h5>
                    {bipartiteResult.matchedPairs.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                        No candidate pairings exceed the current threshold ({Math.round(threshold * 100)}%). Lower the threshold slider to expand edge connectivity.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {bipartiteResult.matchedPairs.map((p, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            background: 'var(--bg-primary)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.88rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span className="badge badge-lost">LOST #{p.lostItemId}</span>
                              <span style={{ fontWeight: 600 }}>{p.lostItemName}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <ArrowRight size={16} color="#94a3b8" />
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa', background: 'rgba(59, 130, 246, 0.15)', padding: '2px 8px', borderRadius: 10 }}>
                                {p.confidencePercent} Match
                              </span>
                              <ArrowRight size={16} color="#94a3b8" />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span className="badge badge-found">FOUND #{p.foundItemId}</span>
                              <span style={{ fontWeight: 600 }}>{p.foundItemName}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
