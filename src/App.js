import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import '@google/model-viewer';
import QRCode from 'react-qr-code';

// --- MAIN 360 & AR COMPONENT ---
const Home = () => {
  const [showQR, setShowQR] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // basic device detection: mobile or tablet
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    const mobileRegex = /Mobi|Android|iPhone|iPad|iPod|Tablet/i;
    const touch = typeof navigator !== 'undefined' && navigator.maxTouchPoints && navigator.maxTouchPoints > 1;
    setIsMobile(mobileRegex.test(ua) || touch || (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer:coarse)').matches));
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <h1>Porsche 911 Turbo</h1>
      </header>

      <model-viewer
        src="/models/porsche.glb"
        ios-src="/models/porsche.usdz"
        alt="1975 Porsche 911"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="2"
        environment-image="neutral"
        exposure="1"
      >
        {/* If on mobile/tablet, show the built-in AR button so users can launch AR directly.
            On desktop we keep the AR button hidden and surface a QR instead. */}
        {isMobile ? (
          <button slot="ar-button" className="btn btn-primary">VIEW IN AR</button>
        ) : (
          <button slot="ar-button" style={{ display: 'none' }}></button>
        )}
      </model-viewer>

      {/* Fallback / direct AR links for single-tap testing */}
      <div style={{ marginTop: 12 }}>
        <p style={{ marginBottom: 6 }}>Quick open in AR (if tapping the AR button doesn't launch):</p>
        <div style={{ display: 'flex', gap: 8 }}>
            <a
              rel="ar noopener noreferrer"
              href={typeof window !== 'undefined' ? `${window.location.origin}/models/porsche.usdz` : '/models/porsche.usdz'}
              className="btn btn-outline"
              target="_blank"
            >
              Open in Quick Look (iOS)
            </a>

          <a
            href={typeof window !== 'undefined' ? `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(window.location.origin + '/models/porsche.glb')}&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;end` : '#'}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Scene Viewer (Android)
          </a>
        </div>
      </div>

      <div className="controls-row">
        {isMobile ? (
          // On mobile/tablet show direct AR instruction and hide QR
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ color: '#ddd' }}>Tap <strong>VIEW IN AR</strong> to open AR on your device</div>
            <Link to="/vr">
              <button className="btn btn-primary">Launch VR</button>
            </Link>
          </div>
        ) : (
          // Desktop: show QR button and VR link
          <>
            <button className="btn btn-outline" onClick={() => setShowQR(!showQR)}>
              {showQR ? "Close QR" : "Scan for AR"}
            </button>
            <Link to="/vr">
              <button className="btn btn-primary">Launch VR</button>
            </Link>
          </>
        )}
      </div>

      {!isMobile && showQR && (
        <div className="qr-container">
          <p style={{ marginBottom: '10px' }}>Scan to view in your room</p>
          <QRCode value={window.location.href} size={150} />
        </div>
      )}
    </div>
  );
};

// --- VR SHOWROOM COMPONENT ---
const VRShowroom = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://aframe.io/releases/1.4.0/aframe.min.js";
    document.body.appendChild(script);
    // add listener when A-Frame has loaded to debug model loading
    const onLoaded = () => {
      const carEl = document.querySelector('#carEntity');
      if (carEl) {
        carEl.addEventListener('model-loaded', () => {
          console.log('GLB model loaded');
          // make sure it's visible
          carEl.setAttribute('visible', 'true');
        });
      }
    };

    script.addEventListener('load', onLoaded);

    return () => {
      script.removeEventListener('load', onLoaded);
      if (script && script.parentNode) document.body.removeChild(script);
      const scene = document.querySelector('a-scene');
      if (scene) scene.remove();
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <a-scene>
        <a-assets>
          <a-asset-item id="car" src="/models/porsche.glb"></a-asset-item>
        </a-assets>
        <a-sky color="#050505"></a-sky>
        <a-plane position="0 0 0" rotation="-90 0 0" width="100" height="100" color="#111"></a-plane>
  <a-entity id="carEntity" gltf-model="#car" position="0 0 -4" scale="2 2 2" visible="false" animation="property: rotation; to: 0 360 0; loop: true; dur: 20000; easing: linear"></a-entity>
        <a-light type="ambient" intensity="0.3"></a-light>
        <a-light type="point" position="2 4 -3" intensity="1"></a-light>
        <a-camera position="0 1.6 0"></a-camera>
      </a-scene>
    </div>
  );
};

// --- ROUTING WRAPPER ---
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vr" element={<VRShowroom />} />
      </Routes>
    </Router>
  );
}

export default App;