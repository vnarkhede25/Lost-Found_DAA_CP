import React, { useState, useEffect, useRef } from 'react';
import { Search, PlusCircle, X } from 'lucide-react';
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
    <div className="hero-container" style={{
      padding: '40px 20px 20px',
      maxWidth: 1280,
      margin: '0 auto',
      textAlign: 'center'
    }}>
      {/* Main Headline */}
      <h1 className="hero-headline" style={{
        margin: '0 auto 24px',
        lineHeight: 1.15
      }}>
        <span style={{
          display: 'block',
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: 'clamp(1.85rem, 6.4vw, 3.8rem)',
          fontWeight: 800,
          color: '#0f172a',
          letterSpacing: '-0.035em',
          lineHeight: 1.16
        }}>
          Lost something?
        </span>
        <span style={{
          display: 'inline-block',
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: 'clamp(1.85rem, 6.4vw, 3.8rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 35%, #059669 70%, #7c3aed 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginTop: 6,
          lineHeight: 1.18
        }}>
          Let’s bring it back to you.
        </span>
      </h1>

      {/* Prominent Search Bar with Dynamic Focus Glow */}
      <div
        ref={dropdownRef}
        className="hero-search-wrapper"
        style={{
          position: 'relative',
          maxWidth: 720,
          margin: '0 auto 24px'
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
          <Search size={22} color="var(--primary)" style={{ position: 'absolute', left: 18 }} />
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
            placeholder="Search lost items, found listings, or location..."
            className="hero-search-input"
            style={{
              width: '100%',
              padding: '16px 48px 16px 52px',
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
      <div className="hero-actions" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 36 }}>
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
    </div>
  );
};
