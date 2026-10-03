import React, { useState } from 'react';
import Header from '../components/Header';
import GlobeIntro from '../components/GlobeIntro';
import DestinationViewer from '../components/DestinationViewer';
import DestinationDrawer from '../components/DestinationDrawer';
import InquiryModal from '../components/InquiryModal';
import EditorialModal from '../components/EditorialModal';
import { DESTINATIONS } from '../data/destinations';
import '../styles/hero.css';

export default function Home() {
  // Experience Modes: 'globe' | 'destinations'
  const [experienceMode, setExperienceMode] = useState('globe');
  const [isReturnVisit, setIsReturnVisit] = useState(false);
  const [activeDestinationIndex, setActiveDestinationIndex] = useState(0);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [inquiryState, setInquiryState] = useState({ isOpen: false, preselectedDestination: '' });
  const [editorialSection, setEditorialSection] = useState(null);

  // Transition seamlessly from Globe to Destinations
  const handleEnterDestinations = () => {
    setExperienceMode('destinations');
    setIsReturnVisit(true);
  };

  // Return to 3D Globe overview
  const handleReturnToGlobe = () => {
    setExperienceMode('globe');
  };

  // Open bespoke travel inquiry modal
  const handleOpenInquiry = (destinationName = '') => {
    setInquiryState({ isOpen: true, preselectedDestination: destinationName });
  };

  const handleCloseInquiry = () => {
    setInquiryState({ isOpen: false, preselectedDestination: '' });
  };

  // Open editorial story modal for navigation items
  const handleOpenEditorial = (sectionKey) => {
    setEditorialSection(sectionKey);
  };

  const handleCloseEditorial = () => {
    setEditorialSection(null);
  };

  return (
    <main className="hero-master-viewport">
      {/* 1. Transparent Luxury Navigation Header */}
      <Header 
        onOpenInquiry={() => handleOpenInquiry()}
        onOpenEditorial={handleOpenEditorial}
        onLogoClick={() => handleReturnToGlobe()}
      />

      {/* 2. Stage 1 & 2: Interactive 3D Earth Globe Experience */}
      {experienceMode === 'globe' && (
        <GlobeIntro 
          active={experienceMode === 'globe'}
          isReturnVisit={isReturnVisit}
          onEnterDestinations={handleEnterDestinations}
        />
      )}

      {/* 3. Stage 3: Full-Screen Destination Viewer with Signature Transitions */}
      {experienceMode === 'destinations' && (
        <DestinationViewer 
          onReturnToGlobe={handleReturnToGlobe}
          onOpenInquiry={handleOpenInquiry}
          onOpenSelector={() => setIsSelectorOpen(true)}
          isSelectorOpen={isSelectorOpen}
          activeDestinationIndex={activeDestinationIndex}
          onDestinationChange={(idx) => setActiveDestinationIndex(idx)}
        />
      )}

      {/* 4. In-Hero Destination Quick Selector Drawer */}
      <DestinationDrawer 
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        activeId={DESTINATIONS[activeDestinationIndex]?.id}
        onSelectDestination={(idx) => {
          setActiveDestinationIndex(idx);
          setIsSelectorOpen(false);
        }}
      />

      {/* 5. Luxury Travel Inquiry / Itinerary Modal */}
      <InquiryModal 
        isOpen={inquiryState.isOpen}
        onClose={handleCloseInquiry}
        preselectedDestination={inquiryState.preselectedDestination}
      />

      {/* 6. Editorial Archive Modal for Navigation Stories */}
      <EditorialModal 
        sectionKey={editorialSection}
        onClose={handleCloseEditorial}
        onOpenInquiry={() => handleOpenInquiry()}
      />
    </main>
  );
}
