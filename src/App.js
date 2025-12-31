import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import '@google/model-viewer';
import QRCode from 'react-qr-code';

// --- MAIN 360 & AR COMPONENT ---
const Home = () => {
  const [showQR, setShowQR] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [autoARTriggered, setAutoARTriggered] = useState(false);

  useEffect(() => {
    // basic device detection: mobile or tablet
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    const mobileRegex = /Mobi|Android|iPhone|iPad|iPod|Tablet/i;
    const touch = typeof navigator !== 'undefined' && navigator.maxTouchPoints && navigator.maxTouchPoints > 1;
    setIsMobile(mobileRegex.test(ua) || touch || (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer:coarse)').matches));
  }, []);

  // Auto-launch AR on mobile/tablet without asking (best-effort).
  useEffect(() => {
    if (!isMobile || autoARTriggered) return;
    // Wait a moment for model-viewer to initialize
    const t = setTimeout(() => {
      try {
        const mv = document.querySelector('model-viewer');
        // Try to trigger the built-in AR flow by clicking the AR button if present
        let arBtn = null;
        if (mv) {
          // model-viewer may render the AR button in light DOM slot or in shadow DOM
          arBtn = mv.querySelector('[slot="ar-button"]') || mv.querySelector('button[slot="ar-button"]');
          // try shadowRoot if needed
          try {
            if (!arBtn && mv.shadowRoot) {
              arBtn = mv.shadowRoot.querySelector('[slot="ar-button"]') || mv.shadowRoot.querySelector('button[slot="ar-button"]');
            }
          } catch (e) {
            // ignore shadow access errors
          }
        }

        if (arBtn) {
          arBtn.click();
          setAutoARTriggered(true);
          return;
        }

        // Fallback: open platform-specific direct link
        const ua = navigator.userAgent || '';
        const origin = window.location.origin;
        if (/iPhone|iPad|iPod/i.test(ua)) {
          // open USDZ in same tab to trigger Quick Look
          window.location.href = `${origin}/models/porsche.usdz`;
          setAutoARTriggered(true);
          return;
        }

        // Android: try Scene Viewer intent
        const sceneIntent = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(origin + '/models/porsche.glb')}&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;end`;
        window.location.href = sceneIntent;
        setAutoARTriggered(true);
      } catch (err) {
        console.warn('Auto AR trigger failed', err);
      }
    }, 1200);

    return () => clearTimeout(t);
  }, [isMobile, autoARTriggered]);

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

      {/* Fallback buttons removed: mobile/tablet will auto-launch AR; desktop uses QR */}

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