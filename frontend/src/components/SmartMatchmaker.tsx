import React, { useState } from 'react';
import type { Match, Item } from '../types';
import { Sparkles, ShieldCheck, MapPin, Calendar, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

interface SmartMatchmakerProps {
  matches: Match[];
  currentUser: string;
  onInitiateClaim: (item: Item, relatedLostItem?: Item) => void;
  onInspectItem: (item: Item) => void;
}

export const SmartMatchmaker: React.FC<SmartMatchmakerProps> = ({
  matches,
  currentUser,
  onInitiateClaim,
  onInspectItem
}) => {
  const [filterUserOnly, setFilterUserOnly] = useState(false);

  const displayedMatches = filterUserOnly
    ? matches.filter(
        (m) =>
          (m.lostItem && m.lostItem.reporterEmail.toLowerCase() === currentUser.toLowerCase()) ||
          (m.foundItem && m.foundItem.reporterEmail.toLowerCase() === currentUser.toLowerCase())
      )
    : matches;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px 60px' }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '24px 28px', marginBottom: 24, backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}>
                <Sparkles size={18} />
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Potential Matches
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 700, margin: 0, lineHeight: 1.5 }}>
              Candidate pairings automatically analyzed based on item descriptions, category agreement, campus dropzone proximity, and incident dates. Matches are suggestions and require ownership verification before handover.
            </p>
          </div>

          <button
            onClick={() => setFilterUserOnly(!filterUserOnly)}
            className={filterUserOnly ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.84rem', padding: '8px 16px' }}
          >
            {filterUserOnly ? 'Show All Campus Matches' : 'Filter My Matches Only'}
          </button>
        </div>
      </div>

      {/* Empty State */}
      {displayedMatches.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff' }}>
          <Sparkles size={36} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>
            No High-Confidence Matches Found Yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 440, margin: '0 auto 16px' }}>
            As more students and security desks report lost and found items, the dynamic programming engine will automatically populate suggested pairings.
          </p>
        </div>
      )}

      {/* Matches Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {displayedMatches.map((m) => {
          const scorePercent = Math.round(m.similarityScore * 100);
          return (
            <div
              key={m.id}
              className="card"
              style={{
                padding: '22px 26px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: 14,
                marginBottom: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: scorePercent >= 75 ? 'var(--found-bg)' : scorePercent >= 50 ? 'var(--pending-bg)' : 'var(--bg-surface)',
                    color: scorePercent >= 75 ? 'var(--found-color)' : scorePercent >= 50 ? 'var(--pending-color)' : 'var(--text-secondary)',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <CheckCircle2 size={14} /> {scorePercent}% Similarity Match
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Automated Candidate Suggestion
                  </span>
                </div>

                {m.foundItem && m.foundItem.status !== 'RETURNED' && (
                  <button
                    onClick={() => onInitiateClaim(m.foundItem, m.lostItem)}
                    className="btn-primary"
                    style={{ padding: '8px 18px', fontSize: '0.84rem' }}
                  >
                    Claim Found Item
                  </button>
                )}
              </div>

              {/* Two Column Item Pair */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 20
              }}>
                {/* Lost Item Column */}
                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span className="badge badge-lost">Lost Item Report</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.lostItem?.category}</span>
                  </div>
                  <h4
                    onClick={() => m.lostItem && onInspectItem(m.lostItem)}
                    style={{ fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer', marginBottom: 6, color: 'var(--text-primary)' }}
                  >
                    {m.lostItem?.name}
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                    {m.lostItem?.description}
                  </p>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: 14 }}>
                    <span>📍 {m.lostItem?.location}</span>
                    <span>📅 {m.lostItem?.date}</span>
                  </div>
                </div>

                {/* Found Item Column */}
                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span className="badge badge-found">Found Listing</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.foundItem?.category}</span>
                  </div>
                  <h4
                    onClick={() => m.foundItem && onInspectItem(m.foundItem)}
                    style={{ fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer', marginBottom: 6, color: 'var(--text-primary)' }}
                  >
                    {m.foundItem?.name}
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                    {m.foundItem?.description}
                  </p>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: 14 }}>
                    <span>📍 {m.foundItem?.location}</span>
                    <span>📅 {m.foundItem?.date}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
