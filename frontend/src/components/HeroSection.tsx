import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Zap, Shield, MapPin, X } from 'lucide-react';
import { apiClient } from '../api/client';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  onSelectSuggestion: (s: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onSelectSuggestion
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
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
      position: 'relative',
      padding: '48px 24px 36px',
      maxWidth: 1380,
      margin: '0 auto',
      textAlign: 'center'
    }}>
      {/* Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(99, 102, 241, 0.12)',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        padding: '6px 16px',
        borderRadius: 'var(--radius-full)',
        marginBottom: 20
      }}>
        <Sparkles size={15} color="#818cf8" />
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#c7d2fe' }}>
          Spring Boot + React + TypeScript • Advanced Data Structures Engine
        </span>
      </div>

      {/* Main Headline */}
      <h1 style={{
        fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
        fontWeight: 800,
        lineHeight: 1.15,
        marginBottom: 16,
        background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 40%, #94a3b8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Intelligent Lost &amp; Found Recovery
      </h1>

      <p style={{
        maxWidth: 680,
        margin: '0 auto 32px',
        fontSize: '1.05rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.6
      }}>
        Locate lost belongings in seconds using real-time Trie prefix indexing, AVL range queries,
        spatial QuadTree geolocation, and automated Jaccard matching confidence scoring.
      </p>

      {/* Big Search Bar with Trie Autocomplete */}
      <div 
        ref={dropdownRef}
        style={{
          position: 'relative',
          maxWidth: 720,
          margin: '0 auto 32px'
        }}
      >
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(23, 33, 56, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          borderRadius: 'var(--radius-full)',
          padding: '8px 10px 8px 20px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4), 0 0 25px rgba(99, 102, 241, 0.2)'
        }}>
          <Search size={22} color="#818cf8" style={{ marginRight: 12, flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search items by name, category, or location (e.g. 'AirPods', 'Library', 'Hydro Flask')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsOpen(false);
                onSearchSubmit(searchQuery);
              }
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              padding: '8px 0',
              fontSize: '1rem',
              color: '#ffffff',
              outline: 'none',
              boxShadow: 'none'
            }}
          />

          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setIsOpen(false); onSearchSubmit(''); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 4,
                marginRight: 6
              }}
            >
              <X size={18} />
            </button>
          )}

          <button
            onClick={() => { setIsOpen(false); onSearchSubmit(searchQuery); }}
            className="btn-primary"
            style={{ padding: '10px 24px', fontSize: '0.95rem' }}
          >
            <Zap size={16} />
            <span>Search</span>
          </button>
        </div>

        {/* Trie Autocomplete Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: '#111726',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(99, 102, 241, 0.2)',
            zIndex: 50,
            overflow: 'hidden',
            textAlign: 'left'
          }}>
            <div style={{
              padding: '8px 16px',
              background: 'rgba(99, 102, 241, 0.08)',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#a5b4fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>TRIE PREFIX PREDICTIONS (O(m) Lookup)</span>
              <span style={{ color: 'var(--text-muted)' }}>{suggestions.length} suggestions</span>
            </div>
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectSuggestion(item);
                  setIsOpen(false);
                }}
                style={{
                  padding: '12px 18px',
                  borderBottom: idx < suggestions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Search size={15} color="#818cf8" />
                <span style={{ color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: 500 }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Algorithmic Highlights Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        maxWidth: 1080,
        margin: '0 auto'
      }}>
        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} color="#818cf8" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Trie Prefix Autocomplete</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>O(m) instant search</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} color="#34d399" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontSize: '0.95rem', margin: 0 }}>AVL Balanced Trees</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>O(log n) date &amp; range queries</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={22} color="#38bdf8" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Spatial QuadTree</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>2D Campus radius search</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(217, 70, 239, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} color="#f472b6" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Jaccard Similarity Match</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Weighted multi-factor score</p>
          </div>
        </div>
      </div>
    </div>
  );
};
