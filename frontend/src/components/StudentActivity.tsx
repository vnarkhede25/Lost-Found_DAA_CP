import React, { useState, useEffect } from 'react';
import {
  FileText, Clock, CheckCircle2, AlertCircle,
  Package, Edit3, Trash2, Phone, Mail, UserCheck, Inbox, ArrowRight,
  ShieldCheck, XCircle, Share2
} from 'lucide-react';
import type { Item, Claim } from '../types';
import { apiClient } from '../api/client';

interface StudentActivityProps {
  currentUserEmail: string;
  items: Item[];
  onRefreshData: () => void;
  onEditItem: (item: Item) => void;
  onOpenNotifications?: () => void;
}

export const StudentActivity: React.FC<StudentActivityProps> = ({
  currentUserEmail,
  items,
  onRefreshData,
  onEditItem,
  onOpenNotifications
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'claims' | 'incoming'>('reports');
  const [userClaims, setUserClaims] = useState<Claim[]>([]);
  const [allClaims, setAllClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Finder review state for incoming claims
  const [reviewingClaimId, setReviewingClaimId] = useState<number | null>(null);
  const [reviewStep, setReviewStep] = useState<'initial' | 'asking_contacts' | 'rejecting'>('initial');
  const [finderSharePhone, setFinderSharePhone] = useState(true);
  const [finderShareEmail, setFinderShareEmail] = useState(true);
  const [finderShareBoth, setFinderShareBoth] = useState(true);
  const [finderRejectReason, setFinderRejectReason] = useState('');
  const [submittingClaimId, setSubmittingClaimId] = useState<number | null>(null);

  // Claimant contact sharing state for user's own claims
  const [claimantShareClaimId, setClaimantShareClaimId] = useState<number | null>(null);
  const [claimantPhone, setClaimantPhone] = useState(true);
  const [claimantEmail, setClaimantEmail] = useState(true);
  const [claimantBoth, setClaimantBoth] = useState(true);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const [myClaims, all] = await Promise.all([
        apiClient.getMyClaims(currentUserEmail),
        apiClient.getAllClaims()
      ]);
      setUserClaims(myClaims);
      setAllClaims(all);
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [currentUserEmail]);

  const myReports = items.filter(
    i => i.reporterEmail && i.reporterEmail.toLowerCase() === currentUserEmail.toLowerCase()
  );

  // Incoming claims submitted by others on items that I found
  const myFoundItemIds = new Set(
    items.filter(i => i.type === 'FOUND' && i.reporterEmail && i.reporterEmail.toLowerCase() === currentUserEmail.toLowerCase())
      .map(i => i.id)
  );

  const incomingClaims = allClaims.filter(c => myFoundItemIds.has(c.itemId));

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

  const handleStartFinderReview = (claimId: number) => {
    setReviewingClaimId(claimId);
    setReviewStep('initial');
    setFinderSharePhone(true);
    setFinderShareEmail(true);
    setFinderShareBoth(true);
    setFinderRejectReason('');
  };

  const handleFinderToggleBoth = (checked: boolean) => {
    setFinderShareBoth(checked);
    setFinderSharePhone(checked);
    setFinderShareEmail(checked);
  };

  const handleFinderTogglePhone = (checked: boolean) => {
    setFinderSharePhone(checked);
    if (!checked) setFinderShareBoth(false);
    else if (finderShareEmail) setFinderShareBoth(true);
  };

  const handleFinderToggleEmail = (checked: boolean) => {
    setFinderShareEmail(checked);
    if (!checked) setFinderShareBoth(false);
    else if (finderSharePhone) setFinderShareBoth(true);
  };

  const handleFinderSubmitVerification = async (claimId: number, isCorrect: boolean, willShare: boolean) => {
    setActionError('');
    setActionSuccess('');
    setSubmittingClaimId(claimId);
    try {
      await apiClient.verifyAndShareClaim(
        claimId,
        currentUserEmail,
        isCorrect,
        willShare ? finderSharePhone : false,
        willShare ? finderShareEmail : false,
        isCorrect
          ? (willShare ? 'Verified correct. Shared contact details.' : 'Verified correct. Kept private.')
          : (finderRejectReason.trim() || 'Proof does not match item.')
      );
      setActionSuccess(isCorrect ? "Claim verified! Mutual contact sharing notification sent to claimant." : "Claim marked as incorrect/rejected.");
      setReviewingClaimId(null);
      await fetchClaims();
      onRefreshData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit verification');
    } finally {
      setSubmittingClaimId(null);
    }
  };

  const handleClaimantToggleBoth = (checked: boolean) => {
    setClaimantBoth(checked);
    setClaimantPhone(checked);
    setClaimantEmail(checked);
  };

  const handleClaimantTogglePhone = (checked: boolean) => {
    setClaimantPhone(checked);
    if (!checked) setClaimantBoth(false);
    else if (claimantEmail) setClaimantBoth(true);
  };

  const handleClaimantToggleEmail = (checked: boolean) => {
    setClaimantEmail(checked);
    if (!checked) setClaimantBoth(false);
    else if (claimantPhone) setClaimantBoth(true);
  };

  const handleClaimantSubmitContacts = async (claimId: number, share: boolean) => {
    setActionError('');
    setActionSuccess('');
    setSubmittingClaimId(claimId);
    try {
      await apiClient.claimantShareContact(
        claimId,
        currentUserEmail,
        share,
        share ? claimantPhone : false,
        share ? claimantEmail : false
      );
      setActionSuccess("Contact sharing preference submitted! Mutual details exchanged with the finder.");
      setClaimantShareClaimId(null);
      await fetchClaims();
      onRefreshData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit contact preferences');
    } finally {
      setSubmittingClaimId(null);
    }
  };

  const handleConfirmReceived = async (claimId: number) => {
    if (!confirm("Confirm that you received your item back? This will update both reports to RETURNED and close the claim.")) {
      return;
    }
    setActionError('');
    setActionSuccess('');
    try {
      await apiClient.confirmReceived(claimId, currentUserEmail);
      setActionSuccess("Awesome! Item marked as RETURNED. Glad your belongings are back with you!");
      await fetchClaims();
      onRefreshData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to confirm item received');
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px 60px' }}>
      {/* Title & Tabs Card */}
      <div className="card" style={{ padding: '24px', marginBottom: 24, backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              My Activity &amp; Peer Recovery
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              Track your reports, review claims filed on items you found, and coordinate safe returns.
            </p>
          </div>

          {/* Sub-tab Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            padding: 4,
            border: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: 4
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
            <button
              onClick={() => setActiveTab('incoming')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: activeTab === 'incoming' ? '#ffffff' : 'transparent',
                color: activeTab === 'incoming' ? 'var(--found-color)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'incoming' ? 700 : 500,
                fontSize: '0.86rem',
                boxShadow: activeTab === 'incoming' ? 'var(--shadow-xs)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Inbox size={16} /> Claims on My Found Items ({incomingClaims.length})
            </button>
          </div>
        </div>
      </div>

      {/* Action Banners */}
      {actionSuccess && (
        <div style={{
          padding: '12px 18px',
          backgroundColor: 'rgba(22, 163, 74, 0.1)',
          color: '#15803d',
          border: '1.5px solid rgba(22, 163, 74, 0.3)',
          borderRadius: '12px',
          marginBottom: 20,
          fontWeight: 600,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div style={{
          padding: '12px 18px',
          backgroundColor: 'var(--lost-bg)',
          color: 'var(--lost-color)',
          border: '1.5px solid var(--lost-border)',
          borderRadius: '12px',
          marginBottom: 20,
          fontWeight: 600,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <AlertCircle size={18} />
          <span>{actionError}</span>
        </div>
      )}

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

      {/* Claims Filed by Me */}
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
                        {claim.status === 'RETURNED_HANDED_OVER' ? 'RETURNED & RECOVERED' : claim.status}
                      </span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 8, marginBottom: 2 }}>
                        {claim.item ? claim.item.name : `Claim on Item #${claim.itemId}`}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Filed on {claim.createdAt}
                      </div>
                    </div>

                    {/* Confirm Item Received Button for Claimant */}
                    {claim.status === 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => handleConfirmReceived(claim.id)}
                        style={{
                          padding: '10px 18px',
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
                        }}
                      >
                        <CheckCircle2 size={16} /> Confirm Item Received
                      </button>
                    )}
                  </div>

                  {/* Shared Contact Info Box when approved */}
                  {(claim.status === 'APPROVED' || claim.status === 'RETURNED_HANDED_OVER') && (
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(22, 163, 74, 0.08)',
                      border: '1px solid rgba(22, 163, 74, 0.25)',
                      marginBottom: 12
                    }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', marginBottom: 4, textTransform: 'uppercase' }}>
                        Finder Contact Details:
                      </div>
                      <div style={{ fontSize: '0.86rem', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                        <span><strong>Name:</strong> {claim.finderName || claim.item?.reporterName || 'Item Finder'}</span>
                        {claim.finderEmail && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Mail size={14} color="#15803d" />
                            <a href={`mailto:${claim.finderEmail}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                              {claim.finderEmail}
                            </a>
                          </span>
                        )}
                        {claim.finderPhone && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Phone size={14} color="#15803d" />
                            <a href={`tel:${claim.finderPhone}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                              {claim.finderPhone}
                            </a>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Claimant Contact Sharing Box if not yet shared */}
                  {claim.status === 'APPROVED' && (!claim.claimantSharePhone && !claim.claimantShareEmail) && (
                    <div style={{
                      padding: '16px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(2, 132, 199, 0.06)',
                      border: '1.5px solid rgba(2, 132, 199, 0.25)',
                      marginBottom: 14
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0369a1', fontWeight: 800, fontSize: '0.94rem', marginBottom: 4 }}>
                        <Share2 size={18} /> Finder Verified Your Claim! Share Your Contacts?
                      </div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                        Choose which contact details to share with the finder so you can arrange safe return of your belongings:
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        padding: '10px 12px',
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid var(--border-medium)',
                        marginBottom: 12
                      }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={claimantPhone}
                            onChange={(e) => handleClaimantTogglePhone(e.target.checked)}
                            style={{ width: 16, height: 16, accentColor: '#0284c7' }}
                          />
                          <Phone size={15} color="#0284c7" /> Share Phone Number
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={claimantEmail}
                            onChange={(e) => handleClaimantToggleEmail(e.target.checked)}
                            style={{ width: 16, height: 16, accentColor: '#0284c7' }}
                          />
                          <Mail size={15} color="#0284c7" /> Share Email Address
                        </label>
                        <div style={{ borderTop: '1px dashed var(--border-medium)', paddingTop: 6 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 700, color: '#0369a1', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={claimantBoth}
                              onChange={(e) => handleClaimantToggleBoth(e.target.checked)}
                              style={{ width: 16, height: 16, accentColor: '#0284c7' }}
                            />
                            Share Both Phone &amp; Email
                          </label>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          disabled={submittingClaimId === claim.id}
                          onClick={() => handleClaimantSubmitContacts(claim.id, false)}
                          style={{
                            padding: '8px 14px',
                            backgroundColor: 'transparent',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-medium)',
                            borderRadius: '6px',
                            fontSize: '0.84rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Keep Private
                        </button>
                        <button
                          type="button"
                          disabled={submittingClaimId === claim.id || (!claimantPhone && !claimantEmail)}
                          onClick={() => handleClaimantSubmitContacts(claim.id, true)}
                          style={{
                            padding: '8px 18px',
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            cursor: (!claimantPhone && !claimantEmail) ? 'not-allowed' : 'pointer',
                            opacity: (!claimantPhone && !claimantEmail) ? 0.6 : 1
                          }}
                        >
                          {submittingClaimId === claim.id ? 'Saving...' : 'Share Contacts with Finder'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submitted Ownership Proof */}
                  <div style={{
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.84rem'
                  }}>
                    <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: 2 }}>Submitted Ownership Proof:</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{claim.descriptionProof}</span>
                  </div>

                  {claim.adminNotes && (
                    <div style={{
                      marginTop: 10,
                      padding: '10px 14px',
                      backgroundColor: claim.status === 'APPROVED' ? 'var(--found-bg)' : 'var(--lost-bg)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.84rem',
                      color: claim.status === 'APPROVED' ? 'var(--found-color)' : 'var(--lost-color)'
                    }}>
                      <strong>Note:</strong> {claim.adminNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Claims Received on My Found Items */}
      {activeTab === 'incoming' && (
        <div>
          {incomingClaims.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff' }}>
              <Inbox size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 6 }}>No Claims on Your Found Items</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                When someone spots an item you found and submits ownership proof, you will review and accept it here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {incomingClaims.map((claim) => (
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
                        {claim.status === 'RETURNED_HANDED_OVER' ? 'RETURNED & RECOVERED' : claim.status}
                      </span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 8, marginBottom: 2 }}>
                        {claim.item ? claim.item.name : `Item #${claim.itemId}`}
                      </h4>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Claimant: <strong>{claim.claimantName}</strong> ({claim.claimantEmail})
                      </div>
                    </div>

                    {/* Review Claim Trigger for Finder */}
                    {claim.status === 'PENDING' && reviewingClaimId !== claim.id && (
                      <button
                        type="button"
                        onClick={() => handleStartFinderReview(claim.id)}
                        style={{
                          padding: '10px 18px',
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                        }}
                      >
                        <ShieldCheck size={16} /> Review Claim Proof
                      </button>
                    )}
                  </div>

                  {/* Submitted Proof Description */}
                  <div style={{
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-subtle)',
                    fontSize: '0.86rem',
                    marginBottom: 12
                  }}>
                    <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: 2 }}>
                      Claimant's Submitted Identification Proof:
                    </strong>
                    <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{claim.descriptionProof}"</span>
                    {claim.contactPhone && (
                      <div style={{ marginTop: 6, color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                        <strong>Claimant Phone:</strong> {claim.contactPhone}
                      </div>
                    )}
                  </div>

                  {/* Finder Inline Review Panel */}
                  {claim.status === 'PENDING' && reviewingClaimId === claim.id && (
                    <div style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(2, 132, 199, 0.05)',
                      border: '1.5px solid rgba(2, 132, 199, 0.3)',
                      marginBottom: 12
                    }}>
                      {/* Step 1: Correct Claim YES / NO */}
                      {reviewStep === 'initial' && (
                        <div>
                          <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                            Is this a correct claim?
                          </div>
                          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                            Does the ownership proof above correctly match the item you found?
                          </div>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => setReviewStep('asking_contacts')}
                              style={{
                                padding: '10px 18px',
                                backgroundColor: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6
                              }}
                            >
                              <CheckCircle2 size={16} /> Yes, Correct Claim
                            </button>
                            <button
                              type="button"
                              onClick={() => setReviewStep('rejecting')}
                              style={{
                                padding: '10px 18px',
                                backgroundColor: 'var(--bg-surface)',
                                color: 'var(--lost-color)',
                                border: '1.5px solid var(--lost-border)',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6
                              }}
                            >
                              <XCircle size={16} /> No, Incorrect
                            </button>
                            <button
                              type="button"
                              onClick={() => setReviewingClaimId(null)}
                              style={{
                                padding: '10px 14px',
                                backgroundColor: 'transparent',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-medium)',
                                borderRadius: '8px',
                                fontSize: '0.86rem',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Yes -> Ask to share contacts with checkboxes */}
                      {reviewStep === 'asking_contacts' && (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#15803d', fontWeight: 800, fontSize: '0.95rem', marginBottom: 4 }}>
                            <ShieldCheck size={18} /> Claim Verified as Correct!
                          </div>
                          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                            Select which contact details to share with the claimant:
                          </div>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                            padding: '10px 12px',
                            backgroundColor: '#ffffff',
                            borderRadius: '8px',
                            border: '1px solid rgba(22, 163, 74, 0.2)',
                            marginBottom: 12
                          }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={finderSharePhone}
                                onChange={(e) => handleFinderTogglePhone(e.target.checked)}
                                style={{ width: 16, height: 16, accentColor: '#16a34a' }}
                              />
                              <Phone size={15} color="#16a34a" /> Share Phone Number
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={finderShareEmail}
                                onChange={(e) => handleFinderToggleEmail(e.target.checked)}
                                style={{ width: 16, height: 16, accentColor: '#16a34a' }}
                              />
                              <Mail size={15} color="#16a34a" /> Share Email Address
                            </label>
                            <div style={{ borderTop: '1px dashed var(--border-medium)', paddingTop: 6 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 700, color: '#15803d', cursor: 'pointer' }}>
                                <input
                                type="checkbox"
                                checked={finderShareBoth}
                                onChange={(e) => handleFinderToggleBoth(e.target.checked)}
                                style={{ width: 16, height: 16, accentColor: '#16a34a' }}
                              />
                              Share Both Phone &amp; Email
                            </label>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => setReviewStep('initial')}
                            style={{
                              padding: '8px 14px',
                              backgroundColor: 'transparent',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-medium)',
                              borderRadius: '6px',
                              fontSize: '0.84rem',
                              cursor: 'pointer'
                            }}
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            disabled={submittingClaimId === claim.id}
                            onClick={() => handleFinderSubmitVerification(claim.id, true, false)}
                            style={{
                              padding: '8px 14px',
                              backgroundColor: 'transparent',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-medium)',
                              borderRadius: '6px',
                              fontSize: '0.84rem',
                              cursor: 'pointer'
                            }}
                          >
                            Keep Private
                          </button>
                          <button
                            type="button"
                            disabled={submittingClaimId === claim.id || (!finderSharePhone && !finderShareEmail)}
                            onClick={() => handleFinderSubmitVerification(claim.id, true, true)}
                            style={{
                              padding: '8px 18px',
                              backgroundColor: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.84rem',
                              fontWeight: 700,
                              cursor: (!finderSharePhone && !finderShareEmail) ? 'not-allowed' : 'pointer',
                              opacity: (!finderSharePhone && !finderShareEmail) ? 0.6 : 1
                            }}
                          >
                            {submittingClaimId === claim.id ? 'Saving...' : 'Confirm & Share Contacts'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: No -> Input reason and confirm reject */}
                    {reviewStep === 'rejecting' && (
                      <div>
                        <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--lost-color)', marginBottom: 4 }}>
                          Decline Claim
                        </div>
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                          Explain why the proof is incorrect:
                        </div>
                        <input
                          type="text"
                          value={finderRejectReason}
                          onChange={(e) => setFinderRejectReason(e.target.value)}
                          placeholder="e.g. Color does not match, serial number incorrect..."
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-medium)',
                            fontSize: '0.86rem',
                            marginBottom: 10
                          }}
                        />
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => setReviewStep('initial')}
                            style={{
                              padding: '8px 14px',
                              backgroundColor: 'transparent',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-medium)',
                              borderRadius: '6px',
                              fontSize: '0.84rem',
                              cursor: 'pointer'
                            }}
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            disabled={submittingClaimId === claim.id}
                            onClick={() => handleFinderSubmitVerification(claim.id, false, false)}
                            style={{
                              padding: '8px 18px',
                              backgroundColor: '#dc2626',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.84rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {submittingClaimId === claim.id ? 'Rejecting...' : 'Confirm Reject'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                  {/* Contact Shared status */}
                  {claim.status === 'APPROVED' && (
                    <div style={{
                      padding: '10px 14px',
                      backgroundColor: 'rgba(22, 163, 74, 0.08)',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      color: '#15803d',
                      fontWeight: 600
                    }}>
                      ✓ You accepted this claim! Contact details have been shared via notifications. Awaiting owner's receipt confirmation.
                    </div>
                  )}

                  {claim.status === 'RETURNED_HANDED_OVER' && (
                    <div style={{
                      padding: '10px 14px',
                      backgroundColor: 'rgba(5, 150, 105, 0.1)',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      color: '#059669',
                      fontWeight: 700
                    }}>
                      ✓ Item safely returned to owner! Case complete.
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
