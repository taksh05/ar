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

// --- AR AUTO-TRIGGER PAGE (Matches Phone Viewer Exactly) ---
const ArView = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const mv = document.querySelector('#ar-model');
    
    const handleAutoTrigger = () => {
      setIsLoading(false);
      
      // Automatic trigger for the AR camera
      setTimeout(() => {
        let arBtn = mv.querySelector('button[slot="ar-button"]') || 
                   (mv.shadowRoot && mv.shadowRoot.querySelector('button[slot="ar-button"]'));
        if (arBtn) {
          arBtn.click();
        }
      }, 500); 
    };

    if (mv) {
      mv.addEventListener('load', handleAutoTrigger);
      return () => mv.removeEventListener('load', handleAutoTrigger);
    }
  }, []);

  return (
    <div className="app-container" style={{ height: '100vh', background: '#000' }}>
      <div className="model-section" style={{ height: '100vh', width: '100vw' }}>
        <model-viewer
          id="ar-model"
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
          {/* Using the exact same button style from the Home phone view */}
          <button slot="ar-button" className="btn btn-primary" style={{ display: isLoading ? 'none' : 'block' }}>
            VIEW IN AR
          </button>
        </model-viewer>
      </div>

      {isLoading && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', textAlign: 'center' }}>
          <h2>Loading Experience...</h2>
        </div>
      )}
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
        <p style={{color: 'white', padding: '20px'}}>VR Library Loading...</p>
        <Link to="/"><button className="btn btn-outline">Back Home</button></Link>
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