import React, { useState, useEffect, useRef } from 'react';
import {
  Search, PlusCircle, ShieldCheck, MapPin, X, ArrowRight,
  FileText, CheckCircle2, Sparkles, Compass
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
      padding: '48px 20px 24px',
      maxWidth: 1280,
      margin: '0 auto',
      textAlign: 'center'
    }}>
      {/* Platform Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'var(--primary-bg)',
        border: '1px solid var(--primary-border)',
        padding: '6px 16px',
        borderRadius: 'var(--radius-full)',
        marginBottom: 20
      }}>
        <ShieldCheck size={16} color="var(--primary)" />
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
          Official College Lost &amp; Found Portal
        </span>
      </div>

      {/* Main Headline */}
      <h1 style={{
        fontSize: 'clamp(2.1rem, 4vw, 3.2rem)',
        fontWeight: 800,
        lineHeight: 1.15,
        marginBottom: 16,
        color: 'var(--text-primary)',
        letterSpacing: '-0.03em'
      }}>
        Lost something on campus? <br />
        <span style={{ color: 'var(--primary)' }}>We'll help you find it.</span>
      </h1>

      <p style={{
        maxWidth: 640,
        margin: '0 auto 32px',
        fontSize: '1.05rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.6
      }}>
        Connect with fellow students and campus security. Report missing belongings, browse recovered items, and verify ownership securely.
      </p>

      {/* Prominent Search Bar */}
      <div
        ref={dropdownRef}
        style={{
          position: 'relative',
          maxWidth: 680,
          margin: '0 auto 28px'
        }}
      >
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          transition: 'all 0.2s ease'
        }}>
          <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: 18 }} />
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
            placeholder="Search by keyword, item type, or campus building..."
            style={{
              width: '100%',
              padding: '16px 48px 16px 50px',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
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
                right: 16,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
              aria-label="Clear search input"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 50,
            textAlign: 'left',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '10px 16px',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              fontWeight: 700,
              backgroundColor: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              Suggested Keywords
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
                  padding: '12px 18px',
                  fontSize: '0.92rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  borderBottom: idx < suggestions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  transition: 'background-color 0.1s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Search size={15} color="var(--primary)" />
                <span style={{ fontWeight: 500 }}>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
        <button
          onClick={() => onOpenReportModal('LOST')}
          className="btn-destructive"
          style={{ padding: '12px 24px', fontSize: '0.95rem' }}
        >
          <PlusCircle size={18} /> Report a Lost Item
        </button>

        <button
          onClick={() => onOpenReportModal('FOUND')}
          className="btn-primary"
          style={{ padding: '12px 24px', fontSize: '0.95rem', backgroundColor: 'var(--found-color)' }}
        >
          <PlusCircle size={18} /> Report a Found Item
        </button>
      </div>

      {/* 3 Simple Steps Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 20,
        textAlign: 'left',
        marginBottom: 20
      }}>
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-bg)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1rem',
            marginBottom: 12
          }}>
            1
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6 }}>Report in Seconds</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Submit details, location, and photos of lost or found belongings across campus.
          </p>
        </div>

        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#fef3c7',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1rem',
            marginBottom: 12
          }}>
            2
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6 }}>Intelligent Matching</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            LCS algorithms analyze descriptions and locations to highlight high-confidence matches.
          </p>
        </div>

        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#d1fae5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1rem',
            marginBottom: 12
          }}>
            3
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6 }}>Verified Handover</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Campus security confirms physical ownership proofs before authorizing safe returns.
          </p>
        </div>
      </div>
    </div>
  );
};
