import React, { useEffect } from 'react';
import { X, ArrowRight, Compass, Shield } from 'lucide-react';
import { EDITORIAL_SECTIONS } from '../data/destinations';

export default function EditorialModal({ sectionKey, onClose, onOpenInquiry }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (sectionKey) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [sectionKey, onClose]);

  if (!sectionKey || !EDITORIAL_SECTIONS[sectionKey]) return null;

  const content = EDITORIAL_SECTIONS[sectionKey];

  return (
    <div className="modal-backdrop-overlay" role="dialog" aria-modal="true" aria-labelledby="editorial-title">
      <div className="modal-backdrop-click" onClick={onClose} />
      
      <div className="modal-luxury-card editorial-card-view">
        <button 
          onClick={onClose} 
          className="modal-close-btn"
          aria-label="Close article"
        >
          <X size={20} />
        </button>

        <div className="editorial-modal-content">
          <div className="modal-badge">
            <Compass size={14} />
            <span>CEYLON ESCAPES ARCHIVE</span>
          </div>

          <h2 id="editorial-title" className="editorial-main-title">{content.title}</h2>
          <span className="editorial-tagline">{content.tagline}</span>

          <p className="editorial-lead-para">{content.lead}</p>

          <div className="editorial-body-paras">
            {content.paragraphs.map((p, i) => (
              <p key={i} className="editorial-p">{p}</p>
            ))}
          </div>

          <div className="editorial-cta-bar">
            <button 
              onClick={() => {
                onClose();
                onOpenInquiry();
              }}
              className="btn-gold-luxury"
            >
              <span>Design an Itinerary Around This</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
