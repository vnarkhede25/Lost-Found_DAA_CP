import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, XCircle, PackageCheck, FileText,
  AlertCircle, History, Clock, User, Phone, MapPin, ChevronRight
} from 'lucide-react';
import type { Claim, AuditLog, AdminOverview } from '../types';
import { apiClient } from '../api/client';

interface AdminDashboardProps {
  adminEmail: string;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminEmail, onRefreshData }) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'claims' | 'handover' | 'audit'>('claims');
  const [claims, setClaims] = useState<Claim[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal Review States
  const [reviewingClaim, setReviewingClaim] = useState<Claim | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Handover modal
  const [handoverClaim, setHandoverClaim] = useState<Claim | null>(null);
  const [handoverNotes, setHandoverNotes] = useState('Student ID verified; item delivered in good condition.');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [fetchedClaims, fetchedLogs, fetchedOverview] = await Promise.all([
        apiClient.getAllClaims(),
        apiClient.getAuditLogs(),
        apiClient.getAdminOverview()
      ]);
      setClaims(fetchedClaims);
      setAuditLogs(fetchedLogs);
      setOverview(fetchedOverview);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingClaim || !adminNotes.trim()) return;

    setIsProcessing(true);
    try {
      await apiClient.reviewClaim(reviewingClaim.id, reviewDecision, adminNotes.trim(), adminEmail);
      setReviewingClaim(null);
      setAdminNotes('');
      await fetchAdminData();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Error processing review');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHandoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverClaim) return;

    setIsProcessing(true);
    try {
      await apiClient.completeHandover(handoverClaim.id, handoverNotes.trim(), adminEmail);
      setHandoverClaim(null);
      await fetchAdminData();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Error executing handover');
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingClaims = claims.filter(c => c.status === 'PENDING');
  const approvedClaims = claims.filter(c => c.status === 'APPROVED');

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px 60px' }}>
      {/* Overview Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        <div className="card" style={{ padding: '20px 24px', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
            Pending Claims Review
          </span>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--pending-color)' }}>
            {overview ? overview.pendingClaimsCount : pendingClaims.length}
          </div>
        </div>

        <div className="card" style={{ padding: '20px 24px', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
            Approved For Pickup
          </span>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--found-color)' }}>
            {overview ? overview.approvedClaimsCount : approvedClaims.length}
          </div>
        </div>

        <div className="card" style={{ padding: '20px 24px', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
            Total Items Recovered
          </span>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--resolved-color)' }}>
            {overview ? overview.returnedItemsCount : 0}
          </div>
        </div>

        <div className="card" style={{ padding: '20px 24px', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
            Active Directory Items
          </span>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {overview ? overview.totalActiveItems : 0}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20, backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveAdminTab('claims')}
            className={activeAdminTab === 'claims' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.85rem' }}
          >
            Review Claims ({pendingClaims.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('handover')}
            className={activeAdminTab === 'handover' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.85rem' }}
          >
            Handover Station ({approvedClaims.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('audit')}
            className={activeAdminTab === 'audit' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.85rem' }}
          >
            Audit Trail ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Claims Review */}
      {activeAdminTab === 'claims' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {pendingClaims.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff' }}>
              <CheckCircle2 size={40} color="var(--found-color)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>All Claims Processed</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                There are currently no pending ownership verification claims awaiting review.
              </p>
            </div>
          ) : (
            pendingClaims.map((claim) => (
              <div
                key={claim.id}
                className="card"
                style={{
                  padding: '20px 24px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                  <div>
                    <span className="badge badge-pending">Pending Review</span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: 8, marginBottom: 2 }}>
                      Claim #{claim.id} on Item #{claim.itemId}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Claimant: <strong>{claim.claimantName}</strong> ({claim.claimantEmail}) • {claim.claimantPhone}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setReviewingClaim(claim);
                      setReviewDecision('APPROVED');
                      setAdminNotes('Secret proof verified against physical found item.');
                    }}
                    className="btn-primary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    Moderate Claim
                  </button>
                </div>

                <div style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.86rem'
                }}>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: 2 }}>Submitted Secret Proof:</strong>
                  <span style={{ color: 'var(--text-secondary)' }}>{claim.secretProof}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Handover Station */}
      {activeAdminTab === 'handover' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {approvedClaims.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff' }}>
              <PackageCheck size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>No Handover Pickups Ready</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                Approved claims ready for physical pickup desk handover will show here.
              </p>
            </div>
          ) : (
            approvedClaims.map((claim) => (
              <div
                key={claim.id}
                className="card"
                style={{
                  padding: '20px 24px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <span className="badge badge-found">Ready For Pickup</span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: 8, marginBottom: 2 }}>
                      Approved Claim #{claim.id} for Item #{claim.itemId}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Authorized Claimant: <strong>{claim.claimantName}</strong> ({claim.claimantEmail})
                    </div>
                  </div>

                  <button
                    onClick={() => setHandoverClaim(claim)}
                    className="btn-primary"
                    style={{ backgroundColor: 'var(--found-color)', fontSize: '0.85rem' }}
                  >
                    <PackageCheck size={16} /> Confirm Handover
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Security Audit Trail */}
      {activeAdminTab === 'audit' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#ffffff' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Timestamp</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Action</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Target</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Actor</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.slice(0, 50).map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 18px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--primary)' }}>
                      {log.action}
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      {log.targetType} #{log.targetId}
                    </td>
                    <td style={{ padding: '12px 18px', color: 'var(--text-secondary)' }}>
                      {log.actorEmail}
                    </td>
                    <td style={{ padding: '12px 18px', color: 'var(--text-secondary)' }}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingClaim && (
        <div className="modal-overlay" onClick={() => setReviewingClaim(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540, backgroundColor: '#ffffff' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Moderate Claim #{reviewingClaim.id}
              </h3>
            </div>
            <form onSubmit={handleReviewSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Review Decision</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setReviewDecision('APPROVED')}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: reviewDecision === 'APPROVED' ? '2px solid var(--found-color)' : '1px solid var(--border-medium)',
                      backgroundColor: reviewDecision === 'APPROVED' ? 'var(--found-bg)' : '#ffffff',
                      color: reviewDecision === 'APPROVED' ? 'var(--found-color)' : 'var(--text-secondary)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Approve Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewDecision('REJECTED')}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: reviewDecision === 'REJECTED' ? '2px solid var(--lost-color)' : '1px solid var(--border-medium)',
                      backgroundColor: reviewDecision === 'REJECTED' ? 'var(--lost-bg)' : '#ffffff',
                      color: reviewDecision === 'REJECTED' ? 'var(--lost-color)' : 'var(--text-secondary)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Reject Claim
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="form-label">Administrative Notes *</label>
                <textarea
                  required
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record why this claim was approved or rejected..."
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setReviewingClaim(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-primary"
                  style={{
                    backgroundColor: reviewDecision === 'APPROVED' ? 'var(--found-color)' : 'var(--lost-color)'
                  }}
                >
                  {isProcessing ? 'Saving...' : 'Record Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Handover Modal */}
      {handoverClaim && (
        <div className="modal-overlay" onClick={() => setHandoverClaim(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540, backgroundColor: '#ffffff' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Authorize Handover for Claim #{handoverClaim.id}
              </h3>
            </div>
            <form onSubmit={handleHandoverSubmit} style={{ padding: '24px' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                Please confirm that student <strong>{handoverClaim.claimantName}</strong> presented valid photo identification before delivering Item #{handoverClaim.itemId}.
              </p>

              <div style={{ marginBottom: 20 }}>
                <label className="form-label">Handover Verification Notes</label>
                <input
                  type="text"
                  required
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setHandoverClaim(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-primary"
                  style={{ backgroundColor: 'var(--found-color)' }}
                >
                  {isProcessing ? 'Processing...' : 'Complete Official Handover'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
