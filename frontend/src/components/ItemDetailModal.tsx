import React from 'react';
import type { Item } from '../types';
import { X, MapPin, Calendar, Award, User, CheckCircle2, Shield, Sparkles, Trash2, Flag } from 'lucide-react';

interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
  onClaimItem: (item: Item) => void;
  onFindMatches: (item: Item) => void;
  currentUserEmail: string;
  userRole: 'STUDENT' | 'ADMIN';
  onDeleteItem: (id: number) => Promise<void>;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onClaimItem,
  onFindMatches,
  currentUserEmail,
  userRole,
  onDeleteItem
}) => {
  if (!item) return null;

  const isOwner = item.reporterEmail && item.reporterEmail.toLowerCase() === currentUserEmail.toLowerCase();
  const isAdmin = userRole === 'ADMIN';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640, backgroundColor: '#ffffff' }}>
        {/* Header Image */}
        <div style={{ position: 'relative', height: 260, width: '100%', backgroundColor: 'var(--bg-surface)' }}>
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
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
            aria-label="Close details"
          >
            <X size={18} />
          </button>

          {/* Type and Status badges */}
          <div style={{ position: 'absolute', bottom: 14, left: 16, display: 'flex', gap: 8 }}>
            <span className={`badge ${item.type === 'LOST' ? 'badge-lost' : 'badge-found'}`}>
              {item.type} ITEM
            </span>
            <span className={`badge ${
              item.status === 'OPEN' ? 'badge-found' :
              item.status === 'CLAIM_PENDING' ? 'badge-pending' :
              item.status === 'RETURNED' ? 'badge-returned' : 'badge-lost'
            }`}>
              {item.status === 'CLAIM_PENDING' ? 'VERIFICATION PENDING' : item.status}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 700 }}>
              {item.category}
            </span>
            {item.reward && (
              <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Award size={16} /> Reward: {item.reward}
              </span>
            )}
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: 10, lineHeight: 1.3, color: 'var(--text-primary)' }}>
            {item.name}
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: 20 }}>
            {item.description}
          </p>

          {/* Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 14,
            backgroundColor: 'var(--bg-surface)',
            padding: '16px 18px',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 24,
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 2 }}>Campus Location</span>
              <strong style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                <MapPin size={15} color="var(--primary)" /> {item.location}
              </strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 2 }}>Incident Date</span>
              <strong style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                <Calendar size={15} color="var(--primary)" /> {item.date}
              </strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 2 }}>Reporter</span>
              <strong style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                <User size={15} color="var(--primary)" /> {item.reporterName ? item.reporterName : 'University Member'}
              </strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 2 }}>Status</span>
              <strong style={{ display: 'flex', alignItems: 'center', gap: 6, color: item.status === 'RETURNED' ? 'var(--resolved-color)' : '#059669', fontSize: '0.88rem' }}>
                <CheckCircle2 size={15} /> {item.status}
              </strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 16,
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', gap: 10 }}>
              {item.type === 'FOUND' && item.status !== 'RETURNED' && item.status !== 'CLOSED' && (
                <button
                  onClick={() => {
                    onClose();
                    onClaimItem(item);
                  }}
                  className="btn-primary"
                  style={{ padding: '10px 20px' }}
                >
                  <Shield size={16} /> Claim This Item
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  onFindMatches(item);
                }}
                className="btn-secondary"
                style={{ padding: '10px 16px' }}
              >
                <Sparkles size={16} color="var(--primary)" /> Check Matches
              </button>
            </div>

            {(isOwner || isAdmin) && (
              <button
                onClick={async () => {
                  if (confirm(`Are you sure you want to delete listing "${item.name}"?`)) {
                    await onDeleteItem(item.id);
                  }
                }}
                className="btn-destructive"
              >
                <Trash2 size={15} /> Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
