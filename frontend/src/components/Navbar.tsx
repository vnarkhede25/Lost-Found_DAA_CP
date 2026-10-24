import React from 'react';
import { Compass, Sparkles, PlusCircle, Radio, Cpu, Layers, ShieldCheck, User } from 'lucide-react';

interface NavbarProps {
  activeTab: 'items' | 'matches' | 'radar' | 'ads' | 'priority';
  setActiveTab: (tab: 'items' | 'matches' | 'radar' | 'ads' | 'priority') => void;
  onOpenReportModal: (type: 'LOST' | 'FOUND') => void;
  currentUser: string;
  setCurrentUser: (user: string) => void;
  matchesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  currentUser,
  setCurrentUser,
  matchesCount
}) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10, 13, 20, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0 24px'
    }}>
      <div style={{
        maxWidth: 1380,
        margin: '0 auto',
        height: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20
      }}>
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('items')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        >
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--primary-glow)'
          }}>
            <Compass size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                TrackBack
              </span>
              <span style={{
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: 999,
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '1px 7px',
                textTransform: 'uppercase'
              }}>
                ADS v2.0
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, marginTop: -2 }}>
              Intelligent Lost &amp; Found
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setActiveTab('items')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeTab === 'items' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'items' ? '#818cf8' : 'var(--text-secondary)',
              fontWeight: activeTab === 'items' ? 600 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Layers size={17} />
            <span>Items Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeTab === 'matches' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              color: activeTab === 'matches' ? '#c084fc' : 'var(--text-secondary)',
              fontWeight: activeTab === 'matches' ? 600 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s ease'
            }}
          >
            <Sparkles size={17} />
            <span>Smart Matchmaker</span>
            {matchesCount > 0 && (
              <span style={{
                background: 'var(--matched-gradient)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 999,
                marginLeft: 2
              }}>
                {matchesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeTab === 'radar' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
              color: activeTab === 'radar' ? '#38bdf8' : 'var(--text-secondary)',
              fontWeight: activeTab === 'radar' ? 600 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Radio size={17} />
            <span>Spatial QuadTree</span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeTab === 'ads' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activeTab === 'ads' ? '#34d399' : 'var(--text-secondary)',
              fontWeight: activeTab === 'ads' ? 600 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Cpu size={17} />
            <span>ADS Observatory</span>
          </button>
        </nav>

        {/* Actions & User Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* User selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 10px',
            fontSize: '0.82rem'
          }}>
            <User size={14} color="#94a3b8" />
            <select
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                padding: '2px 4px',
                outline: 'none',
                width: 'auto'
              }}
            >
              <option value="alex.morgan@university.edu">Alex Morgan (Student)</option>
              <option value="sophia.p@university.edu">Sophia Patel (Student)</option>
              <option value="david.k@university.edu">David Kim (Student)</option>
              <option value="security@university.edu">Campus Security (Staff)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <button
            onClick={() => onOpenReportModal('LOST')}
            className="btn-lost"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 15px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <PlusCircle size={15} />
            <span>Report Lost</span>
          </button>

          <button
            onClick={() => onOpenReportModal('FOUND')}
            className="btn-found"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 15px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <ShieldCheck size={15} />
            <span>Report Found</span>
          </button>
        </div>
      </div>
    </header>
  );
};
