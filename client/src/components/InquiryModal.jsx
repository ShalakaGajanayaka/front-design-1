import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import { DESTINATIONS } from '../data/destinations';

export default function InquiryModal({ isOpen, onClose, preselectedDestination }) {
  const [formData, setFormData] = useState({
    destination: preselectedDestination || 'all',
    travelStyle: 'Bespoke Private Itinerary',
    duration: '10 to 14 Days',
    guests: '2 Guests',
    fullName: '',
    email: '',
    phone: '',
    notes: ''
  });

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (preselectedDestination) {
      setFormData((prev) => ({ ...prev, destination: preselectedDestination }));
    }
  }, [preselectedDestination]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" role="dialog" aria-modal="true" aria-labelledby="inquiry-title">
      <div className="modal-backdrop-click" onClick={onClose} />
      
      <div className="modal-luxury-card">
        <button 
          onClick={onClose} 
          className="modal-close-btn"
          aria-label="Close inquiry window"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="modal-success-state">
            <div className="success-icon-wrap">
              <CheckCircle size={52} className="text-gold" />
            </div>
            <span className="modal-eyebrow">YOUR JOURNEY AWAITS</span>
            <h2 className="modal-heading">Enquiry Received with Honour</h2>
            <p className="modal-lead">
              Thank you, <strong>{formData.fullName}</strong>. A dedicated Ceylon Escapes Private Concierge has been assigned to your travel profile and will reach out within 12 hours with a bespoke proposal.
            </p>
            <div className="concierge-meta-box">
              <span>Direct Reference: CE-{Math.floor(100000 + Math.random() * 900000)}</span>
              <span>Priority: Discerning Private Travel</span>
            </div>
            <button onClick={handleReset} className="btn-gold-luxury mt-6">
              Return to Experience
            </button>
          </div>
        ) : (
          <div className="modal-form-content">
            <div className="modal-header-section">
              <div className="modal-badge">
                <Compass size={14} />
                <span>BESPOKE CEYLON ITINERARY</span>
              </div>
              <h2 id="inquiry-title" className="modal-heading">Plan Your Private Journey</h2>
              <p className="modal-lead">
                Every journey is uniquely designed by our Sri Lankan specialists. Share your vision and let our curators craft your itinerary.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="luxury-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="destination-select" className="form-label">Primary Region / Focus</label>
                  <select 
                    id="destination-select"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="form-input"
                  >
                    <option value="all">Grand Island Exploration (All Regions)</option>
                    {DESTINATIONS.map((d) => (
                      <option key={d.id} value={d.name}>{d.name} — {d.eyebrow}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="travel-style" className="form-label">Curated Experience Style</label>
                  <select 
                    id="travel-style"
                    value={formData.travelStyle}
                    onChange={(e) => setFormData({ ...formData, travelStyle: e.target.value })}
                    className="form-input"
                  >
                    <option value="Bespoke Private Itinerary">Bespoke Private Itinerary</option>
                    <option value="Heritage, Citadel & Tea Country">Heritage, Citadel & Tea Country</option>
                    <option value="Private Wildlife Safaris & Marine Life">Private Wildlife Safaris & Marine Life</option>
                    <option value="Coastal Villas & Ayurvedic Sanctuary">Coastal Villas & Ayurvedic Sanctuary</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="duration-select" className="form-label">Expected Duration</label>
                  <select 
                    id="duration-select"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="form-input"
                  >
                    <option value="7 to 10 Days">7 to 10 Days</option>
                    <option value="10 to 14 Days">10 to 14 Days</option>
                    <option value="15 to 21 Days">15 to 21 Days</option>
                    <option value="Over 3 Weeks">Over 3 Weeks</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="guests-select" className="form-label">Travel Party Size</label>
                  <select 
                    id="guests-select"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    className="form-input"
                  >
                    <option value="Solo Traveler">Solo Traveler</option>
                    <option value="2 Guests (Couple)">2 Guests (Couple)</option>
                    <option value="Small Family (3-4)">Small Family (3–4)</option>
                    <option value="Private Group (5+)">Private Group (5+)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="full-name" className="form-label">Full Name *</label>
                  <input 
                    id="full-name"
                    type="text" 
                    required
                    placeholder="e.g. Lord Alistair Campbell"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email-addr" className="form-label">Direct Email *</label>
                  <input 
                    id="email-addr"
                    type="email" 
                    required
                    placeholder="concierge@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes-field" className="form-label">Private Preferences or Wishlist</label>
                <textarea 
                  id="notes-field"
                  rows={3}
                  placeholder="Private helicopter transfers, tea estate bungalows, wildlife specialist requirements..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-submit-row">
                <div className="form-assurance">
                  <ShieldCheck size={16} />
                  <span>Discreet, confidential consultations. No unsolicited calls.</span>
                </div>

                <button type="submit" className="btn-gold-luxury">
                  <span>Submit Itinerary Request</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
