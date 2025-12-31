import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import '@google/model-viewer';
import QRCode from 'react-qr-code';
import ProductGrid from './components/ProductGrid';
import ProductDetail from './components/ProductDetail';

// --- MAIN 360 & WEBSITE COMPONENT ---
const Home = () => {
  const [showQR, setShowQR] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Basic device detection
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    const mobileRegex = /Mobi|Android|iPhone|iPad|iPod|Tablet/i;
    const touch = typeof navigator !== 'undefined' && navigator.maxTouchPoints && navigator.maxTouchPoints > 1;
    setIsMobile(mobileRegex.test(ua) || touch || (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer:coarse)').matches));
  }, []);

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
            {/* On mobile home, button leads to the auto-trigger AR page */}
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

// --- AR AUTO-TRIGGER PAGE (Used by QR code and mobile button) ---
const ArView = () => {
  const [diagLines, setDiagLines] = useState([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const pushDiag = (msg) => setDiagLines(d => [...d, `${new Date().toISOString()} - ${msg}`]);

  useEffect(() => {
    const mv = document.querySelector('#ar-model');
    
    // logic to automatically click the AR button when the model is ready
    const handleAutoTrigger = () => {
      setIsLoading(false);
      setLoadProgress(100);
      pushDiag('Model loaded - triggering AR');
      
      setTimeout(() => {
        let arBtn = mv.querySelector('button[slot="ar-button"]') || 
                   (mv.shadowRoot && mv.shadowRoot.querySelector('button[slot="ar-button"]'));
        if (arBtn) {
          arBtn.click();
        }
      }, 800); // 800ms delay to ensure device is ready for intent
    };

    if (mv) {
      mv.addEventListener('load', handleAutoTrigger);
      mv.addEventListener('progress', (p) => {
        const progress = p?.detail?.totalProgress || 0;
        setLoadProgress(Math.round(progress * 100));
      });
      return () => mv.removeEventListener('load', handleAutoTrigger);
    }
  }, []);

  const openAR = () => {
    const mv = document.querySelector('#ar-model');
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
        <button slot="ar-button" style={{ display: 'none' }} aria-hidden="true"></button>
      </model-viewer>

      <div className="ar-launch-overlay" style={{ position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', color: 'white' }}>
        {isLoading ? (
          <div>
            <p>Downloading 3D Model: {loadProgress}%</p>
            <div style={{ width: '200px', height: '5px', background: '#333', margin: '10px auto' }}>
              <div style={{ width: `${loadProgress}%`, height: '100%', background: '#007bff' }} />
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ marginBottom: '10px' }}>Opening AR Camera...</h2>
            <button className="btn btn-primary" onClick={openAR}>
              Place in room (AR)
            </button>
          </div>
        )}
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
    <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>
      <h2>Loading VR Showroom...</h2>
      <Link to="/"><button className="btn btn-outline" style={{ marginTop: '20px' }}>Back Home</button></Link>
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