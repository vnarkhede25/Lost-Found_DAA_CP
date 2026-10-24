import React, { useState } from 'react';
import type { Item } from '../types';
import { 
  Calendar, MapPin, Tag, Award, Eye, 
  LayoutGrid, List, Flame, AlertCircle 
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
  onCheckMatches
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sort items client-side based on user selected sorting
  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'priority') {
      return (b.priorityScore || 0) - (a.priorityScore || 0);
    }
    if (sortBy === 'date-desc') {
      return b.date.localeCompare(a.date);
    }
    if (sortBy === 'date-asc') {
      return a.date.localeCompare(b.date);
    }
    if (sortBy === 'location') {
      return a.location.localeCompare(b.location);
    }
    return 0;
  });

  return (
    <div style={{ maxWidth: 1380, margin: '0 auto', padding: '0 24px 60px' }}>
      {/* Filter and Control Bar */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: 28 }}>
        {/* Category Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          overflowX: 'auto',
          paddingBottom: 14,
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: 16
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <Tag size={15} /> Categories:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`pill-filter ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
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
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Type:</span>
            <div style={{
              display: 'flex',
              background: 'var(--bg-secondary)',
              padding: 3,
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)'
            }}>
              {(['ALL', 'LOST', 'FOUND'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: selectedType === t ? (t === 'LOST' ? 'var(--lost-gradient)' : t === 'FOUND' ? 'var(--found-gradient)' : 'var(--primary-accent)') : 'transparent',
                    color: selectedType === t ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {t === 'ALL' ? 'All Types' : t === 'LOST' ? 'Lost Items' : 'Found Items'}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter & Sorting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px 12px',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open Only</option>
                <option value="MATCHED">Matched</option>
                <option value="RESOLVED">Resolved / Claimed</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Algorithm Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px 12px',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="priority">⚡ Binary Heap: Highest Priority First</option>
                <option value="date-desc">📅 AVL Tree: Date Newest to Oldest</option>
                <option value="date-asc">📅 AVL Tree: Date Oldest to Newest</option>
                <option value="location">📍 AVL Tree: Location A-Z</option>
              </select>
            </div>

            {/* Grid / List view toggle */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: 2
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '6px 8px',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: viewMode === 'grid' ? 'var(--bg-tertiary)' : 'transparent',
                  color: viewMode === 'grid' ? '#818cf8' : 'var(--text-muted)'
                }}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '6px 8px',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: viewMode === 'list' ? 'var(--bg-tertiary)' : 'transparent',
                  color: viewMode === 'list' ? '#818cf8' : 'var(--text-muted)'
                }}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Result Count and Algorithmic Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        padding: '0 4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Catalog Items
          </h3>
          <span style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 700,
            padding: '2px 10px',
            borderRadius: 999
          }}>
            {sortedItems.length} items found
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#818cf8' }}>
          <Flame size={15} />
          <span>Priority scored via Binary Max-Heap</span>
        </div>
      </div>

      {/* Items Rendering */}
      {sortedItems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <AlertCircle size={48} color="#94a3b8" style={{ marginBottom: 16 }} />
          <h4 style={{ fontSize: '1.2rem', marginBottom: 8 }}>No items match your filter</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Try resetting your search query or selecting a different category.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 24
        }}>
          {sortedItems.map((item) => (
            <div
              key={item.id}
              className="glass-card animate-fade-in"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Image with overlay badge */}
              <div style={{
                position: 'relative',
                height: 200,
                width: '100%',
                background: 'var(--bg-tertiary)',
                overflow: 'hidden'
              }}>
                <img
                  src={item.photoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
                  alt={item.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />

                {/* Status Badges top bar */}
                <div style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  right: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span className={item.type === 'LOST' ? 'badge-lost' : 'badge-found'}>
                    {item.type}
                  </span>

                  {item.priorityScore && (
                    <span style={{
                      background: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(8px)',
                      color: '#fbbf24',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      padding: '3px 9px',
                      borderRadius: 999,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <Flame size={12} />
                      {Math.round(item.priorityScore * 100)}% Priority
                    </span>
                  )}
                </div>

                {/* Status pill bottom left */}
                <div style={{ position: 'absolute', bottom: 10, left: 12 }}>
                  <span className={item.status === 'RESOLVED' ? 'badge-resolved' : item.status === 'MATCHED' ? 'badge-matched' : 'badge-category'}>
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="badge-category">{item.category}</span>
                  {item.reward && (
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#34d399',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <Award size={13} />
                      {item.reward}
                    </span>
                  )}
                </div>

                <h4 style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  marginBottom: 8,
                  lineHeight: 1.3,
                  color: 'var(--text-primary)'
                }}>
                  {item.name}
                </h4>

                <p style={{
                  fontSize: '0.85rem',
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

                {/* Location and Date */}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={14} color="#818cf8" />
                    <span style={{ color: 'var(--text-secondary)' }}>{item.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} color="#818cf8" />
                    <span>Reported on {item.date}</span>
                  </div>
                </div>

                {/* Actions bottom bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 18,
                  paddingTop: 14,
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <button
                    onClick={() => onSelectItem(item)}
                    className="btn-secondary"
                    style={{ flex: 1, justifyContent: 'center', padding: '8px 12px', fontSize: '0.82rem' }}
                  >
                    <Eye size={15} />
                    <span>Details</span>
                  </button>

                  <button
                    onClick={() => onCheckMatches(item)}
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center', padding: '8px 12px', fontSize: '0.82rem' }}
                  >
                    <span>Check Matches</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {sortedItems.map((item) => (
            <div
              key={item.id}
              className="glass-card animate-fade-in"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                gap: 20
              }}
            >
              <img
                src={item.photoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
                alt={item.name}
                style={{
                  width: 90,
                  height: 75,
                  borderRadius: 10,
                  objectFit: 'cover',
                  flexShrink: 0
                }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span className={item.type === 'LOST' ? 'badge-lost' : 'badge-found'}>
                    {item.type}
                  </span>
                  <span className="badge-category">{item.category}</span>
                  <h4 style={{ fontSize: '1.02rem', margin: 0, fontWeight: 700 }}>
                    {item.name}
                  </h4>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, marginBottom: 6 }}>
                  {item.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} color="#818cf8" /> {item.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={13} color="#818cf8" /> {item.date}
                  </span>
                  {item.reward && (
                    <span style={{ color: '#34d399', fontWeight: 600 }}>{item.reward}</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <button
                  onClick={() => onSelectItem(item)}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                >
                  <Eye size={15} />
                  <span>Inspect</span>
                </button>
                <button
                  onClick={() => onCheckMatches(item)}
                  className="btn-primary"
                  style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                >
                  <span>Matches</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
