import React, { useState } from 'react';
import type { Item } from '../types';
import { X, ShieldCheck, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../api/client';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: Item | null;
  currentUserEmail: string;
  userLostReports: Item[];
  onClaimSubmitted: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  onClose,
  targetItem,
  currentUserEmail,
  userLostReports,
  onClaimSubmitted
}) => {
  if (!isOpen || !targetItem) return null;

  const [claimantName, setClaimantName] = useState(currentUserEmail.split('@')[0].replace('.', ' '));
  const [claimantPhone, setClaimantPhone] = useState('+1 (555) 019-2834');
  const [secretProof, setSecretProof] = useState('');
  const [linkedLostItemId, setLinkedLostItemId] = useState<number | undefined>(
    userLostReports.length > 0 ? userLostReports[0].id : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretProof.trim()) {
      setErrorMsg('Please specify unique identifying details only the rightful owner would know.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await apiClient.submitClaim({
        itemId: targetItem.id,
        matchedItemId: linkedLostItemId,
        claimantEmail: currentUserEmail,
        claimantName,
        contactPhone: claimantPhone,
        descriptionProof: secretProof.trim(),
      });

      setSuccessMsg('Your claim verification has been logged with Campus Security. You can monitor review progress under "My Activity".');
      setTimeout(() => {
        setSuccessMsg('');
        onClaimSubmitted();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580, backgroundColor: '#ffffff' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}>
                <ShieldCheck size={16} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Verify Ownership &amp; Claim Item
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Claiming: <strong>{targetItem.name}</strong> (#{targetItem.id})
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-surface)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              backgroundColor: 'var(--lost-bg)',
              color: 'var(--lost-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.86rem',
              marginBottom: 16
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              backgroundColor: 'var(--found-bg)',
              color: 'var(--found-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.86rem',
              marginBottom: 16
            }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <div style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 20,
            fontSize: '0.84rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5
          }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>Security Verification Standard:</strong>
            To prevent unauthorized claims, please provide secret identifying features (e.g. unique scratches, lock screen wallpaper, case brand, serial number fragments, or wallet contents).
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                required
                value={claimantPhone}
                onChange={(e) => setClaimantPhone(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Link to previous lost report */}
          {userLostReports.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Link to My Prior Lost Report (Optional)</label>
              <select
                value={linkedLostItemId || ''}
                onChange={(e) => setLinkedLostItemId(e.target.value ? Number(e.target.value) : undefined)}
                className="form-input"
              >
                <option value="">No linked report (Standalone claim)</option>
                {userLostReports.map(r => (
                  <option key={r.id} value={r.id}>
                    #{r.id} - {r.name} ({r.date})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Secret Evidence */}
          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Secret Identifying Proof *</label>
            <textarea
              required
              rows={4}
              value={secretProof}
              onChange={(e) => setSecretProof(e.target.value)}
              placeholder="e.g. 'There is a small scratch on the lower left corner and my university sticker inside the case...'"
              className="form-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            paddingTop: 16,
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
