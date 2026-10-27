import React, { useState, useEffect } from 'react';
import {
  FileText, Clock, CheckCircle2, XCircle, AlertCircle,
  Package, Edit3, Trash2, Shield, Calendar, MapPin, ChevronRight
} from 'lucide-react';
import type { Item, Claim } from '../types';
import { apiClient } from '../api/client';

interface StudentActivityProps {
  currentUserEmail: string;
  items: Item[];
  onRefreshData: () => void;
  onEditItem: (item: Item) => void;
}

export const StudentActivity: React.FC<StudentActivityProps> = ({
  currentUserEmail,
  items,
  onRefreshData,
  onEditItem
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'claims'>('reports');
  const [userClaims, setUserClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserClaims = async () => {
    setLoading(true);
    try {
      const claims = await apiClient.getMyClaims(currentUserEmail);
      setUserClaims(claims);
    } catch (err) {
      console.error('Error fetching user claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserClaims();
  }, [currentUserEmail]);

  const myReports = items.filter(
    i => i.reporterEmail && i.reporterEmail.toLowerCase() === currentUserEmail.toLowerCase()
  );

  const handleWithdraw = async (item: Item) => {
    if (!confirm(`Are you sure you want to withdraw the report for "${item.name}"? It will be marked as CLOSED.`)) {
      return;
    }
    try {
      await apiClient.withdrawItem(item.id, currentUserEmail);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to withdraw item');
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px 60px' }}>
      {/* Title & Tabs Card */}
      <div className="card" style={{ padding: '24px', marginBottom: 24, backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              My Activity Dashboard
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              Track your reported lost &amp; found items and review live claim verification statuses.
            </p>
          </div>

          {/* Sub-tab Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            padding: 4,
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => setActiveTab('reports')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: activeTab === 'reports' ? '#ffffff' : 'transparent',
                color: activeTab === 'reports' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'reports' ? 700 : 500,
                fontSize: '0.86rem',
                boxShadow: activeTab === 'reports' ? 'var(--shadow-xs)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <FileText size={16} /> My Reports ({myReports.length})
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: activeTab === 'claims' ? '#ffffff' : 'transparent',
                color: activeTab === 'claims' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'claims' ? 700 : 500,
                fontSize: '0.86rem',
                boxShadow: activeTab === 'claims' ? 'var(--shadow-xs)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Clock size={16} /> My Claims ({userClaims.length})
            </button>
          </div>
        </div>
      </div>

      {/* Reports Tab Content */}
      {activeTab === 'reports' && (
        <div>
          {myReports.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff' }}>
              <Package size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 6 }}>No Reports Published Yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                You have not submitted any lost or found items under {currentUserEmail}.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {myReports.map((item) => (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 16,
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 260 }}>
                    <img
                      src={item.photoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
                      alt={item.name}
                      style={{ width: 68, height: 68, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span className={`badge ${item.type === 'LOST' ? 'badge-lost' : 'badge-found'}`}>
                          {item.type}
                        </span>
                        <span className={`badge ${
                          item.status === 'OPEN' ? 'badge-found' :
                          item.status === 'CLAIM_PENDING' ? 'badge-pending' :
                          item.status === 'RETURNED' ? 'badge-returned' : 'badge-lost'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.08rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        {item.name}
                      </h4>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {item.location} • Reported on {item.date}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      onClick={() => onEditItem(item)}
                      className="btn-secondary"
                      style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                    >
                      <Edit3 size={14} /> View Details
                    </button>
                    {item.status !== 'CLOSED' && item.status !== 'RETURNED' && (
                      <button
                        onClick={() => handleWithdraw(item)}
                        className="btn-destructive"
                      >
                        <Trash2 size={14} /> Withdraw
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Claims Tab Content */}
      {activeTab === 'claims' && (
        <div>
          {userClaims.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff' }}>
              <Clock size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 6 }}>No Claims Filed</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                When you discover a found item matching your belongings and submit verification proof, track it here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {userClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="card"
                  style={{
                    padding: '20px 24px',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                    <div>
                      <span className={`badge ${
                        claim.status === 'APPROVED' ? 'badge-found' :
                        claim.status === 'REJECTED' ? 'badge-lost' :
                        claim.status === 'RETURNED_HANDED_OVER' ? 'badge-returned' : 'badge-pending'
                      }`}>
                        {claim.status}
                      </span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 8, marginBottom: 2 }}>
                        Claim on Item #{claim.itemId}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Filed on {new Date(claim.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Security Review</span>
                      <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                        {claim.reviewedBy ? `Reviewed by ${claim.reviewedBy}` : 'Pending Admin Verification'}
                      </strong>
                    </div>
                  </div>

                  {/* Secret Evidence Submitted */}
                  <div style={{
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.84rem'
                  }}>
                    <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: 2 }}>Submitted Ownership Proof:</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{claim.secretProof}</span>
                  </div>

                  {/* Admin notes if reviewed */}
                  {claim.adminNotes && (
                    <div style={{
                      marginTop: 10,
                      padding: '10px 14px',
                      backgroundColor: claim.status === 'APPROVED' ? 'var(--found-bg)' : 'var(--lost-bg)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.84rem',
                      color: claim.status === 'APPROVED' ? 'var(--found-color)' : 'var(--lost-color)'
                    }}>
                      <strong>Admin Note:</strong> {claim.adminNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
