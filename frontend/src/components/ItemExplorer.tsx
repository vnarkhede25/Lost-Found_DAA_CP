import React, { useState } from 'react';
import type { Item } from '../types';
import {
  Calendar, MapPin, Tag, Award, Eye,
  LayoutGrid, List, AlertCircle, Shield, CheckCircle2, ChevronRight
} from 'lucide-react';

interface ItemExplorerProps {
  items: Item[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onSelectItem: (item: Item) => void;
  onCheckMatches: (item: Item) => void;
  onClaimItem: (item: Item) => void;
}

const CATEGORIES = [
  'ALL',
  'Electronics',
  'Accessories',
  'Bags & Wallets',
  'Keys',
  'Books & Stationery',
  'IDs & Cards'
];

export const ItemExplorer: React.FC<ItemExplorerProps> = ({
  items,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  onSelectItem,
  onCheckMatches,
  onClaimItem
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px 60px' }}>
      {/* Filter and Control Bar */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 24, backgroundColor: '#ffffff' }}>
        {/* Category Filter Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 14,
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: 16
        }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <Tag size={15} /> Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-medium)',
                  backgroundColor: isSelected ? 'var(--primary)' : '#ffffff',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? '0 2px 6px rgba(79, 70, 229, 0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            );
          })}
        </div>

        {/* Second Row: Type filter, Status filter, Sorting, View switch */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          {/* Type Toggle: All / Lost / Found */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Listing Type:</span>
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              padding: 3,
              border: '1px solid var(--border-subtle)'
            }}>
              {['ALL', 'LOST', 'FOUND'].map((type) => {
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 700 : 500,
                      border: 'none',
                      backgroundColor: isSelected ? '#ffffff' : 'transparent',
                      color: isSelected
                        ? (type === 'LOST' ? 'var(--lost-color)' : type === 'FOUND' ? 'var(--found-color)' : 'var(--text-primary)')
                        : 'var(--text-muted)',
                      boxShadow: isSelected ? 'var(--shadow-xs)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-input"
              style={{
                padding: '6px 12px',
                fontSize: '0.82rem',
                fontWeight: 500,
                width: 'auto'
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open (Active)</option>
              <option value="CLAIM_PENDING">Verification Pending</option>
              <option value="RETURNED">Handed Over / Returned</option>
            </select>
          </div>

          {/* Sorting & Layout View Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-input"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  width: 'auto'
                }}
              >
                <option value="date">Date (MergeSort)</option>
                <option value="name">Item Name</option>
                <option value="status">Status</option>
              </select>
            </div>

            {/* Grid / List View Toggle */}
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              padding: 3,
              border: '1px solid var(--border-subtle)'
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '5px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: viewMode === 'grid' ? 'var(--shadow-xs)' : 'none'
                }}
                aria-label="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '5px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: viewMode === 'list' ? '#ffffff' : 'transparent',
                  color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: viewMode === 'list' ? 'var(--shadow-xs)' : 'none'
                }}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header Count */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        padding: '0 4px'
      }}>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{items.length}</strong> items in directory
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="card" style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#ffffff'
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <AlertCircle size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>
            No Matching Items Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 420, margin: '0 auto 20px' }}>
            We couldn't find any items matching your active search or filters. Try choosing a different category or clearing search terms.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedType('ALL');
              setSelectedStatus('ALL');
            }}
            className="btn-secondary"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && items.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: 20
        }}>
          {items.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#ffffff'
              }}
            >
              {/* Card Image Thumbnail */}
              <div
                style={{
                  position: 'relative',
                  height: 190,
                  backgroundColor: 'var(--bg-surface)',
                  cursor: 'pointer'
                }}
                onClick={() => onSelectItem(item)}
              >
                <img
                  src={item.photoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />

                {/* Badge Pills */}
                <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className={`badge ${item.type === 'LOST' ? 'badge-lost' : 'badge-found'}`}>
                    {item.type}
                  </span>
                  <span className={`badge ${
                    item.status === 'OPEN' ? 'badge-found' :
                    item.status === 'CLAIM_PENDING' ? 'badge-pending' :
                    item.status === 'RETURNED' ? 'badge-returned' : 'badge-lost'
                  }`}>
                    {item.status === 'CLAIM_PENDING' ? 'CLAIM PENDING' : item.status}
                  </span>
                </div>

                {item.reward && (
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    color: '#059669',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {item.reward}
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  marginBottom: 6
                }}>
                  {item.category}
                </div>

                <h3
                  onClick={() => onSelectItem(item)}
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    marginBottom: 8,
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    lineHeight: 1.3
                  }}
                >
                  {item.name}
                </h3>

                <p style={{
                  fontSize: '0.86rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  marginBottom: 16,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {item.description}
                </p>

                {/* Metadata details */}
                <div style={{
                  marginTop: 'auto',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={14} color="var(--primary)" />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{item.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} color="var(--text-muted)" />
                    <span>{item.date}</span>
                  </div>
                </div>

                {/* Action Footer */}
                <div style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <button
                    onClick={() => onSelectItem(item)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem' }}
                  >
                    View Details
                  </button>

                  {item.type === 'FOUND' && item.status !== 'RETURNED' && item.status !== 'CLOSED' && (
                    <button
                      onClick={() => onClaimItem(item)}
                      className="btn-primary"
                      style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                    >
                      Claim
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                backgroundColor: '#ffffff',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 260 }}>
                <img
                  src={item.photoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
                  alt={item.name}
                  style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className={`badge ${item.type === 'LOST' ? 'badge-lost' : 'badge-found'}`}>
                      {item.type}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {item.category}
                    </span>
                  </div>
                  <h4
                    onClick={() => onSelectItem(item)}
                    style={{ fontSize: '1.02rem', fontWeight: 700, cursor: 'pointer', margin: 0 }}
                  >
                    {item.name}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {item.location} • {item.date}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => onSelectItem(item)}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                >
                  Inspect
                </button>
                {item.type === 'FOUND' && item.status !== 'RETURNED' && item.status !== 'CLOSED' && (
                  <button
                    onClick={() => onClaimItem(item)}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                  >
                    Claim Item
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
