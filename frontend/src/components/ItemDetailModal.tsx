import React from 'react';
import type { Item } from '../types';
import { X, MapPin, Calendar, Award, Flame, User, CheckCircle2, Trash2, Sparkles } from 'lucide-react';

interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
  onUpdateStatus: (id: number, status: 'OPEN' | 'MATCHED' | 'RESOLVED') => Promise<void>;
  onDeleteItem: (id: number) => Promise<void>;
  onFindMatches: (item: Item) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onUpdateStatus,
  onDeleteItem,
  onFindMatches
}) => {
  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
        {/* Header Image */}
        <div style={{ position: 'relative', height: 260, width: '100%', background: 'var(--bg-tertiary)' }}>
          <img
            src={item.photoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'rgba(0, 0, 0, 0.65)',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ position: 'absolute', bottom: 14, left: 16, display: 'flex', gap: 8 }}>
            <span className={item.type === 'LOST' ? 'badge-lost' : 'badge-found'} style={{ fontSize: '0.85rem', padding: '5px 12px' }}>
              {item.type}
            </span>
            <span className={item.status === 'RESOLVED' ? 'badge-resolved' : item.status === 'MATCHED' ? 'badge-matched' : 'badge-category'} style={{ fontSize: '0.85rem', padding: '5px 12px' }}>
              STATUS: {item.status}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="badge-category">{item.category}</span>
            {item.reward && (
              <span style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Award size={16} /> {item.reward}
              </span>
            )}
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12, lineHeight: 1.25 }}>
            {item.name}
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 20 }}>
            {item.description}
          </p>

          {/* Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            background: 'var(--bg-secondary)',
            padding: 18,
            borderRadius: 'var(--radius-md)',
            marginBottom: 24,
            fontSize: '0.86rem'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Location</span>
              <strong style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
                <MapPin size={15} color="#818cf8" /> {item.location}
              </strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Date Recorded</span>
              <strong style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
                <Calendar size={15} color="#818cf8" /> {item.date}
              </strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Reported By</span>
              <strong style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
                <User size={15} color="#818cf8" /> {item.reporterName || item.reporterEmail}
              </strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>ADS Max-Heap Score</span>
              <strong style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24' }}>
                <Flame size={15} /> {Math.round((item.priorityScore || 0.75) * 100)}% Priority
              </strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              {item.status !== 'RESOLVED' ? (
                <button
                  onClick={() => onUpdateStatus(item.id, 'RESOLVED')}
                  className="btn-primary"
                  style={{ background: 'var(--found-gradient)', fontSize: '0.85rem' }}
                >
                  <CheckCircle2 size={16} />
                  <span>Mark as Resolved</span>
                </button>
              ) : (
                <button
                  onClick={() => onUpdateStatus(item.id, 'OPEN')}
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Re-open Item
                </button>
              )}

              <button
                onClick={() => {
                  onFindMatches(item);
                  onClose();
                }}
                className="btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                <Sparkles size={16} color="#c084fc" />
                <span>Search Matches</span>
              </button>
            </div>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this listing?')) {
                  onDeleteItem(item.id);
                  onClose();
                }
              }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                color: '#f43f5e',
                borderRadius: 'var(--radius-full)',
                padding: '8px 16px',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
