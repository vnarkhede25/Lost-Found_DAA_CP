import React, { useState } from 'react';
import {
  PlusCircle, LogOut, Menu, X, User as UserIcon, Bell
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'directory' | 'matches' | 'activity' | 'admin';
  setActiveTab: (tab: 'directory' | 'matches' | 'activity' | 'admin') => void;
  onOpenReportModal: (type: 'LOST' | 'FOUND') => void;
  currentUser: string;
  currentUserName: string;
  userRole: 'STUDENT' | 'ADMIN';
  isLoggedIn: boolean;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  pendingClaimsCount: number;
  matchesCount: number;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  currentUser,
  currentUserName,
  userRole,
  isLoggedIn,
  onOpenAuth,
  onLogout,
  pendingClaimsCount,
  matchesCount,
  unreadNotificationsCount = 0,
  onOpenNotifications
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'directory', label: 'Browse Listings', badge: null },
    { id: 'matches', label: 'Potential Matches', badge: matchesCount > 0 ? matchesCount : null },
    { id: 'activity', label: 'My Reports & Claims', badge: null, authRequired: true },
    { id: 'admin', label: 'Admin Portal', badge: pendingClaimsCount > 0 ? pendingClaimsCount : null, adminOnly: true }
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(11, 20, 38, 0.92)', // Luxurious deep navy with 92% opacity
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 8px 32px 0 rgba(0, 8, 28, 0.37)'
    }}>
      <div className="container navbar-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        {/* Logo & Platform Branding */}
        <div
          onClick={() => { setActiveTab('directory'); setMobileMenuOpen(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexShrink: 0 }}
        >
          <div className="navbar-logo-box" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '5px 14px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.28), 0 0 1px rgba(255, 255, 255, 0.9)',
            border: '1.5px solid rgba(255, 255, 255, 0.5)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.38)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.28), 0 0 1px rgba(255, 255, 255, 0.9)';
          }}
          >
            <img
              src="/logo.png"
              alt="Lost & Found"
              className="navbar-logo-img"
              style={{
                width: 'auto',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>
          {userRole === 'ADMIN' && (
            <span style={{
              background: 'rgba(245, 158, 11, 0.22)',
              color: '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 800,
              padding: '4px 14px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Security Desk
            </span>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: 10
        }} className="desktop-nav">
          {navLinks.map((tab) => {
            if (tab.adminOnly && userRole !== 'ADMIN') return null;
            if (tab.authRequired && !isLoggedIn) return null;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 22px',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: "var(--font-display, 'Urbanist', 'Outfit', sans-serif)",
                  fontSize: '1.16rem',
                  fontWeight: isActive ? 850 : 650,
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                  border: isActive ? '1.5px solid rgba(255, 255, 255, 0.28)' : '1.5px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isActive ? '0 4px 16px rgba(0, 0, 0, 0.35)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#cbd5e1';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span style={{
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)',
                    color: isActive ? '#0f172a' : '#ffffff'
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Triggers & Account Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Quick Report Buttons (Desktop) */}
          <div style={{ display: 'none', gap: 12 }} className="desktop-actions">
            <button
              onClick={() => onOpenReportModal('LOST')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                padding: '12px 22px',
                borderRadius: 'var(--radius-md)',
                fontFamily: "var(--font-display, 'Urbanist', 'Outfit', sans-serif)",
                fontSize: '1.06rem',
                fontWeight: 700,
                color: '#fda4af',
                backgroundColor: 'rgba(244, 63, 94, 0.16)',
                border: '1.5px solid rgba(244, 63, 94, 0.45)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.28)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.16)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <PlusCircle size={19} /> Report Lost
            </button>
            <button
              onClick={() => onOpenReportModal('FOUND')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                padding: '12px 22px',
                borderRadius: 'var(--radius-md)',
                fontFamily: "var(--font-display, 'Urbanist', 'Outfit', sans-serif)",
                fontSize: '1.06rem',
                fontWeight: 700,
                color: '#6ee7b7',
                backgroundColor: 'rgba(16, 185, 129, 0.16)',
                border: '1.5px solid rgba(16, 185, 129, 0.45)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.28)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.16)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <PlusCircle size={19} /> Report Found
            </button>
          </div>

          {/* User Account / Auth Button */}
          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Notification Symbol Button */}
              {onOpenNotifications && (
                <button
                  onClick={onOpenNotifications}
                  title="Notifications & Records"
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    border: unreadNotificationsCount > 0 ? '1.5px solid rgba(56, 189, 248, 0.7)' : '1.5px solid rgba(255, 255, 255, 0.18)',
                    backgroundColor: unreadNotificationsCount > 0 ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.08)',
                    color: unreadNotificationsCount > 0 ? '#38bdf8' : '#cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.28)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = unreadNotificationsCount > 0 ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = unreadNotificationsCount > 0 ? '#38bdf8' : '#cbd5e1';
                  }}
                  aria-label="View notifications"
                >
                  <Bell size={21} />
                  {unreadNotificationsCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      minWidth: 19,
                      height: 19,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                      boxShadow: '0 2px 6px rgba(239, 68, 68, 0.5)',
                      border: '1.5px solid #0b1426'
                    }}>
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                  )}
                </button>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1.5px solid rgba(255, 255, 255, 0.18)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 18px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)'
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f172a',
                  fontWeight: 900
                }}>
                  <UserIcon size={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{
                    fontFamily: "var(--font-display, 'Urbanist', 'Outfit', sans-serif)",
                    fontSize: '1.06rem',
                    fontWeight: 750,
                    color: '#f8fafc',
                    lineHeight: 1.15
                  }}>
                    {currentUserName || (currentUser ? currentUser.split('@')[0] : 'User')}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    {currentUser}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Sign Out"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid rgba(255, 255, 255, 0.18)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.2)';
                  e.currentTarget.style.color = '#fda4af';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#cbd5e1';
                }}
                aria-label="Sign out"
              >
                <LogOut size={19} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => onOpenAuth('login')}
                style={{
                  padding: '11px 22px',
                  fontFamily: "var(--font-display, 'Urbanist', 'Outfit', sans-serif)",
                  fontSize: '1.06rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                  backgroundColor: 'transparent',
                  border: '1.5px solid rgba(255, 255, 255, 0.24)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.borderColor = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.24)';
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="btn-primary"
                style={{
                  padding: '11px 24px',
                  fontFamily: "var(--font-display, 'Urbanist', 'Outfit', sans-serif)",
                  fontSize: '1.06rem',
                  fontWeight: 750,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                  boxShadow: '0 4px 18px rgba(59, 130, 246, 0.45)'
                }}
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-hamburger"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 46,
              height: 46,
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(255, 255, 255, 0.18)',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              cursor: 'pointer'
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown with Deep Navy Glass Aesthetics */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#0b1426',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '20px 24px',
          boxShadow: '0 16px 32px rgba(0, 0, 0, 0.45)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {navLinks.map((tab) => {
              if (tab.adminOnly && userRole !== 'ADMIN') return null;
              if (tab.authRequired && !isLoggedIn) return null;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: "var(--font-display, 'Urbanist', 'Outfit', sans-serif)",
                    fontSize: '1.12rem',
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                    border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== null && (
                    <span style={{
                      fontSize: '0.80rem',
                      fontWeight: 800,
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: '#38bdf8',
                      color: '#0f172a'
                    }}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button
              onClick={() => { onOpenReportModal('LOST'); setMobileMenuOpen(false); }}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(244, 63, 94, 0.15)',
                color: '#fda4af',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                fontFamily: "var(--font-display, 'Urbanist', 'Outfit', sans-serif)",
                fontWeight: 700,
                fontSize: '1.02rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7
              }}
            >
              <PlusCircle size={18} /> Report Lost
            </button>
            <button
              onClick={() => { onOpenReportModal('FOUND'); setMobileMenuOpen(false); }}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#6ee7b7',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                fontFamily: "var(--font-display, 'Urbanist', 'Outfit', sans-serif)",
                fontWeight: 700,
                fontSize: '1.02rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7
              }}
            >
              <PlusCircle size={18} /> Report Found
            </button>
          </div>

          {isLoggedIn && onOpenNotifications && (
            <button
              onClick={() => { onOpenNotifications(); setMobileMenuOpen(false); }}
              style={{
                width: '100%',
                marginTop: 12,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1.5px solid rgba(56, 189, 248, 0.4)',
                fontFamily: "var(--font-display, 'Urbanist', 'Outfit', sans-serif)",
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <Bell size={18} />
              <span>Notifications &amp; Saved Records</span>
              {unreadNotificationsCount > 0 && (
                <span style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  {unreadNotificationsCount} new
                </span>
              )}
            </button>
          )}

          {!isLoggedIn && (
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontFamily: "var(--font-display, 'Urbanist', 'Outfit', sans-serif)",
                  fontWeight: 650,
                  fontSize: '1.02rem',
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontFamily: "var(--font-display, 'Urbanist', 'Outfit', sans-serif)",
                  fontSize: '1.02rem',
                  fontWeight: 750
                }}
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}

      {/* Responsive Styles Injection */}
      <style>{`
        .navbar-container {
          height: 98px;
        }
        .navbar-logo-img {
          height: 54px;
        }
        @media (max-width: 768px) {
          .navbar-container {
            height: 72px !important;
            padding: 0 14px !important;
            gap: 10px !important;
          }
          .navbar-logo-box {
            padding: 4px 10px !important;
            border-radius: 12px !important;
          }
          .navbar-logo-img {
            height: 40px !important;
          }
        }
        @media (min-width: 960px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-actions {
            display: flex !important;
          }
          .mobile-hamburger {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
