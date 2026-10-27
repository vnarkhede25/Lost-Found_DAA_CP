import React, { useState } from 'react';
import type { Item } from '../types';
import { X, PlusCircle, ShieldCheck, Upload, AlertCircle, Sparkles } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
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
  isOpen,
  initialType,
  currentUser,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<'LOST' | 'FOUND'>(initialType);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(CAMPUS_LOCATIONS[0].name);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoUrl, setPhotoUrl] = useState(PHOTO_PRESETS[0].url);
  const [contactPhone, setContactPhone] = useState('+1 (555) 234-5678');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter an item name');
      return;
    }
    if (!description.trim()) {
      setFormError('Please provide a brief description to help identify the item');
      return;
    }

    setFormError('');
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
        contactPhone
      });
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620, backgroundColor: '#ffffff' }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {type === 'LOST' ? 'Report a Lost Item' : 'Report a Found Item'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Submit details to campus directory for instant algorithmic matching
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-surface)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {formError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              backgroundColor: 'var(--lost-bg)',
              color: 'var(--lost-color)',
              border: '1px solid var(--lost-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.86rem',
              marginBottom: 18
            }}>
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          {/* Type Toggle */}
          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Report Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                onClick={() => setType('LOST')}
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: type === 'LOST' ? '2px solid var(--lost-color)' : '1px solid var(--border-medium)',
                  backgroundColor: type === 'LOST' ? 'var(--lost-bg)' : '#ffffff',
                  color: type === 'LOST' ? 'var(--lost-color)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Lost by Me
              </button>
              <button
                type="button"
                onClick={() => setType('FOUND')}
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: type === 'FOUND' ? '2px solid var(--found-color)' : '1px solid var(--border-medium)',
                  backgroundColor: type === 'FOUND' ? 'var(--found-bg)' : '#ffffff',
                  color: type === 'FOUND' ? 'var(--found-color)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Found by Me
              </button>
            </div>
          </div>

          {/* Item Name */}
          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Item Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Space Gray 13-inch MacBook Pro, Hydro Flask..."
              className="form-input"
            />
          </div>

          {/* Category & Date Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
            <div>
              <label className="form-label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input"
              >
                <option value="Electronics">Electronics</option>
                <option value="Accessories">Accessories</option>
                <option value="Bags & Wallets">Bags &amp; Wallets</option>
                <option value="Keys">Keys</option>
                <option value="Books & Stationery">Books &amp; Stationery</option>
                <option value="IDs & Cards">IDs &amp; Cards</option>
              </select>
            </div>

            <div>
              <label className="form-label">Incident Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Location */}
          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Campus Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-input"
            >
              {CAMPUS_LOCATIONS.map(loc => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Detailed Description *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide color, stickers, specific scratches, or key tags to allow the algorithm to match accurately..."
              className="form-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Photo Preset Selector */}
          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Item Photo Preview</label>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 10 }}>
              {PHOTO_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPhotoUrl(p.url)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: photoUrl === p.url ? '1px solid var(--primary)' : '1px solid var(--border-medium)',
                    backgroundColor: photoUrl === p.url ? 'var(--primary-bg)' : '#ffffff',
                    color: photoUrl === p.url ? 'var(--primary)' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 10,
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <img
                src={photoUrl}
                alt="Item thumbnail"
                style={{ width: 60, height: 60, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Photo URL</span>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="form-input"
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                />
              </div>
            </div>
          </div>



          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            paddingTop: 16,
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{
                backgroundColor: type === 'LOST' ? 'var(--lost-color)' : 'var(--found-color)'
              }}
            >
              {isSubmitting ? 'Saving Report...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
