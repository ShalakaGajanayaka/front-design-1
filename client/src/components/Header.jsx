import React, { useState } from 'react';
import { Menu, X, ArrowUpRight, Compass, Shield } from 'lucide-react';

export default function Header({ onOpenInquiry, onOpenEditorial, onLogoClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (section) => {
    setMobileMenuOpen(false);
    onOpenEditorial(section);
  };

  const handlePlanClick = () => {
    setMobileMenuOpen(false);
    onOpenInquiry();
  };

  return (
    <>
      <header className="site-header" role="banner">
        <div className="header-inner">
          {/* Brand Identity / Left */}
          <button 
            onClick={onLogoClick} 
            className="brand-link" 
            aria-label="Ceylon Escapes - Home"
          >
            <div className="brand-monogram" aria-hidden="true">
              <svg viewBox="0 0 28 28" fill="none" className="brand-svg">
                <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                <path d="M14 4 L17 14 L14 24 L11 14 Z" fill="currentColor" />
                <circle cx="14" cy="14" r="1.5" fill="#06101e" />
              </svg>
            </div>
            <div className="brand-text-group">
              <span className="brand-name">CEYLON ESCAPES</span>
              <span className="brand-subtitle">SRI LANKA</span>
            </div>
          </button>

          {/* Desktop Center Navigation Links */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            <ul className="nav-list">
              <li>
                <button 
                  onClick={() => handleNavClick('discover')} 
                  className="nav-link"
                >
                  Discover
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('experiences')} 
                  className="nav-link"
                >
                  Experiences
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('story')} 
                  className="nav-link"
                >
                  Our Story
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('contact')} 
                  className="nav-link"
                >
                  Contact
                </button>
              </li>
            </ul>
          </nav>

          {/* Right: Tasteful Outlined "Plan Your Journey" Action */}
          <div className="header-cta-group">
            <button 
              onClick={handlePlanClick} 
              className="btn-plan-journey"
              aria-label="Plan your bespoke Sri Lankan journey"
            >
              <span>Plan Your Journey</span>
              <ArrowUpRight size={15} className="cta-icon-hover" />
            </button>

            {/* Accessible Mobile Menu Toggle Button */}
            <button 
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="mobile-menu-toggle"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <div 
        className={`mobile-nav-drawer ${mobileMenuOpen ? 'drawer-open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="mobile-nav-backdrop" onClick={() => setMobileMenuOpen(false)} />
        <div className="mobile-nav-sheet">
          <div className="mobile-sheet-top">
            <div className="brand-text-group">
              <span className="brand-name">CEYLON ESCAPES</span>
              <span className="brand-subtitle">Private Concierge</span>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-close-btn"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="mobile-links-list">
            <button onClick={() => handleNavClick('discover')} className="mobile-link-item">
              <span>Discover</span>
              <ArrowUpRight size={18} />
            </button>
            <button onClick={() => handleNavClick('experiences')} className="mobile-link-item">
              <span>Experiences</span>
              <ArrowUpRight size={18} />
            </button>
            <button onClick={() => handleNavClick('story')} className="mobile-link-item">
              <span>Our Story</span>
              <ArrowUpRight size={18} />
            </button>
            <button onClick={() => handleNavClick('contact')} className="mobile-link-item">
              <span>Contact Concierge</span>
              <ArrowUpRight size={18} />
            </button>
          </nav>

          <div className="mobile-sheet-footer">
            <button 
              onClick={handlePlanClick}
              className="btn-gold-luxury w-full"
            >
              <span>Plan Your Journey</span>
              <ArrowUpRight size={16} />
            </button>

            <div className="concierge-quick-info">
              <span>Colombo • London</span>
              <span>concierge@ceylonescapes.com</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
