import React, { useState, useEffect } from 'react';
import type { Notification } from '../types';
import { 
  Bell, X, CheckCircle2, XCircle, ShieldCheck, 
  Phone, Mail, ArrowRight, Volume2 
} from 'lucide-react';
import { playNotificationSound } from '../utils/audio';

interface NotificationPopupProps {
  notification: Notification | null;
  currentUserEmail: string;
  onClose: () => void;
  onVerifyAndShare: (
    claimId: number,
    isCorrect: boolean,
    sharePhone: boolean,
    shareEmail: boolean,
    notes?: string
  ) => Promise<void>;
  onClaimantShareContact: (
    claimId: number,
    shareContact: boolean,
    sharePhone: boolean,
    shareEmail: boolean
  ) => Promise<void>;
  onConfirmReceived?: (claimId: number) => Promise<void>;
  onNavigateToTab?: (tab: 'directory' | 'matches' | 'activity' | 'admin') => void;
}

export const NotificationPopup: React.FC<NotificationPopupProps> = ({
  notification,
  currentUserEmail,
  onClose,
  onVerifyAndShare,
  onClaimantShareContact,
  onConfirmReceived,
  onNavigateToTab
}) => {
  if (!notification) return null;

  // Sound trigger on popup
  useEffect(() => {
    playNotificationSound();
  }, [notification.id]);

  // Finder state: correct claim yes/no step
  // 'initial' | 'asking_contacts' | 'rejecting'
  const [finderStep, setFinderStep] = useState<'initial' | 'asking_contacts' | 'rejecting'>('initial');
  const [sharePhone, setSharePhone] = useState(true);
  const [shareEmail, setShareEmail] = useState(true);
  const [shareBoth, setShareBoth] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle "Share Both"
  const handleToggleBoth = (checked: boolean) => {
    setShareBoth(checked);
    setSharePhone(checked);
    setShareEmail(checked);
  };

  const handleTogglePhone = (checked: boolean) => {
    setSharePhone(checked);
    if (!checked) setShareBoth(false);
    else if (shareEmail) setShareBoth(true);
  };

  const handleToggleEmail = (checked: boolean) => {
    setShareEmail(checked);
    if (!checked) setShareBoth(false);
    else if (sharePhone) setShareBoth(true);
  };

  const handleFinderVerifyYes = () => {
    // Moves to sharing contact details in the exact same notification popup
    setFinderStep('asking_contacts');
  };

  const handleFinderVerifyNo = () => {
    setFinderStep('rejecting');
  };

  const handleConfirmFinderSubmission = async (willShare: boolean) => {
    if (!notification.claimId) return;
    setIsSubmitting(true);
    try {
      await onVerifyAndShare(
        notification.claimId,
        true,
        willShare ? sharePhone : false,
        willShare ? shareEmail : false,
        willShare ? 'Verified correct. Shared contact details.' : 'Verified correct. Contact details kept private.'
      );
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to submit verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRejection = async () => {
    if (!notification.claimId) return;
    setIsSubmitting(true);
    try {
      await onVerifyAndShare(
        notification.claimId,
        false,
        false,
        false,
        rejectReason.trim() || 'Proof does not match item.'
      );
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to reject claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimantShareSubmit = async (willShare: boolean) => {
    if (!notification.claimId) return;
    setIsSubmitting(true);
    try {
      await onClaimantShareContact(
        notification.claimId,
        willShare,
        willShare ? sharePhone : false,
        willShare ? shareEmail : false
      );
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to submit contact preferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1300 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 520,
          width: '92%',
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1.5px solid rgba(56, 189, 248, 0.4)'
        }}
      >
        {/* Top Sound & Notification Banner */}
        <div style={{
          padding: '14px 20px',
          background: 'linear-gradient(135deg, #0b1426 0%, #1e293b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: 'rgba(56, 189, 248, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <Bell size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                Campus Alert
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: '#38bdf8',
                  color: '#0f172a',
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  Live
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Audible Chime Triggered
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => playNotificationSound()}
              title="Replay Sound"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#cbd5e1',
                cursor: 'pointer'
              }}
            >
              <Volume2 size={16} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#cbd5e1',
                cursor: 'pointer'
              }}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            {notification.title}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.45 }}>
            {notification.message}
          </p>

          {/* 1. FINDER WORKFLOW: Verify Claim Correct Yes/No & Share Contacts */}
          {notification.actionType === 'VERIFY_CLAIM' && (
            <div>
              {/* Proof Card */}
              {notification.proofText && (
                <div style={{
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1.5px solid var(--border-medium)',
                  marginBottom: 18
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Submitted Ownership Proof:
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.4 }}>
                    "{notification.proofText}"
                  </div>
                  {notification.contactName && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                      Submitted by: <strong>{notification.contactName}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Step 1: Correct Claim YES / NO */}
              {finderStep === 'initial' && (
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(2, 132, 199, 0.05)',
                  border: '1.5px solid rgba(2, 132, 199, 0.25)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                    Is this claim correct?
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                    Does the description and proof above match the item you found?
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <button
                      type="button"
                      onClick={handleFinderVerifyYes}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.94rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                      }}
                    >
                      <CheckCircle2 size={18} /> Yes, Correct Claim
                    </button>
                    <button
                      type="button"
                      onClick={handleFinderVerifyNo}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--lost-color)',
                        border: '1.5px solid var(--lost-border)',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.94rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      <XCircle size={18} /> No, Incorrect
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Finder says YES -> Ask to Share Contacts with Checkboxes */}
              {finderStep === 'asking_contacts' && (
                <div style={{
                  padding: '18px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(22, 163, 74, 0.06)',
                  border: '1.5px solid rgba(22, 163, 74, 0.3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#15803d', fontWeight: 800, fontSize: '0.98rem', marginBottom: 4 }}>
                    <ShieldCheck size={20} /> Claim Verified as Correct!
                  </div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                    Do you want to share your contact details with the claimant so they can contact you and retrieve their item?
                  </div>

                  {/* Contact Sharing Options with Checkboxes */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(22, 163, 74, 0.2)',
                    marginBottom: 16
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={sharePhone}
                        onChange={(e) => handleTogglePhone(e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: '#16a34a', cursor: 'pointer' }}
                      />
                      <Phone size={16} color="#16a34a" /> Share Phone Number
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={shareEmail}
                        onChange={(e) => handleToggleEmail(e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: '#16a34a', cursor: 'pointer' }}
                      />
                      <Mail size={16} color="#16a34a" /> Share Email Address
                    </label>

                    <div style={{ borderTop: '1px dashed var(--border-medium)', paddingTop: 8 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', fontWeight: 700, color: '#15803d', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={shareBoth}
                          onChange={(e) => handleToggleBoth(e.target.checked)}
                          style={{ width: 18, height: 18, accentColor: '#16a34a', cursor: 'pointer' }}
                        />
                        <span>Share Both Phone &amp; Email</span>
                      </label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleConfirmFinderSubmission(false)}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: 'transparent',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '8px',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      No, Keep Private
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting || (!sharePhone && !shareEmail)}
                      onClick={() => handleConfirmFinderSubmission(true)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        cursor: (!sharePhone && !shareEmail) ? 'not-allowed' : 'pointer',
                        opacity: (!sharePhone && !shareEmail) ? 0.6 : 1,
                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
                      }}
                    >
                      {isSubmitting ? 'Saving...' : 'Confirm & Share Contacts'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Finder says NO -> Provide reason and reject */}
              {finderStep === 'rejecting' && (
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--lost-bg)',
                  border: '1.5px solid var(--lost-border)'
                }}>
                  <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--lost-color)', marginBottom: 6 }}>
                    Decline Claim
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                    Please explain why this proof is incorrect (e.g. wrong color, serial number doesn't match):
                  </div>

                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Color and wallpaper do not match the found item..."
                    className="form-input"
                    style={{ marginBottom: 14 }}
                  />

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setFinderStep('initial')}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        cursor: 'pointer'
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleConfirmRejection}
                      style={{
                        padding: '8px 18px',
                        backgroundColor: 'var(--lost-color)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        cursor: 'pointer'
                      }}
                    >
                      {isSubmitting ? 'Declining...' : 'Confirm Decline'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. CLAIMANT WORKFLOW: Finder verified claim -> Claimant prompted to share contacts */}
          {notification.actionType === 'SHARE_CONTACT' && (
            <div style={{
              padding: '18px',
              borderRadius: '12px',
              backgroundColor: 'rgba(2, 132, 199, 0.06)',
              border: '1.5px solid rgba(2, 132, 199, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontWeight: 800, fontSize: '0.98rem', marginBottom: 6 }}>
                <CheckCircle2 size={20} color="#16a34a" /> The Finder Verified Your Claim!
              </div>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                Would you like to share your contact details with the finder to safely arrange the return of your belongings?
              </div>

              {/* Contact checkboxes */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-medium)',
                marginBottom: 16
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={sharePhone}
                    onChange={(e) => handleTogglePhone(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <Phone size={16} color="var(--primary)" /> Share Phone Number
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={shareEmail}
                    onChange={(e) => handleToggleEmail(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <Mail size={16} color="var(--primary)" /> Share Email Address
                </label>

                <div style={{ borderTop: '1px dashed var(--border-medium)', paddingTop: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={shareBoth}
                      onChange={(e) => handleToggleBoth(e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
                    />
                    <span>Share Both Phone &amp; Email</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleClaimantShareSubmit(false)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  No, Skip
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || (!sharePhone && !shareEmail)}
                  onClick={() => handleClaimantShareSubmit(true)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: (!sharePhone && !shareEmail) ? 'not-allowed' : 'pointer',
                    opacity: (!sharePhone && !shareEmail) ? 0.6 : 1,
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Share Selected Contacts'}
                </button>
              </div>
            </div>
          )}

          {/* 3. CLAIM_ACCEPTED: Show shared contact details and Confirm Received button */}
          {notification.type === 'CLAIM_ACCEPTED' && (
            <div>
              {(notification.contactName || notification.contactEmail || notification.contactPhone) && (
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(22, 163, 74, 0.08)',
                  border: '1.5px solid rgba(22, 163, 74, 0.3)',
                  marginBottom: 16
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', marginBottom: 8 }}>
                    Shared Contact Details:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.88rem' }}>
                    {notification.contactName && <div><strong>Name:</strong> {notification.contactName}</div>}
                    {notification.contactEmail && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Mail size={15} color="#15803d" />
                        <a href={`mailto:${notification.contactEmail}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                          {notification.contactEmail}
                        </a>
                      </div>
                    )}
                    {notification.contactPhone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Phone size={15} color="#15803d" />
                        <a href={`tel:${notification.contactPhone}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                          {notification.contactPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {notification.claimId && onConfirmReceived && (
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm("Confirm that you received your belongings back? This will mark the recovery as complete.")) {
                        await onConfirmReceived(notification.claimId!);
                        onClose();
                      }
                    }}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
                    }}
                  >
                    <CheckCircle2 size={18} /> I Got My Belongings! (Confirm Received)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. MATCH_FOUND or general notification actions */}
          {notification.type === 'MATCH_FOUND' && onNavigateToTab && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToTab('matches');
                }}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                View Match Details <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Fallback footer button if no special action required */}
          {!notification.requiresAction && notification.type !== 'MATCH_FOUND' && notification.type !== 'CLAIM_ACCEPTED' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-primary"
                style={{ padding: '8px 20px' }}
              >
                Got It
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
