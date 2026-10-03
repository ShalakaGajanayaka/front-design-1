import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';

// Sri Lanka Coordinates
const SRI_LANKA_LAT = 7.8731;
const SRI_LANKA_LON = 80.7718;
const EARTH_RADIUS = 2.4;

export default function GlobeIntro({ onEnterDestinations, active, isReturnVisit = false }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [stage, setStage] = useState(isReturnVisit ? 2 : 1);
  const [sriLankaScreenPos, setSriLankaScreenPos] = useState({ x: 0, y: 0, visible: false });
  const [isCloudCoverActive, setIsCloudCoverActive] = useState(false);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // Drag interaction refs
  const isDraggingRef = useRef(false);
  const previousPointerPosRef = useRef({ x: 0, y: 0 });

  // References for animation
  const sceneStateRef = useRef({
    earthGroup: null,
    cloudsMesh: null,
    camera: null,
    renderer: null,
    scene: null,
    markerMesh: null,
    targetRotationY: 0,
    targetRotationX: 0,
    currentRotationY: -Math.PI * 0.7,
    currentRotationX: 0.15,
    cameraDistance: 6.8,
    targetCameraDistance: 6.8,
    isZooming: false,
    animating: true,
    startTime: performance.now(),
    targetLookAtLatLon: isReturnVisit
  });

  // Calculate 3D position vector on sphere for given lat/lon
  const getCoordinatesVector = (lat, lon, radius, altitude = 0) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const r = radius + altitude;
    return new THREE.Vector3(
      -(r * Math.sin(phi) * Math.cos(theta)),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  };

  useEffect(() => {
    if (!active) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onEnterDestinations();
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneStateRef.current.scene = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.8);
    sceneStateRef.current.camera = camera;

    // 3. Renderer Setup with fallback detection
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      sceneStateRef.current.renderer = renderer;
    } catch {
      setWebGlSupported(false);
      return;
    }

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x0a1628, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.8);
    sunLight.position.set(6, 3, 5);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x1e3a5f, 1.4);
    rimLight.position.set(-6, -2, -4);
    scene.add(rimLight);

    // 5. Earth Group
    const earthGroup = new THREE.Group();
    earthGroup.rotation.x = 0.18;
    earthGroup.rotation.y = isReturnVisit 
      ? -((SRI_LANKA_LON + 90) * (Math.PI / 180)) 
      : -Math.PI * 0.7;
    scene.add(earthGroup);
    sceneStateRef.current.earthGroup = earthGroup;

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    const dayTexture = textureLoader.load('/textures/earth_daymap.jpg');
    const specTexture = textureLoader.load('/textures/earth_specular.jpg');
    const cloudsTexture = textureLoader.load('/textures/earth_clouds.png');

    dayTexture.colorSpace = THREE.SRGBColorSpace;

    // 6. Earth Surface Mesh
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: dayTexture,
      specularMap: specTexture,
      specular: new THREE.Color(0x334455),
      shininess: 18,
      bumpScale: 0.05
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earthMesh);

    // 7. Cloud Layer
    const cloudsGeometry = new THREE.SphereGeometry(EARTH_RADIUS + 0.035, 64, 64);
    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    earthGroup.add(cloudsMesh);
    sceneStateRef.current.cloudsMesh = cloudsMesh;

    // 8. Atmospheric Glow Shell (Fresnel Rim Effect)
    const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS + 0.18, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDirection = normalize(-vPosition);
          float intensity = pow(0.68 - dot(vNormal, viewDirection), 2.2);
          gl_FragColor = vec4(0.28, 0.65, 0.98, intensity * 0.75);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earthGroup.add(atmosphereMesh);

    // 9. Sri Lanka Marker Beacon
    const markerPos = getCoordinatesVector(SRI_LANKA_LAT, SRI_LANKA_LON, EARTH_RADIUS, 0.04);
    const markerGroup = new THREE.Group();
    markerGroup.position.copy(markerPos);
    markerGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), markerPos.clone().normalize());

    const ringGeo = new THREE.RingGeometry(0.04, 0.07, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    markerGroup.add(ringMesh);

    const dotGeo = new THREE.CircleGeometry(0.03, 32);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0xfff5d0,
      side: THREE.DoubleSide
    });
    const dotMesh = new THREE.Mesh(dotGeo, dotMat);
    dotMesh.rotation.x = Math.PI / 2;
    dotMesh.position.y = 0.005;
    markerGroup.add(dotMesh);

    earthGroup.add(markerGroup);
    sceneStateRef.current.markerMesh = markerGroup;

    // 10. Starfield Background
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 1400;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 80;
      starPositions[i + 1] = (Math.random() - 0.5) * 80;
      starPositions[i + 2] = -Math.random() * 40 - 10;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xbdd5ea,
      size: 0.12,
      transparent: true,
      opacity: 0.7
    });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 11. Animation Loop
    let animationFrameId;
    sceneStateRef.current.animating = true;

    const animate = (time) => {
      if (!sceneStateRef.current.animating) return;

      const state = sceneStateRef.current;

      if (cloudsMesh) {
        cloudsMesh.rotation.y += 0.0006;
      }

      if (markerGroup) {
        const pulse = 1 + 0.25 * Math.sin(time * 0.005);
        ringMesh.scale.set(pulse, pulse, pulse);
        ringMat.opacity = 0.6 + 0.4 * Math.sin(time * 0.005);
      }

      if (!isDraggingRef.current) {
        if (state.targetLookAtLatLon) {
          const targetRotY = -((SRI_LANKA_LON + 90) * (Math.PI / 180));
          const targetRotX = (SRI_LANKA_LAT * (Math.PI / 180)) * 0.3;
          earthGroup.rotation.y += (targetRotY - earthGroup.rotation.y) * 0.035;
          earthGroup.rotation.x += (targetRotX - earthGroup.rotation.x) * 0.035;
        } else {
          earthGroup.rotation.y += 0.0016;
        }
      }

      if (state.isZooming) {
        state.cameraDistance += (state.targetCameraDistance - state.cameraDistance) * 0.045;
        camera.position.z = state.cameraDistance;
      }

      if (markerGroup && camera) {
        const markerWorldPos = new THREE.Vector3();
        markerGroup.getWorldPosition(markerWorldPos);

        const cameraDir = camera.position.clone().sub(markerWorldPos).normalize();
        const markerNormal = markerWorldPos.clone().normalize();
        const dot = markerNormal.dot(cameraDir);

        if (dot > 0.15) {
          const projected = markerWorldPos.clone().project(camera);
          const screenX = (projected.x * 0.5 + 0.5) * window.innerWidth;
          const screenY = (-(projected.y * 0.5) + 0.5) * window.innerHeight;
          setSriLankaScreenPos({ x: screenX, y: screenY, visible: true });
        } else {
          setSriLankaScreenPos((prev) => ({ ...prev, visible: false }));
        }
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    let timerStage2, timerZoom, timerComplete;

    // Only run the 6-second auto-intro on initial visit
    if (!isReturnVisit) {
      timerStage2 = setTimeout(() => {
        setStage(2);
        sceneStateRef.current.targetLookAtLatLon = true;
      }, 2400);

      timerZoom = setTimeout(() => {
        setStage(3);
        sceneStateRef.current.isZooming = true;
        sceneStateRef.current.targetCameraDistance = 2.6;
        setIsCloudCoverActive(true);
      }, 4800);

      timerComplete = setTimeout(() => {
        onEnterDestinations();
      }, 6600);
    }

    // Cleanup
    return () => {
      sceneStateRef.current.animating = false;
      cancelAnimationFrame(animationFrameId);
      if (timerStage2) clearTimeout(timerStage2);
      if (timerZoom) clearTimeout(timerZoom);
      if (timerComplete) clearTimeout(timerComplete);
      window.removeEventListener('resize', handleResize);

      earthGeometry.dispose();
      earthMaterial.dispose();
      cloudsGeometry.dispose();
      cloudsMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      dotGeo.dispose();
      dotMat.dispose();
      dayTexture.dispose();
      specTexture.dispose();
      cloudsTexture.dispose();
      renderer.dispose();
    };
  }, [active, onEnterDestinations, isReturnVisit]);

  // Pointer drag to orbit the 3D globe interactively
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
    sceneStateRef.current.targetLookAtLatLon = false;
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !sceneStateRef.current.earthGroup) return;
    const deltaX = e.clientX - previousPointerPosRef.current.x;
    const deltaY = e.clientY - previousPointerPosRef.current.y;
    sceneStateRef.current.earthGroup.rotation.y += deltaX * 0.005;
    sceneStateRef.current.earthGroup.rotation.x = Math.max(
      -0.6,
      Math.min(0.6, sceneStateRef.current.earthGroup.rotation.x + deltaY * 0.004)
    );
    previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleSkipIntro = () => {
    setIsCloudCoverActive(true);
    setTimeout(() => {
      onEnterDestinations();
    }, 300);
  };

  const handleDiscoverSriLankaNow = () => {
    setStage(2);
    sceneStateRef.current.targetLookAtLatLon = true;
    setTimeout(() => {
      setStage(3);
      sceneStateRef.current.isZooming = true;
      sceneStateRef.current.targetCameraDistance = 2.6;
      setIsCloudCoverActive(true);
    }, 900);
    setTimeout(() => {
      onEnterDestinations();
    }, 2400);
  };

  if (!webGlSupported) {
    return (
      <div className="globe-fallback-view">
        <div className="globe-fallback-content">
          <span className="hero-eyebrow">A SMALL ISLAND. AN EXTRAORDINARY WORLD.</span>
          <h1 className="hero-title">Some journeys change your world.</h1>
          <p className="hero-lead">Yours begins in Sri Lanka.</p>
          <button onClick={onEnterDestinations} className="btn-primary" autoFocus>
            Enter Experience
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="globe-intro-container" 
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
    >
      <canvas ref={canvasRef} className="globe-canvas" />

      <div className="globe-stars-ambient" />

      {/* Stage 1 & 2 Text Overlays */}
      <div className={`globe-overlay ${stage === 3 ? 'globe-overlay-fade-out' : ''}`}>
        <div className="globe-editorial-copy">
          <div className="globe-eyebrow-badge">
            <Compass size={14} className="badge-icon-spin" />
            <span>A SMALL ISLAND. AN EXTRAORDINARY WORLD.</span>
          </div>

          <h1 className="globe-title">
            Some journeys change <br />
            <em>your world.</em>
          </h1>

          <p className="globe-lead">
            Yours begins in Sri Lanka.
          </p>

          <div className="globe-actions">
            <button
              onClick={handleDiscoverSriLankaNow}
              className="btn-champagne-pill"
              aria-label="Discover Sri Lanka"
            >
              <span>{isReturnVisit ? 'Explore the Island' : 'Discover Sri Lanka'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Discreet immediately usable "Skip intro" control */}
        <button
          onClick={handleSkipIntro}
          className="globe-skip-button"
          aria-label="Skip introductory globe animation"
        >
          <span>{isReturnVisit ? 'Return to Scenes' : 'Skip intro'}</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Dynamic Projected Sri Lanka 3D Beacon Label */}
      {sriLankaScreenPos.visible && stage >= 2 && (
        <div
          className="sri-lanka-3d-beacon"
          style={{
            transform: `translate3d(${sriLankaScreenPos.x}px, ${sriLankaScreenPos.y}px, 0)`
          }}
        >
          <div className="beacon-pulse-ring" />
          <div className="beacon-core-dot" />
          <div className="beacon-callout-card">
            <span className="beacon-sub">INDIAN OCEAN</span>
            <strong className="beacon-name">SRI LANKA</strong>
            <p className="beacon-tag">Your next extraordinary journey</p>
          </div>
        </div>
      )}

      {/* Soft Cloud Layer Veil for Seamless Transition */}
      <div className={`cloud-transition-veil ${isCloudCoverActive ? 'cloud-veil-active' : ''}`}>
        <div className="cloud-particle-fog cloud-fog-1" />
        <div className="cloud-particle-fog cloud-fog-2" />
      </div>
    </div>
  );
}
