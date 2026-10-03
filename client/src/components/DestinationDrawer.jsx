import React from 'react';
import { DESTINATIONS } from '../data/destinations';
import { X, ArrowRight, MapPin, Sparkles } from 'lucide-react';

export default function DestinationDrawer({ 
  isOpen, 
  onClose, 
  activeId, 
  onSelectDestination 
}) {
  if (!isOpen) return null;

  return (
    <div className="destination-drawer-overlay">
      <div className="destination-drawer-backdrop" onClick={onClose} />
      <div className="destination-drawer-card">
        <div className="drawer-card-header">
          <div>
            <span className="drawer-eyebrow">SRI LANKAN EXPEDITIONS</span>
            <h2 className="drawer-title">Curated Havens & Landmarks</h2>
          </div>
          <button 
            onClick={onClose} 
            className="drawer-close-btn"
            aria-label="Close destinations overview"
          >
            <X size={20} />
          </button>
        </div>

        <div className="drawer-destinations-grid">
          {DESTINATIONS.map((dest, idx) => {
            const isActive = dest.id === activeId;
            return (
              <div 
                key={dest.id}
                onClick={() => {
                  onSelectDestination(idx);
                  onClose();
                }}
                className={`destination-card-preview ${isActive ? 'card-active' : ''}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectDestination(idx);
                    onClose();
                  }
                }}
              >
                <div className="card-image-wrap">
                  <img src={dest.image} alt={dest.name} className="card-thumb" />
                  <span className="card-num">{dest.sceneNumber}</span>
                  {isActive && <span className="card-active-badge">Now Viewing</span>}
                </div>

                <div className="card-body">
                  <span className="card-eyebrow">{dest.eyebrow}</span>
                  <h3 className="card-heading">{dest.name}</h3>
                  <p className="card-lead">{dest.headline}</p>
                  
                  <div className="card-meta">
                    <MapPin size={12} />
                    <span>{dest.highlight}</span>
                  </div>
                </div>

                <div className="card-arrow-wrap">
                  <ArrowRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
