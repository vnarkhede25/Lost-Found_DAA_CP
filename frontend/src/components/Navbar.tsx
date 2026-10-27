import React, { useState } from 'react';
import {
  Search, PlusCircle, ShieldCheck, UserCheck, LogIn, LogOut,
  Menu, X, CheckCircle2, ChevronDown, User as UserIcon
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
  matchesCount
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
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-xs)'
    }}>
      <div className="container" style={{
        height: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        {/* Logo & Platform Name */}
        <div
          onClick={() => { setActiveTab('directory'); setMobileMenuOpen(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        >
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)'
          }}>
            <Search size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
                Lost &amp; Found
              </span>
              {userRole === 'ADMIN' && (
                <span style={{
                  background: 'var(--pending-bg)',
                  color: 'var(--pending-color)',
                  border: '1px solid var(--pending-border)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  textTransform: 'uppercase'
                }}>
                  Security Desk
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
              Campus Community Recovery
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: 4
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
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--primary-bg)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                    color: isActive ? '#ffffff' : 'var(--text-primary)'
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
          <div style={{ display: 'none', gap: 8 }} className="desktop-actions">
            <button
              onClick={() => onOpenReportModal('LOST')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--lost-color)',
                backgroundColor: 'var(--lost-bg)',
                border: '1px solid var(--lost-border)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <PlusCircle size={14} /> Report Lost
            </button>
            <button
              onClick={() => onOpenReportModal('FOUND')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--found-color)',
                backgroundColor: 'var(--found-bg)',
                border: '1px solid var(--found-border)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <PlusCircle size={14} /> Report Found
            </button>
          </div>

          {/* User Account / Auth Button */}
          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 12px'
              }}>
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <UserIcon size={14} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                    {currentUserName || currentUser.split('@')[0]}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
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
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: '#ffffff',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => onOpenAuth('login')}
                className="btn-secondary"
                style={{ padding: '7px 14px', fontSize: '0.84rem' }}
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="btn-primary"
                style={{ padding: '7px 14px', fontSize: '0.84rem' }}
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
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.92rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                    backgroundColor: isActive ? 'var(--primary-bg)' : 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== null && (
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                      color: isActive ? '#ffffff' : 'var(--text-primary)'
                    }}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={() => { onOpenReportModal('LOST'); setMobileMenuOpen(false); }}
              className="btn-destructive"
              style={{ width: '100%', padding: '10px' }}
            >
              <PlusCircle size={16} /> Report Lost
            </button>
            <button
              onClick={() => { onOpenReportModal('FOUND'); setMobileMenuOpen(false); }}
              className="btn-primary"
              style={{ width: '100%', padding: '10px', backgroundColor: 'var(--found-color)' }}
            >
              <PlusCircle size={16} /> Report Found
            </button>
          </div>

          {!isLoggedIn && (
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                className="btn-secondary"
                style={{ width: '100%', padding: '10px' }}
              >
                Sign In
              </button>
              <button
                onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                className="btn-primary"
                style={{ width: '100%', padding: '10px' }}
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}

      {/* Responsive Styles Injection */}
      <style>{`
        @media (min-width: 900px) {
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
