import React from 'react';
import type { Notification } from '../types';
import { 
  X, Bell, CheckCircle2, Phone, Mail, Sparkles, AlertTriangle, 
  CheckCheck, ArrowRight, PackageCheck, UserCheck, ShieldCheck 
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead: (id: number) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
  onClearAll: () => Promise<void>;
  onConfirmReceived?: (claimId: number) => Promise<void>;
  onNavigateToTab?: (tab: 'directory' | 'matches' | 'activity' | 'admin') => void;
  onOpenPopup?: (notification: Notification) => void;
  currentUser: string;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  onConfirmReceived,
  onNavigateToTab,
  onOpenPopup,
  currentUser
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'MATCH_FOUND':
        return <Sparkles size={18} color="#0284c7" />;
      case 'CLAIM_REQUESTED':
        return <AlertTriangle size={18} color="#d97706" />;
      case 'CLAIM_ACCEPTED':
        return <UserCheck size={18} color="#16a34a" />;
      case 'ITEM_RETURNED':
        return <PackageCheck size={18} color="#059669" />;
      default:
        return <Bell size={18} color="#64748b" />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: 540, 
          width: '92%', 
          maxHeight: '85vh', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: 'rgba(2, 132, 199, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Bell size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Notifications
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Records for <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{currentUser}</span>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
                title="Mark all as read"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'var(--bg-surface)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
              aria-label="Close notification panel"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                color: 'var(--text-muted)'
              }}>
                <Bell size={24} />
              </div>
              <p style={{ fontSize: '0.96rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>No Notifications Yet</p>
              <p style={{ fontSize: '0.82rem', margin: '6px 0 0 0' }}>
                You will be notified here when matches are found, claims are submitted, or contact details are shared.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => { if (!n.read) onMarkRead(n.id); }}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: n.read ? '#ffffff' : 'rgba(2, 132, 199, 0.04)',
                  border: n.read ? '1px solid var(--border-subtle)' : '1.5px solid rgba(2, 132, 199, 0.35)',
                  boxShadow: n.read ? 'none' : '0 2px 10px rgba(2, 132, 199, 0.06)',
                  position: 'relative',
                  transition: 'background-color 0.15s ease'
                }}
              >
                {!n.read && (
                  <span style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)'
                  }} />
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{
                    width: 34,
                    height: 34,
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getNotificationIcon(n.type)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <h4 style={{
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        margin: 0,
                        color: 'var(--text-primary)',
                        paddingRight: n.read ? 0 : 16
                      }}>
                        {n.title}
                      </h4>
                    </div>

                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 8px 0', lineHeight: 1.45 }}>
                      {n.message}
                    </p>

                    {/* Contact Details Card (if shared upon claim acceptance) */}
                    {(n.contactName || n.contactEmail || n.contactPhone) && (
                      <div style={{
                        marginTop: 10,
                        marginBottom: 10,
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(22, 163, 74, 0.08)',
                        border: '1px solid rgba(22, 163, 74, 0.25)'
                      }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#15803d', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Shared Contact Details:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                          {n.contactName && <div><strong>Name:</strong> {n.contactName}</div>}
                          {n.contactEmail && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Mail size={14} color="#15803d" />
                              <a href={`mailto:${n.contactEmail}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                                {n.contactEmail}
                              </a>
                            </div>
                          )}
                          {n.contactPhone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Phone size={14} color="#15803d" />
                              <a href={`tel:${n.contactPhone}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                                {n.contactPhone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons for specific notification types */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                      {n.type === 'MATCH_FOUND' && onNavigateToTab && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigateToTab('matches');
                          }}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--primary)',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          View Match Details <ArrowRight size={13} />
                        </button>
                      )}

                      {n.requiresAction && onOpenPopup && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenPopup(n);
                          }}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          <ShieldCheck size={14} /> Respond to Request
                        </button>
                      )}

                      {n.type === 'CLAIM_REQUESTED' && !n.requiresAction && onNavigateToTab && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigateToTab('activity');
                          }}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#d97706',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          Review Claim in My Activity <ArrowRight size={13} />
                        </button>
                      )}

                      {/* Lost owner confirms item receipt */}
                      {n.type === 'CLAIM_ACCEPTED' && n.claimId && onConfirmReceived && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm("Confirm that you received your item/belongings back? This will mark the recovery as complete.")) {
                              await onConfirmReceived(n.claimId!);
                              onClose();
                            }
                          }}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            backgroundColor: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          <CheckCircle2 size={14} /> Confirm Item Received
                        </button>
                      )}

                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        {n.createdAt}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {notifications.length} total saved notification record{notifications.length === 1 ? '' : 's'}
            </span>
            <button
              onClick={onClearAll}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.78rem',
                color: 'var(--lost-color)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear all records
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
