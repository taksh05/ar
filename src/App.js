import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import '@google/model-viewer';
import QRCode from 'react-qr-code';
import ProductGrid from './components/ProductGrid';
import ProductDetail from './components/ProductDetail';

// --- MAIN 360 & AR COMPONENT ---
const Home = () => {
  const [showQR, setShowQR] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    const mobileRegex = /Mobi|Android|iPhone|iPad|iPod|Tablet/i;
    const touch = typeof navigator !== 'undefined' && navigator.maxTouchPoints && navigator.maxTouchPoints > 1;
    setIsMobile(mobileRegex.test(ua) || touch || (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer:coarse)').matches));
  }, []);

  // NOTE: Auto-launch logic removed to prevent bypassing the website on mobile.

  return (
    <div className="app-container">
      <header className="header">
        <h1>Cargo Drone</h1>
      </header>

      <div className="content-wrapper">
        <div className="model-section">
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
            style={{ width: '100%', height: '100%' }}
          >
            {isMobile ? (
              <Link to="/ar" slot="ar-button" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block', padding: '10px 20px' }}>
                VIEW IN AR
              </Link>
            ) : (
              <button slot="ar-button" style={{ display: 'none' }}></button>
            )}
          </model-viewer>
        </div>

        <div className="controls-section">
          <div className="controls-row">
            {isMobile ? (
              <>
                <div style={{ color: '#ddd', marginBottom: '15px', textAlign: 'center' }}>Tap <strong>VIEW IN AR</strong> to open the full experience</div>
                <Link to="/vr" style={{ width: '100%' }}>
                  <button className="btn btn-primary" style={{ width: '100%' }}>Launch VR</button>
                </Link>
                <Link to="/products" style={{ width: '100%' }}>
                  <button className="btn btn-outline" style={{ width: '100%' }}>View Products</button>
                </Link>
              </>
            ) : (
              <>
                <button className="btn btn-outline" onClick={() => setShowQR(!showQR)} style={{ width: '100%' }}>
                  {showQR ? "Close QR" : "Scan for AR"}
                </button>
                <Link to="/vr" style={{ width: '100%' }}>
                  <button className="btn btn-primary" style={{ width: '100%' }}>Launch VR</button>
                </Link>
                <Link to="/products" style={{ width: '100%' }}>
                  <button className="btn btn-outline" style={{ width: '100%' }}>Products</button>
                </Link>
              </>
            )}
          </div>

          {!isMobile && showQR && (
            <div className="qr-container" style={{ marginTop: '20px' }}>
              <p style={{ marginBottom: '10px', color: '#000' }}>Scan to view in your room</p>
              <QRCode value={(typeof window !== 'undefined' ? window.location.origin : '') + '/#/ar'} size={150} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- AR shortcut page (Direct entry used by QR and Mobile Button) ---
const ArView = () => {
  const [diagLines, setDiagLines] = useState([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const pushDiag = (msg) => setDiagLines(d => [...d, `${new Date().toISOString()} - ${msg}`]);

  useEffect(() => {
    const mv = document.querySelector('#ar-model');
    if (mv) {
      const onLoad = () => {
        setIsLoading(false);
        setLoadProgress(100);
      };
      mv.addEventListener('load', onLoad);
      return () => mv.removeEventListener('load', onLoad);
    }
  }, []);

  const openAR = () => {
    const mv = document.querySelector('model-viewer');
    if (mv) {
      let arBtn = mv.querySelector('button[slot="ar-button"]') || (mv.shadowRoot && mv.shadowRoot.querySelector('button[slot="ar-button"]'));
      if (arBtn) arBtn.click();
    }
  };

  return (
    <div className="ar-viewer-container" style={{ height: '100vh', background: '#000' }}>
      <model-viewer
        id="ar-model"
        src="/models/porsche.glb"
        ios-src="/models/porsche.usdz"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        style={{ width: '100%', height: '100%' }}
      >
        <button slot="ar-button" style={{ display: 'none' }}></button>
      </model-viewer>
      <div className="ar-launch-overlay" style={{ position: 'absolute', bottom: 20, width: '100%', textAlign: 'center' }}>
        <button className="btn btn-primary" onClick={openAR} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Place in room (AR)'}
        </button>
      </div>
    </div>
  );
};

// --- VR SHOWROOM COMPONENT ---
const VRShowroom = () => {
  useEffect(() => {
    if (document.querySelector('script[data-aframe-custom]')) return;
    const script = document.createElement('script');
    script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
    script.setAttribute('data-aframe-custom', 'true');
    document.body.appendChild(script);
    return () => {
        if (script.parentNode) document.body.removeChild(script);
    };
  }, []);

  return (
    <div id="vr-container">
        {/* Simplified VR implementation or redirect to A-Frame scene */}
        <p style={{color: 'white', padding: '20px'}}>VR Library Loading...</p>
    </div>
  );
};

// --- ROUTING WRAPPER ---
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductGrid />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/ar" element={<ArView />} />
        <Route path="/vr" element={<VRShowroom />} />
      </Routes>
    </Router>
  );
}