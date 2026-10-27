import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, XCircle, PackageCheck, FileText,
  AlertCircle, History, Clock, User, Phone, MapPin
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
      alert(err.message || 'Failed to review claim');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHandoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverClaim) return;

    setIsProcessing(true);
    try {
      await apiClient.confirmHandover(handoverClaim.id, handoverNotes.trim(), adminEmail);
      setHandoverClaim(null);
      setHandoverNotes('');
      await fetchAdminData();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm handover');
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingClaims = claims.filter(c => c.status === 'PENDING');
  const approvedClaims = claims.filter(c => c.status === 'APPROVED');

  return (
    <div style={{ padding: '30px 0' }}>
      <div className="container">
        {/* Admin Header & Stat Cards */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  padding: '6px 12px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 'var(--radius-full)',
                  color: '#fbbf24',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <ShieldCheck size={14} /> AUTHORIZED CAMPUS SECURITY
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Active operator: {adminEmail}
                </span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 8 }}>
                Administrative Moderation &amp; Verification Desk
              </h2>
            </div>

            <button onClick={fetchAdminData} className="btn-secondary" style={{ fontSize: '0.82rem' }}>
              <History size={14} /> Refresh Records
            </button>
          </div>

          {/* Quick Metrics */}
          {overview && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="card" style={{ padding: '16px 20px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Pending Verification
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>
                  {overview.pendingClaimsCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Awaiting evidence review
                </div>
              </div>

              <div className="card" style={{ padding: '16px 20px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Open Lost Reports
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--lost-color)', marginTop: 4 }}>
                  {overview.openLostCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Students seeking items
                </div>
              </div>

              <div className="card" style={{ padding: '16px 20px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Open Found Items
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--found-color)', marginTop: 4 }}>
                  {overview.openFoundCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  In campus custody
                </div>
              </div>

              <div className="card" style={{ padding: '16px 20px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Confirmed Handed Over
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
                  {overview.returnedItemsCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Reunited with owners
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-subtle)', marginBottom: 24 }}>
          <button
            onClick={() => setActiveAdminTab('claims')}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeAdminTab === 'claims' ? '2px solid #f59e0b' : '2px solid transparent',
              color: activeAdminTab === 'claims' ? '#fbbf24' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Clock size={16} />
            Pending Claims Review ({pendingClaims.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('handover')}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeAdminTab === 'handover' ? '2px solid #10b981' : '2px solid transparent',
              color: activeAdminTab === 'handover' ? '#34d399' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <PackageCheck size={16} />
            Physical Handover Station ({approvedClaims.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('audit')}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeAdminTab === 'audit' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeAdminTab === 'audit' ? '#60a5fa' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <FileText size={16} />
            Administrative Audit Trail ({auditLogs.length})
          </button>
        </div>

        {/* TAB 1: PENDING CLAIMS */}
        {activeAdminTab === 'claims' && (
          <div>
            {pendingClaims.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
                <CheckCircle2 size={44} color="#10b981" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: 6 }}>All Ownership Claims Cleared</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  There are currently no unresolved student claims awaiting verification.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {pendingClaims.map(claim => (
                  <div key={claim.id} className="card" style={{ padding: '22px', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                      {/* Left side: Claim & Claimant info */}
                      <div style={{ flex: 1, minWidth: 280 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span className="badge badge-pending">CLAIM #{claim.id}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Filed on {claim.createdAt}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6 }}>
                          Claim for: {claim.item ? claim.item.name : `Item #${claim.itemId}`}
                        </h4>

                        <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <User size={14} /> {claim.claimantName} ({claim.claimantEmail})
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Phone size={14} /> {claim.contactPhone}
                          </span>
                        </div>

                        {/* Secret Proof Box */}
                        <div style={{
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '14px',
                          marginTop: 8
                        }}>
                          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                            Submitted Evidence &amp; Unique Identifiers:
                          </div>
                          <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6, margin: 0 }}>
                            "{claim.descriptionProof}"
                          </p>
                        </div>
                      </div>

                      {/* Right side: Associated Item Info & Action Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 200, alignItems: 'flex-end' }}>
                        {claim.item && (
                          <div style={{
                            fontSize: '0.82rem',
                            textAlign: 'right',
                            background: 'var(--bg-surface)',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-md)'
                          }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Found Location</div>
                            <div style={{ fontWeight: 600 }}>{claim.item.location}</div>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <button
                            onClick={() => {
                              setReviewingClaim(claim);
                              setReviewDecision('REJECTED');
                              setAdminNotes('');
                            }}
                            className="btn-secondary"
                            style={{ color: 'var(--lost-color)', borderColor: 'var(--lost-border)' }}
                          >
                            <XCircle size={15} /> Reject
                          </button>
                          <button
                            onClick={() => {
                              setReviewingClaim(claim);
                              setReviewDecision('APPROVED');
                              setAdminNotes('Evidence matches item serial number and distinguishing characteristics.');
                            }}
                            className="btn-primary"
                            style={{ backgroundColor: '#059669' }}
                          >
                            <CheckCircle2 size={15} /> Approve Claim
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HANDOVER STATION */}
        {activeAdminTab === 'handover' && (
          <div>
            <div style={{ marginBottom: 16, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Claims approved by security. Verify student identity in person at the campus security office and confirm physical handover.
            </div>

            {approvedClaims.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
                <PackageCheck size={44} color="#3b82f6" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: 6 }}>No Pending Pickups</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  All approved items have been handed over to their verified owners.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {approvedClaims.map(claim => (
                  <div key={claim.id} className="card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                            READY FOR HANDOVER
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Claim #{claim.id}</span>
                        </div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                          {claim.item ? claim.item.name : `Item #${claim.itemId}`}
                        </h4>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                          Owner: <strong>{claim.claimantName}</strong> ({claim.claimantEmail}) • Phone: {claim.contactPhone}
                        </div>
                        {claim.adminNotes && (
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>
                            Approval Note: <em>{claim.adminNotes}</em>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setHandoverClaim(claim);
                          setHandoverNotes('Student College ID verified. Physical custody transferred.');
                        }}
                        className="btn-primary"
                        style={{ backgroundColor: '#2563eb' }}
                      >
                        <PackageCheck size={16} /> Confirm Handover &amp; Close Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUDIT TRAIL */}
        {activeAdminTab === 'audit' && (
          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>
              Security &amp; Chain-of-Custody Audit Log
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 12px' }}>Timestamp</th>
                    <th style={{ padding: '10px 12px' }}>Actor</th>
                    <th style={{ padding: '10px 12px' }}>Action</th>
                    <th style={{ padding: '10px 12px' }}>Target</th>
                    <th style={{ padding: '10px 12px' }}>Event Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                        {log.timestamp}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{log.actorEmail}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: log.action.includes('APPROVED') || log.action.includes('HANDED') ? 'rgba(16, 185, 129, 0.15)' :
                                      log.action.includes('REJECTED') ? 'rgba(244, 63, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: log.action.includes('APPROVED') || log.action.includes('HANDED') ? '#34d399' :
                                 log.action.includes('REJECTED') ? '#f43f5e' : '#60a5fa'
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                        {log.targetType} #{log.targetId}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REVIEW MODAL */}
        {reviewingClaim && (
          <div className="modal-overlay" onClick={() => setReviewingClaim(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {reviewDecision === 'APPROVED' ? 'Approve Ownership Claim' : 'Reject Ownership Claim'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Claim #{reviewingClaim.id} for {reviewingClaim.item?.name}
                </p>
              </div>

              <form onSubmit={handleReviewSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Recorded Administrative Reason *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder={reviewDecision === 'APPROVED' ? 'State evidence verified (e.g. serial number match, photo receipt match)' : 'State reason for rejection (e.g. proof does not match physical item markings)'}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" onClick={() => setReviewingClaim(null)} className="btn-secondary" disabled={isProcessing}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ backgroundColor: reviewDecision === 'APPROVED' ? '#059669' : '#e11d48' }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Recording...' : `Confirm ${reviewDecision}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* HANDOVER MODAL */}
        {handoverClaim && (
          <div className="modal-overlay" onClick={() => setHandoverClaim(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  Confirm Physical Handover
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Transferring custody of Item #{handoverClaim.itemId} to {handoverClaim.claimantName}
                </p>
              </div>

              <form onSubmit={handleHandoverSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Handover Notes &amp; Identity Verification *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={handoverNotes}
                    onChange={e => setHandoverNotes(e.target.value)}
                    placeholder="e.g., Student ID card inspected, item tested and custody transferred at security desk."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div style={{
                  padding: '12px',
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid var(--primary-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  color: '#93c5fd'
                }}>
                  Confirming handover will mark this report as <strong>RETURNED</strong> and close all associated claim records.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" onClick={() => setHandoverClaim(null)} className="btn-secondary" disabled={isProcessing}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={isProcessing}>
                    {isProcessing ? 'Finalizing Handover...' : 'Confirm Delivery & Close Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
