import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DESTINATIONS } from '../data/destinations';
import { 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  Globe as GlobeIcon, 
  Compass, 
  ArrowRight,
  Layers,
  MapPin
} from 'lucide-react';

const SCENE_DURATION_MS = 6500;
const TRANSITION_DURATION_MS = 1400;

export default function DestinationViewer({ 
  onReturnToGlobe, 
  onOpenInquiry,
  onOpenSelector,
  isSelectorOpen,
  activeDestinationIndex = 0,
  onDestinationChange
}) {
  const [currentIndex, setCurrentIndex] = useState(activeDestinationIndex);
  const [prevIndex, setPrevIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState('next'); // 'next' or 'prev'
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Touch swipe handling
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchDistanceRef = useRef(0);

  // Timer and progress animation
  const progressStartTimeRef = useRef(Date.now());
  const pausedProgressRef = useRef(0);
  const animFrameRef = useRef(null);
  const isTransitioningRef = useRef(false);

  isTransitioningRef.current = isTransitioning;

  // Preload next and previous images
  useEffect(() => {
    DESTINATIONS.forEach((dest) => {
      const img = new Image();
      img.src = dest.image;
    });
  }, []);

  // Coordinated Destination Change
  const goToDestination = useCallback((targetIndex, dir = 'next') => {
    if (isTransitioningRef.current || targetIndex === currentIndex) return;

    setPrevIndex(currentIndex);
    setCurrentIndex(targetIndex);
    setDirection(dir);
    setIsTransitioning(true);
    setProgress(0);
    pausedProgressRef.current = 0;
    progressStartTimeRef.current = Date.now();

    if (onDestinationChange) {
      onDestinationChange(targetIndex);
    }

    // Settle transition after duration
    setTimeout(() => {
      setIsTransitioning(false);
      setPrevIndex(null);
      progressStartTimeRef.current = Date.now();
    }, TRANSITION_DURATION_MS);
  }, [currentIndex, onDestinationChange]);

  // Sync external index changes (e.g. from drawer)
  useEffect(() => {
    if (activeDestinationIndex !== undefined && activeDestinationIndex !== currentIndex) {
      goToDestination(activeDestinationIndex, activeDestinationIndex > currentIndex ? 'next' : 'prev');
    }
  }, [activeDestinationIndex, currentIndex, goToDestination]);

  const handleNext = useCallback(() => {
    const nextIdx = (currentIndex + 1) % DESTINATIONS.length;
    goToDestination(nextIdx, 'next');
  }, [currentIndex, goToDestination]);

  const handlePrev = useCallback(() => {
    const prevIdx = (currentIndex - 1 + DESTINATIONS.length) % DESTINATIONS.length;
    goToDestination(prevIdx, 'prev');
  }, [currentIndex, goToDestination]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Autoplay and Progress Loop
  useEffect(() => {
    if (isPaused || isTransitioning) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    progressStartTimeRef.current = Date.now() - (pausedProgressRef.current * SCENE_DURATION_MS);

    const updateProgress = () => {
      const elapsed = Date.now() - progressStartTimeRef.current;
      const currentPct = Math.min(elapsed / SCENE_DURATION_MS, 1);
      setProgress(currentPct);
      pausedProgressRef.current = currentPct;

      if (currentPct >= 1) {
        handleNext();
      } else {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentIndex, isPaused, isTransitioning, handleNext]);

  // Pause when browser tab is inactive / hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Keyboard navigation (ArrowLeft / ArrowRight / Spacebar to pause)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't hijack if user is in an input or textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, togglePause]);

  // Touch Swipe gestures on mobile
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchDistanceRef.current = 0;
  };

  const handleTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - touchStartXRef.current;
    const deltaY = e.touches[0].clientY - touchStartYRef.current;
    
    // Only register horizontal swipe if dominant over vertical scroll
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      touchDistanceRef.current = deltaX;
    }
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDistanceRef.current) > 50) {
      if (touchDistanceRef.current < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchDistanceRef.current = 0;
  };

  const activeDest = DESTINATIONS[currentIndex];
  const prevDest = prevIndex !== null ? DESTINATIONS[prevIndex] : null;

  return (
    <div 
      className="destination-viewer"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Sri Lanka Destination Showcase"
      tabIndex={0}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Visual Canvas Layer for Cinematic Scenes */}
      <div className="destination-visual-stage">
        {/* Outgoing Scene (Active during signature transition) */}
        {prevDest && (
          <div 
            className={`scene-layer scene-outgoing ${direction === 'next' ? 'slide-out-left' : 'slide-out-right'}`}
            key={`prev-${prevDest.id}`}
          >
            <img 
              src={prevDest.image} 
              alt={prevDest.name}
              className="scene-image"
              style={{ objectPosition: prevDest.focalPoint }}
            />
          </div>
        )}

        {/* Incoming / Active Scene */}
        <div 
          className={`scene-layer scene-active ${
            isTransitioning ? (direction === 'next' ? 'reveal-from-right' : 'reveal-from-left') : 'scene-ken-burns'
          }`}
          key={`active-${activeDest.id}`}
        >
          <img 
            src={activeDest.image} 
            alt={activeDest.name}
            className="scene-image"
            style={{ objectPosition: activeDest.focalPoint }}
          />
        </div>

        {/* Master Atmospheric Vignette Gradients (Protects Text Readability) */}
        <div className="cinematic-gradient-overlay" />
        <div className="scenery-glow-accent" />
      </div>

      {/* Hero Editorial Text Stage */}
      <div className="destination-content-stage">
        <div className="destination-editorial-container">
          {/* Eyebrow / Region Indicator */}
          <div className="hero-eyebrow-wrapper">
            <span className="eyebrow-accent-line" />
            <span className="hero-eyebrow-text">
              {activeDest.eyebrow} • {activeDest.region.toUpperCase()}
            </span>
          </div>

          {/* Staggered Master Headline */}
          <h1 className="hero-headline" key={`head-${activeDest.id}`}>
            <span className="headline-line headline-line-1">
              {activeDest.headline}
            </span>
          </h1>

          {/* Supporting Copy & Key Highlight */}
          <p className="hero-description" key={`desc-${activeDest.id}`}>
            {activeDest.description}
          </p>

          <div className="hero-spec-tag">
            <MapPin size={13} className="spec-icon" />
            <span>{activeDest.highlight}</span>
            <span className="spec-divider">•</span>
            <span>{activeDest.elevation}</span>
          </div>

          {/* Primary & Secondary Call to Actions */}
          <div className="hero-actions-row">
            <button 
              onClick={() => onOpenInquiry(activeDest.name)}
              className="btn-gold-luxury"
              aria-label={`Design your journey to ${activeDest.name}`}
            >
              <span>Design My Journey</span>
              <ArrowRight size={17} />
            </button>

            <button 
              onClick={onOpenSelector}
              className={`btn-explore-island ${isSelectorOpen ? 'btn-active' : ''}`}
              aria-label="Explore other Sri Lankan destinations"
            >
              <Layers size={16} />
              <span>Explore the Island</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Hero Control Deck */}
      <div className="hero-controls-bar">
        {/* Left: Active Scene Number & Destination Indicator */}
        <div className="control-left-status">
          <div className="scene-fraction">
            <span className="current-num">{activeDest.sceneNumber}</span>
            <span className="slash">/</span>
            <span className="total-num">05</span>
          </div>

          <div className="destination-name-pill">
            <span className="dest-title">{activeDest.name}</span>
            <span className="dest-coords">
              {activeDest.coordinates.lat.toFixed(2)}°N, {activeDest.coordinates.lon.toFixed(2)}°E
            </span>
          </div>
        </div>

        {/* Center: Thin Progress Bar */}
        <div className="control-progress-container" title="Scene progression timer">
          <div 
            className="control-progress-fill"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Right: Prev, Play/Pause, Next & Return to Globe */}
        <div className="control-actions-group">
          {/* Pause / Play Toggle */}
          <button 
            onClick={togglePause} 
            className="control-btn"
            aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
            title={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
          >
            {isPaused ? <Play size={15} /> : <Pause size={15} />}
          </button>

          {/* Prev Scene */}
          <button 
            onClick={handlePrev} 
            disabled={isTransitioning}
            className="control-btn"
            aria-label="Previous destination"
            title="Previous scene (Left Arrow)"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Next Scene */}
          <button 
            onClick={handleNext} 
            disabled={isTransitioning}
            className="control-btn"
            aria-label="Next destination"
            title="Next scene (Right Arrow)"
          >
            <ChevronRight size={18} />
          </button>

          {/* Return to Globe Button */}
          <button 
            onClick={onReturnToGlobe}
            className="control-btn-globe"
            aria-label="Return to 3D Globe overview"
            title="Return to global view"
          >
            <GlobeIcon size={14} />
            <span className="globe-btn-label">View globe</span>
          </button>
        </div>
      </div>
    </div>
  );
}
