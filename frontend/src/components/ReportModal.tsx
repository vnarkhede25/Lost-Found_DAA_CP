import React, { useState, useRef } from 'react';
import type { Item } from '../types';
import { X, Upload, AlertCircle, Camera, Image as ImageIcon, Trash2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  initialType: 'LOST' | 'FOUND';
  currentUser: string;
  onClose: () => void;
  onSubmit: (item: Partial<Item>) => Promise<void>;
}

const STANDARD_CATEGORIES = [
  'Electronics',
  'IDs, Cards & Documents',
  'Bags, Backpacks & Wallets',
  'Keys & Keychains',
  'Clothing & Footwear',
  'Accessories & Jewelry',
  'Books & Stationery',
  'Bottles & Flasks',
  'Sports Equipment',
  'Other (Specify Custom Category)'
];

const PHOTO_PRESETS = [
  { label: 'AirPods / Earbuds', url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80' },
  { label: 'Laptop / MacBook', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80' },
  { label: 'Keys / Keychain', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80' },
  { label: 'Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80' },
  { label: 'Water Bottle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80' },
  { label: 'Phone / iPhone', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80' }
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
  const [categoryChoice, setCategoryChoice] = useState('Electronics');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [reward, setReward] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    setFormError('');
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    setUploadedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter an item name');
      return;
    }
    if (!location.trim()) {
      setFormError('Please enter the location where the item was lost or found');
      return;
    }
    if (!description.trim()) {
      setFormError('Please provide a brief description to help identify the item');
      return;
    }

    // Determine final category (custom or chosen)
    let finalCategory = categoryChoice;
    if (categoryChoice === 'Other (Specify Custom Category)') {
      if (!customCategory.trim()) {
        setFormError('Please specify the custom category name');
        return;
      }
      finalCategory = customCategory.trim();
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      await onSubmit({
        type,
        name: name.trim(),
        category: finalCategory,
        description: description.trim(),
        location: location.trim(),
        date,
        reporterEmail: currentUser,
        reporterName: currentUser.split('@')[0].replace('.', ' '),
        status: 'OPEN',
        photoUrl: photoUrl || PHOTO_PRESETS[0].url,
        latitude: 50,
        longitude: 50,
        contactPhone: contactPhone.trim() || undefined,
        reward: reward.trim() || undefined
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#ffffff', borderRadius: '16px' }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {type === 'LOST' ? 'Report a Lost Item' : 'Report a Found Item'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Publish listing for instant smart matching and peer-to-peer recovery
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-surface)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              width: 34,
              height: 34,
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
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: type === 'LOST' ? '2px solid var(--lost-color)' : '1px solid var(--border-medium)',
                  backgroundColor: type === 'LOST' ? 'var(--lost-bg)' : '#ffffff',
                  color: type === 'LOST' ? 'var(--lost-color)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Lost by Me
              </button>
              <button
                type="button"
                onClick={() => setType('FOUND')}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: type === 'FOUND' ? '2px solid var(--found-color)' : '1px solid var(--border-medium)',
                  backgroundColor: type === 'FOUND' ? 'var(--found-bg)' : '#ffffff',
                  color: type === 'FOUND' ? 'var(--found-color)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Found by Me
              </button>
            </div>
          </div>

          {/* Item Title */}
          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Item Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Space Gray 13-inch MacBook Pro, Hydro Flask, Student ID Card..."
              className="form-input"
            />
          </div>

          {/* Category Dropdown (Flexible with custom option) */}
          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Category *</label>
            <select
              value={categoryChoice}
              onChange={(e) => setCategoryChoice(e.target.value)}
              className="form-input"
              style={{ fontWeight: 500 }}
            >
              {STANDARD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {categoryChoice === 'Other (Specify Custom Category)' && (
              <div style={{ marginTop: 10 }}>
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category name (e.g. Musical Instrument, Umbrella, Lab Equipment...)"
                  className="form-input"
                  style={{ borderColor: 'var(--primary)', backgroundColor: 'rgba(2, 132, 199, 0.03)' }}
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Incident Date & Contact Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
            <div>
              <label className="form-label">Incident Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Your Phone Number</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="form-input"
              />
            </div>
          </div>

          {/* Location as Text Field (Not Dropdown) */}
          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Exact Location *</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Central Library 2nd floor desk #14, Student Gym bleachers, Dining Hall courtyard table..."
              className="form-input"
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
              Type the specific campus building, floor, room number or spot
            </span>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Detailed Description *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide color, stickers, distinctive marks, scratches, or contents to help matching..."
              className="form-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Optional Reward for Lost Items */}
          {type === 'LOST' && (
            <div style={{ marginBottom: 18 }}>
              <label className="form-label">Reward (Optional)</label>
              <input
                type="text"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                placeholder="e.g. $25 Coffee Gift Card, Cash Reward..."
                className="form-input"
              />
            </div>
          )}

          {/* Image Upload from Device (Not URL/link) */}
          <div style={{ marginBottom: 20 }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Upload Item Photo</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>Supports Mobile Camera &amp; File Picker</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageFileChange}
            />

            {!photoUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px 16px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.backgroundColor = 'rgba(2, 132, 199, 0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-medium)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(2, 132, 199, 0.1)',
                  color: 'var(--primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10
                }}>
                  <Camera size={24} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                  Choose Photo or Take Picture
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Click to browse from device gallery or camera (PNG, JPG, Max 5MB)
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-medium)',
                backgroundColor: 'var(--bg-surface)'
              }}>
                <img
                  src={photoUrl}
                  alt="Uploaded preview"
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid var(--border-subtle)',
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {uploadedFileName || 'Uploaded Photo'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--found-color)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    ✓ Ready to upload with report
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--lost-color)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Presets (Optional sample fallback) */}
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Or select a sample item icon:
              </span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {PHOTO_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPhotoUrl(p.url);
                      setUploadedFileName(p.label);
                    }}
                    style={{
                      padding: '4px 9px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.74rem',
                      fontWeight: 500,
                      border: photoUrl === p.url ? '1.5px solid var(--primary)' : '1px solid var(--border-medium)',
                      backgroundColor: photoUrl === p.url ? 'var(--primary-bg)' : '#ffffff',
                      color: photoUrl === p.url ? 'var(--primary)' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            paddingTop: 18,
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary"
              style={{ padding: '10px 20px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{
                padding: '10px 24px',
                backgroundColor: type === 'LOST' ? 'var(--lost-color)' : 'var(--found-color)',
                fontWeight: 700
              }}
            >
              {isSubmitting ? 'Publishing Report...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
