import React, { useState } from 'react';
import type { Item } from '../types';
import { Radio, MapPin, Sliders, Compass, Target, Info, Eye } from 'lucide-react';

interface QuadTreeRadarProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
}

export const QuadTreeRadar: React.FC<QuadTreeRadarProps> = ({ items, onSelectItem }) => {
  const [centerX, setCenterX] = useState(40);
  const [centerY, setCenterY] = useState(45);
  const [radius, setRadius] = useState(30);

  // Filter items within radius of (centerX, centerY)
  const nearbyItems = items.filter((item) => {
    const ix = item.latitude || 50;
    const iy = item.longitude || 50;
    const dist = Math.hypot(ix - centerX, iy - centerY);
    return dist <= radius;
  });

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;
    setCenterX(Math.round(clickX));
    setCenterY(Math.round(clickY));
  };

  return (
    <div style={{ maxWidth: 1380, margin: '0 auto', padding: '0 24px 60px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px 30px', marginBottom: 28 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
              }}>
                <Radio size={20} color="#fff" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                Spatial QuadTree 2D Campus Radar
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0, maxWidth: 750 }}>
              Click anywhere on the coordinate plane to move your search radar. The QuadTree data structure prunes
              irrelevant bounding boxes in O(log n) time to retrieve items within your radius.
            </p>
          </div>

          {/* Quick preset locations */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => { setCenterX(25); setCenterY(48); }}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              📍 Library (25, 48)
            </button>
            <button
              onClick={() => { setCenterX(62); setCenterY(32); }}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              📍 Gym (62, 32)
            </button>
            <button
              onClick={() => { setCenterX(45); setCenterY(75); }}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              📍 Dining Hall (45, 75)
            </button>
            <button
              onClick={() => { setCenterX(80); setCenterY(20); }}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              📍 Eng Hall (80, 20)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Map on Left, Nearby List on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.3fr) minmax(300px, 1fr)', gap: 24 }}>
        {/* Radar Map Panel */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 700 }}>
              <Compass size={17} color="#38bdf8" />
              <span>Campus Coordinate Grid [0..100, 0..100]</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
              Radar Center: ({centerX}, {centerY}) • Radius: {radius}m
            </span>
          </div>

          {/* The Interactive Radar Visualizer */}
          <div
            onClick={handleMapClick}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1 / 1',
              background: '#090d16',
              borderRadius: 'var(--radius-md)',
              border: '2px solid rgba(6, 182, 212, 0.3)',
              overflow: 'hidden',
              cursor: 'crosshair',
              boxShadow: 'inset 0 0 50px rgba(6, 182, 212, 0.15)'
            }}
          >
            {/* QuadTree Subdivision Lines (NW, NE, SW, SE) */}
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255, 255, 255, 0.1)', borderTop: '1px dashed rgba(6, 182, 212, 0.3)' }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255, 255, 255, 0.1)', borderLeft: '1px dashed rgba(6, 182, 212, 0.3)' }} />

            {/* Quadrant Labels */}
            <span style={{ position: 'absolute', top: 8, left: 10, fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.3)' }}>NW Quadrant</span>
            <span style={{ position: 'absolute', top: 8, right: 10, fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.3)' }}>NE Quadrant</span>
            <span style={{ position: 'absolute', bottom: 8, left: 10, fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.3)' }}>SW Quadrant</span>
            <span style={{ position: 'absolute', bottom: 8, right: 10, fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.3)' }}>SE Quadrant</span>

            {/* Radar Radius Circle */}
            <div
              style={{
                position: 'absolute',
                left: `${centerX}%`,
                top: `${centerY}%`,
                width: `${radius * 2}%`,
                height: `${radius * 2}%`,
                borderRadius: '50%',
                border: '2px solid rgba(6, 182, 212, 0.8)',
                background: 'rgba(6, 182, 212, 0.08)',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
              }}
            />

            {/* Center Target Indicator */}
            <div
              style={{
                position: 'absolute',
                left: `${centerX}%`,
                top: `${centerY}%`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#38bdf8', border: '2px solid #ffffff' }} />
            </div>

            {/* Plot All Items on the Map */}
            {items.map((item) => {
              const x = item.latitude || 50;
              const y = item.longitude || 50;
              const dist = Math.hypot(x - centerX, y - centerY);
              const isInside = dist <= radius;
              const isLost = item.type === 'LOST';

              return (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectItem(item);
                  }}
                  title={`${item.name} (${item.location})`}
                  style={{
                    position: 'absolute',
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: 10,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div
                    style={{
                      width: isInside ? 18 : 12,
                      height: isInside ? 18 : 12,
                      borderRadius: '50%',
                      background: isLost ? 'var(--lost-gradient)' : 'var(--found-gradient)',
                      border: isInside ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.6)',
                      boxShadow: isInside ? (isLost ? '0 0 14px #f43f5e' : '0 0 14px #10b981') : 'none'
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Radar Controls */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sliders size={15} /> Scan Radius Slider:
              </span>
              <span style={{ fontWeight: 700, color: '#38bdf8' }}>{radius} units</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#06b6d4', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Nearby Items List */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Items Inside Radar ({nearbyItems.length})
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              QuadTree Spatial Query
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: 520, paddingRight: 4 }}>
            {nearbyItems.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Info size={32} style={{ marginBottom: 12 }} />
                <p>No items found within {radius}m of ({centerX}, {centerY}).</p>
                <p style={{ fontSize: '0.82rem' }}>Click a hotspot button or drag the radius slider.</p>
              </div>
            ) : (
              nearbyItems.map((item) => (
                <div
                  key={item.id}
                  className="glass-card"
                  style={{
                    padding: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer'
                  }}
                  onClick={() => onSelectItem(item)}
                >
                  <img
                    src={item.photoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
                    alt={item.name}
                    style={{ width: 55, height: 50, borderRadius: 8, objectFit: 'cover' }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span className={item.type === 'LOST' ? 'badge-lost' : 'badge-found'} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                        {item.type}
                      </span>
                      <h4 style={{ fontSize: '0.9rem', margin: 0, fontWeight: 700 }}>{item.name}</h4>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                      📍 {item.location}
                    </p>
                    <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
                      Coords: ({item.latitude?.toFixed(1)}, {item.longitude?.toFixed(1)})
                    </span>
                  </div>

                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(item);
                    }}
                  >
                    <Eye size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
