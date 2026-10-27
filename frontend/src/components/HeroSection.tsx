import React, { useState, useEffect, useRef } from 'react';
import {
  Search, PlusCircle, ShieldCheck, MapPin, X, ArrowRight,
  FileText, CheckCircle2, Sparkles, Compass, BellRing
} from 'lucide-react';
import { apiClient } from '../api/client';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  onSelectSuggestion: (s: string) => void;
  onOpenReportModal: (type: 'LOST' | 'FOUND') => void;
  totalItemsCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onSelectSuggestion,
  onOpenReportModal,
  totalItemsCount
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      apiClient.getSuggestions(searchQuery).then((res) => {
        setSuggestions(res);
        setIsOpen(res.length > 0);
      });
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{
      padding: '54px 20px 30px',
      maxWidth: 1280,
      margin: '0 auto',
      textAlign: 'center'
    }}>
      {/* Platform Badge with Glow */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(99, 102, 241, 0.15) 100%)',
        border: '1.5px solid var(--primary-border)',
        padding: '7px 18px',
        borderRadius: 'var(--radius-full)',
        marginBottom: 24,
        boxShadow: '0 2px 10px rgba(79, 70, 229, 0.1)'
      }}>
        <ShieldCheck size={16} color="var(--primary)" />
        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.02em' }}>
          Official University Campus Lost &amp; Found Portal
        </span>
      </div>

      {/* Main Headline with High-Impact Gradient Accent */}
      <h1 style={{
        fontSize: 'clamp(2.4rem, 4.6vw, 3.8rem)',
        fontWeight: 900,
        lineHeight: 1.12,
        marginBottom: 18,
        color: 'var(--text-primary)',
        letterSpacing: '-0.04em'
      }}>
        Lost something on campus? <br />
        <span style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block'
        }}>
          We'll help you recover it.
        </span>
      </h1>

      <p style={{
        maxWidth: 660,
        margin: '0 auto 36px',
        fontSize: '1.08rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.65,
        fontWeight: 450
      }}>
        Search campus dropzones, discover verified listings, and safely recover your lost belongings with authorized security coordination.
      </p>

      {/* Prominent Search Bar with Dynamic Focus Glow */}
      <div
        ref={dropdownRef}
        style={{
          position: 'relative',
          maxWidth: 720,
          margin: '0 auto 34px'
        }}
      >
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          border: '1.5px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          transition: 'all 0.25s ease'
        }}>
          <Search size={22} color="var(--primary)" style={{ position: 'absolute', left: 20 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearchSubmit(searchQuery);
                setIsOpen(false);
              }
            }}
            placeholder="Search by keyword, item type, or campus building (e.g. 'AirPods', 'Library', 'Hydro Flask')..."
            style={{
              width: '100%',
              padding: '18px 52px 18px 56px',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1.02rem',
              fontWeight: 500,
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-lg)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                onSearchSubmit('');
              }}
              style={{
                position: 'absolute',
                right: 18,
                background: 'var(--bg-surface)',
                border: 'none',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
              aria-label="Clear search input"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 50,
            textAlign: 'left',
            overflow: 'hidden',
            animation: 'slideUp 0.18s ease-out'
          }}>
            <div style={{
              padding: '12px 18px',
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              fontWeight: 800,
              letterSpacing: '0.06em',
              backgroundColor: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              Suggested Campus Keywords
            </div>
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSearchQuery(s);
                  onSelectSuggestion(s);
                  setIsOpen(false);
                }}
                style={{
                  padding: '14px 20px',
                  fontSize: '0.94rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  borderBottom: idx < suggestions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  transition: 'background-color 0.12s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Search size={16} color="var(--primary)" />
                <span style={{ fontWeight: 600 }}>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Actions with Elevated Gradients */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 54 }}>
        <button
          onClick={() => onOpenReportModal('LOST')}
          className="btn-destructive"
          style={{ padding: '14px 28px', fontSize: '0.98rem' }}
        >
          <PlusCircle size={20} /> Report a Lost Item
        </button>

        <button
          onClick={() => onOpenReportModal('FOUND')}
          className="btn-primary"
          style={{
            padding: '14px 28px',
            fontSize: '0.98rem',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)'
          }}
        >
          <PlusCircle size={20} /> Report a Found Item
        </button>
      </div>

      {/* 3 Step Interactive Process Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
        textAlign: 'left',
        marginBottom: 20
      }}>
        <div className="card" style={{ padding: '26px 28px', borderTop: '4px solid #4f46e5' }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-bg)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.15rem',
            marginBottom: 14
          }}>
            1
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 8 }}>Report in Seconds</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Submit item details, photo previews, and campus dropzones to instantly publish your listing.
          </p>
        </div>

        <div className="card" style={{ padding: '26px 28px', borderTop: '4px solid #f59e0b' }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#fef3c7',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.15rem',
            marginBottom: 14
          }}>
            2
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 8 }}>Automated Discovery</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Intelligent candidate matching links lost and found descriptions without exposing personal information.
          </p>
        </div>

        <div className="card" style={{ padding: '26px 28px', borderTop: '4px solid #10b981' }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#d1fae5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.15rem',
            marginBottom: 14
          }}>
            3
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 8 }}>Verified Handover</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Secret identifying proofs and campus security physical verification ensure safe, authorized recovery.
          </p>
        </div>
      </div>
    </div>
  );
};
