import React, { useState } from 'react';
import type { Item } from '../types';
import { X, PlusCircle, ShieldCheck } from 'lucide-react';

interface ReportModalProps {
  initialType: 'LOST' | 'FOUND';
  currentUser: string;
  onClose: () => void;
  onSubmit: (item: Partial<Item>) => Promise<void>;
}

const PHOTO_PRESETS = [
  { label: 'AirPods / Earbuds', url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80' },
  { label: 'Laptop / MacBook', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80' },
  { label: 'Keys / Keychain', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80' },
  { label: 'Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80' },
  { label: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80' },
  { label: 'Water Bottle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80' },
  { label: 'Phone / iPhone', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80' }
];

const CAMPUS_LOCATIONS = [
  { name: 'Central Library - 2nd Floor', lat: 25, lng: 48 },
  { name: 'Student Activity Center Gym', lat: 62, lng: 32 },
  { name: 'Dining Hall Courtyard', lat: 45, lng: 75 },
  { name: 'Engineering Hall 304', lat: 80, lng: 20 },
  { name: 'Science Complex Cafe', lat: 35, lng: 85 },
  { name: 'Main Auditorium Lobby', lat: 15, lng: 60 }
];

export const ReportModal: React.FC<ReportModalProps> = ({
  initialType,
  currentUser,
  onClose,
  onSubmit
}) => {
  const [type, setType] = useState<'LOST' | 'FOUND'>(initialType);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(CAMPUS_LOCATIONS[0].name);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoUrl, setPhotoUrl] = useState(PHOTO_PRESETS[0].url);
  const [contactPhone, setContactPhone] = useState('+1 (555) 234-5678');
  const [reward, setReward] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const locMatch = CAMPUS_LOCATIONS.find(l => l.name === location);

    try {
      await onSubmit({
        type,
        name: name.trim(),
        category,
        description: description.trim(),
        location,
        date,
        reporterEmail: currentUser,
        reporterName: currentUser.split('@')[0].replace('.', ' '),
        status: 'OPEN',
        photoUrl,
        latitude: locMatch ? locMatch.lat : 50,
        longitude: locMatch ? locMatch.lng : 50,
        contactPhone,
        reward: reward.trim() ? (reward.startsWith('$') ? reward : `$${reward}`) : undefined
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {type === 'LOST' ? (
              <div style={{ padding: 6, borderRadius: 8, background: 'var(--lost-bg)', color: '#f43f5e' }}>
                <PlusCircle size={20} />
              </div>
            ) : (
              <div style={{ padding: 6, borderRadius: 8, background: 'var(--found-bg)', color: '#10b981' }}>
                <ShieldCheck size={20} />
              </div>
            )}
            <div>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                {type === 'LOST' ? 'Report a Lost Item' : 'Report a Found Item'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Automatically indexed into Trie, AVL, and QuadTree spatial systems
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 4
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Type Selector */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => setType('LOST')}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                border: type === 'LOST' ? '2px solid #f43f5e' : '1px solid var(--border-medium)',
                background: type === 'LOST' ? 'var(--lost-bg)' : 'var(--bg-secondary)',
                color: type === 'LOST' ? '#f43f5e' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              LOST ITEM
            </button>
            <button
              type="button"
              onClick={() => setType('FOUND')}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                border: type === 'FOUND' ? '2px solid #10b981' : '1px solid var(--border-medium)',
                background: type === 'FOUND' ? 'var(--found-bg)' : 'var(--bg-secondary)',
                color: type === 'FOUND' ? '#10b981' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              FOUND ITEM
            </button>
          </div>

          {/* Item Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: 6 }}>
              Item Name / Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apple AirPods Pro with Black Case"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Category & Date Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: 6 }}>
                Category
              </label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Electronics">Electronics</option>
                <option value="Accessories">Accessories</option>
                <option value="Bags & Wallets">Bags &amp; Wallets</option>
                <option value="Keys">Keys</option>
                <option value="Books & Stationery">Books &amp; Stationery</option>
                <option value="IDs & Cards">IDs &amp; Cards</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: 6 }}>
                Date {type === 'LOST' ? 'Lost' : 'Found'}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Location & Reward Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: 6 }}>
                Campus Location
              </label>
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: 6 }}>
                {type === 'LOST' ? 'Reward (Optional)' : 'Contact Phone'}
              </label>
              {type === 'LOST' ? (
                <input
                  type="text"
                  placeholder="e.g. $50 Reward"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: 6 }}>
              Description &amp; Identifying Details
            </label>
            <textarea
              rows={3}
              placeholder="Describe color, scratches, stickers, serial numbers, exact spot found..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Photo Presets & Custom URL */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: 6 }}>
              Photo Asset (Choose Preset or Custom URL)
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {PHOTO_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPhotoUrl(p.url)}
                  className={`pill-filter ${photoUrl === p.url ? 'active' : ''}`}
                  style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or paste custom image URL..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            />
          </div>

          {/* Submit button */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 10 }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={type === 'LOST' ? 'btn-lost' : 'btn-found'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              <span>{isSubmitting ? 'Indexing...' : `Publish ${type === 'LOST' ? 'Lost Report' : 'Found Report'}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
