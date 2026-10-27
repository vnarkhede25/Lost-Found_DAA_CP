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
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px 60px' }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '24px 28px', marginBottom: 24, backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--resolved-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--resolved-color)'
              }}>
                <Radio size={20} />
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Spatial QuadTree 2D Campus Radar
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, maxWidth: 750 }}>
              Click anywhere on the coordinate plane to position your search radar. The QuadTree data structure prunes
              irrelevant bounding boxes in <strong>O(log n)</strong> time to retrieve items within your campus radius.
            </p>
          </div>

          {/* Quick preset locations */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { name: 'Library (25, 48)', x: 25, y: 48 },
              { name: 'Student Gym (62, 32)', x: 62, y: 32 },
              { name: 'Dining Courtyard (45, 75)', x: 45, y: 75 },
              { name: 'Engineering (80, 20)', x: 80, y: 20 }
            ].map(loc => (
              <button
                key={loc.name}
                onClick={() => { setCenterX(loc.x); setCenterY(loc.y); }}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                <MapPin size={12} color="var(--primary)" /> {loc.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: 2D Radar Canvas & Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        {/* Interactive Coordinate Canvas */}
        <div className="card" style={{ padding: 24, backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
              Interactive Coordinate Grid (100 × 100)
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Center: ({centerX}, {centerY}) • Radius: {radius}%
            </span>
          </div>

          <div
            onClick={handleMapClick}
            style={{
              position: 'relative',
              width: '100%',
              height: 380,
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--border-medium)',
              cursor: 'crosshair',
              overflow: 'hidden',
              backgroundImage: 'radial-gradient(var(--border-medium) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          >
            {/* QuadTree 4 Quadrants Divider Lines */}
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(79, 70, 229, 0.2)' }} />
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(79, 70, 229, 0.2)' }} />

            {/* Quadrant Labels */}
            <span style={{ position: 'absolute', top: 8, left: 10, fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>NW QUADRANT</span>
            <span style={{ position: 'absolute', top: 8, right: 10, fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>NE QUADRANT</span>
            <span style={{ position: 'absolute', bottom: 8, left: 10, fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>SW QUADRANT</span>
            <span style={{ position: 'absolute', bottom: 8, right: 10, fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>SE QUADRANT</span>

            {/* Active Radar Circle */}
            <div
              style={{
                position: 'absolute',
                left: `${centerX - radius}%`,
                top: `${centerY - radius}%`,
                width: `${radius * 2}%`,
                height: `${radius * 2}%`,
                borderRadius: '50%',
                backgroundColor: 'rgba(79, 70, 229, 0.12)',
                border: '2px dashed var(--primary)',
                pointerEvents: 'none',
                transition: 'all 0.2s ease'
              }}
            />

            {/* Center Pin Target */}
            <div
              style={{
                position: 'absolute',
                left: `${centerX}%`,
                top: `${centerY}%`,
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 10px rgba(79, 70, 229, 0.6)',
                pointerEvents: 'none'
              }}
            />

            {/* Items Pinned onto Canvas */}
            {items.map(item => {
              const ix = item.latitude || 50;
              const iy = item.longitude || 50;
              const isNearby = Math.hypot(ix - centerX, iy - centerY) <= radius;
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
                    left: `${ix}%`,
                    top: `${iy}%`,
                    width: isNearby ? 16 : 10,
                    height: isNearby ? 16 : 10,
                    borderRadius: '50%',
                    backgroundColor: item.type === 'LOST' ? 'var(--lost-color)' : 'var(--found-color)',
                    border: '2px solid #ffffff',
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: isNearby ? 10 : 5,
                    boxShadow: isNearby ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                />
              );
            })}
          </div>

          {/* Radar Radius Slider */}
          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Search Radius:</span>
            <input
              type="range"
              min="10"
              max="50"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--primary)' }}>{radius}%</span>
          </div>
        </div>

        {/* Nearby Items List */}
        <div className="card" style={{ padding: 24, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
              Items Inside Radius ({nearbyItems.length})
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Pruned by QuadTree Boundary
            </span>
          </div>

          {nearbyItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', margin: 'auto' }}>
              <Radio size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                No reported items located within this radius. Drag the center pin or click on a campus building.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto' }}>
              {nearbyItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span className={`badge ${item.type === 'LOST' ? 'badge-lost' : 'badge-found'}`}>
                        {item.type}
                      </span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.name}</strong>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.location}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(item);
                    }}
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.76rem' }}
                  >
                    <Eye size={13} /> View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
