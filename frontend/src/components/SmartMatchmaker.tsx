import React, { useState } from 'react';
import type { Match, Item } from '../types';
import { Sparkles, CheckCircle2, ShieldCheck, MapPin, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SmartMatchmakerProps {
  matches: Match[];
  currentUser: string;
  onClaimMatch: (lostId: number, foundId: number) => Promise<void>;
  onInspectItem: (item: Item) => void;
}

export const SmartMatchmaker: React.FC<SmartMatchmakerProps> = ({
  matches,
  currentUser,
  onClaimMatch,
  onInspectItem
}) => {
  const [filterUserOnly, setFilterUserOnly] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const displayedMatches = filterUserOnly
    ? matches.filter(
        (m) =>
          (m.lostItem && m.lostItem.reporterEmail.toLowerCase() === currentUser.toLowerCase()) ||
          (m.foundItem && m.foundItem.reporterEmail.toLowerCase() === currentUser.toLowerCase())
      )
    : matches;

  const handleClaim = async (lostId: number, foundId: number) => {
    const key = `${lostId}-${foundId}`;
    setClaimingId(key);

    try {
      await onClaimMatch(lostId, foundId);
      // Trigger festive confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div style={{ maxWidth: 1380, margin: '0 auto', padding: '0 24px 60px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px 32px', marginBottom: 28 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--matched-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
              }}>
                <Sparkles size={20} color="#fff" />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                Automated Jaccard Matchmaker
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 700, margin: 0 }}>
              The system cross-references lost and found reports using weighted token Jaccard similarity,
              spatial coordinate proximity, category tags, and calendar delta.
            </p>
          </div>

          {/* Toggle user matches */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setFilterUserOnly(!filterUserOnly)}
              className={filterUserOnly ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              {filterUserOnly ? 'Showing My Matches Only' : 'Show My Matches Only'}
            </button>
          </div>
        </div>
      </div>

      {/* Matches List */}
      {displayedMatches.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Sparkles size={48} color="#8b5cf6" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>No Potential Matches Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 500, margin: '0 auto' }}>
            {filterUserOnly
              ? `There are currently no active matches linked to your email (${currentUser}).`
              : 'Our matching algorithm runs continuously as new items are reported.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {displayedMatches.map((match, index) => {
            const lost = match.lostItem;
            const found = match.foundItem;
            const isResolved = match.status === 'RESOLVED' || lost?.status === 'RESOLVED' || found?.status === 'RESOLVED';
            const percentage = Math.round(match.score * 100);

            if (!lost || !found) return null;

            return (
              <div
                key={`${match.lostItemId}-${match.foundItemId}-${index}`}
                className="glass-panel animate-fade-in"
                style={{
                  padding: 24,
                  border: isResolved ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid var(--border-medium)',
                  background: isResolved ? 'rgba(6, 182, 212, 0.05)' : 'var(--bg-glass-card)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Confidence Bar Top */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  paddingBottom: 18,
                  marginBottom: 18,
                  borderBottom: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {/* Gauge badge */}
                    <div style={{
                      background: percentage >= 85 ? 'var(--found-gradient)' : percentage >= 60 ? 'var(--primary-gradient)' : 'var(--lost-gradient)',
                      color: '#ffffff',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 800,
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
                    }}>
                      <Sparkles size={16} />
                      <span>{percentage}% Match Confidence</span>
                    </div>

                    <span style={{ fontSize: '0.86rem', color: '#cbd5e1', fontWeight: 500 }}>
                      {match.matchReason}
                    </span>
                  </div>

                  <div>
                    {isResolved ? (
                      <span className="badge-resolved" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                        <CheckCircle2 size={16} /> Item Claimed &amp; Resolved
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaim(lost.id, found.id)}
                        disabled={claimingId === `${lost.id}-${found.id}`}
                        className="btn-primary"
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                          fontSize: '0.88rem',
                          padding: '8px 18px'
                        }}
                      >
                        <ShieldCheck size={16} />
                        <span>Confirm &amp; Claim Match</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Side-by-Side Comparison */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: 24,
                  alignItems: 'stretch'
                }}>
                  {/* Lost Item Card */}
                  <div style={{
                    background: 'rgba(244, 63, 94, 0.05)',
                    border: '1px solid var(--lost-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span className="badge-lost">LOST REPORT</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ID #{lost.id}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                      <img
                        src={lost.photoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
                        alt={lost.name}
                        style={{ width: 85, height: 85, borderRadius: 10, objectFit: 'cover' }}
                      />
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>
                          {lost.name}
                        </h4>
                        <span className="badge-category" style={{ marginBottom: 6 }}>{lost.category}</span>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineClamp: 2 }}>
                          {lost.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={14} color="#f43f5e" />
                        <span style={{ color: 'var(--text-secondary)' }}>{lost.location}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} color="#f43f5e" />
                        <span>Lost on {lost.date}</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                        Reported by: <strong>{lost.reporterName || lost.reporterEmail}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => onInspectItem(lost)}
                      className="btn-secondary"
                      style={{ marginTop: 14, justifyContent: 'center', fontSize: '0.8rem', padding: '6px 12px' }}
                    >
                      View Lost Item Details
                    </button>
                  </div>

                  {/* Found Item Card */}
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid var(--found-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span className="badge-found">FOUND REPORT</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ID #{found.id}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                      <img
                        src={found.photoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
                        alt={found.name}
                        style={{ width: 85, height: 85, borderRadius: 10, objectFit: 'cover' }}
                      />
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>
                          {found.name}
                        </h4>
                        <span className="badge-category" style={{ marginBottom: 6 }}>{found.category}</span>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineClamp: 2 }}>
                          {found.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={14} color="#10b981" />
                        <span style={{ color: 'var(--text-secondary)' }}>{found.location}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} color="#10b981" />
                        <span>Found on {found.date}</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                        Found by: <strong>{found.reporterName || found.reporterEmail}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => onInspectItem(found)}
                      className="btn-secondary"
                      style={{ marginTop: 14, justifyContent: 'center', fontSize: '0.8rem', padding: '6px 12px' }}
                    >
                      View Found Item Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
