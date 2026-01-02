import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import '@google/model-viewer';
import QRCode from 'react-qr-code';
import ProductGrid from './components/ProductGrid';
import ProductDetail from './components/ProductDetail';

/* ---------------- HOME (360 + QR + PHONE AR BUTTON) ---------------- */

const Home = () => {
  const [showQR, setShowQR] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(ua));
  }, []);

  const arUrl =
    typeof window !== 'undefined'
      ? window.location.origin + '/#/ar'
      : '/#/ar';

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
            alt="droen model"
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-placement="floor"
            ar-scale="auto"
            camera-controls
            auto-rotate
            shadow-intensity="2"
            environment-image="neutral"
            exposure="1"
            style={{ width: '100%', height: '500px' }}
          >
            {isMobile && (
              <Link
                to="/ar"
                slot="ar-button"
                className="btn btn-primary"
                style={{ textDecoration: 'none' }}
              >
                VIEW IN AR
              </Link>
            )}
          </model-viewer>
        </div>

        <div className="controls-section">
          {!isMobile && (
            <>
              <button
                className="btn btn-outline"
                onClick={() => setShowQR(!showQR)}
                style={{ width: '100%' }}
              >
                {showQR ? 'Close QR' : 'Scan for AR'}
              </button>

              {showQR && (
                <div className="qr-container" style={{ marginTop: 20, textAlign: 'center' }}>
                  <p>Scan to view in your space</p>
                  <QRCode value={arUrl} size={160} />
                </div>
              )}
            </>
          )}

          <Link to="/vr" style={{ width: '100%' }}>
            <button className="btn btn-primary" style={{ width: '100%' }}>
              Launch VR
            </button>
          </Link>

          <Link to="/products" style={{ width: '100%' }}>
            <button className="btn btn-outline" style={{ width: '100%' }}>
              View Products
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ---------------- AR VIEW (SAME FOR PHONE + QR) ---------------- */

const ArView = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <model-viewer
        src="/models/porsche.glb"
        ios-src="/models/porsche.usdz"
        alt="drone model"
        ar
        ar-placement="floor"
        ar-scale="auto"
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        environment-image=""
        shadow-intensity="2"
        shadow-softness="0.5"
        exposure="1"
        style={{ width: '100%', height: '100%' }}
      >
        <button slot="ar-button" className="btn btn-primary">
          VIEW IN AR
        </button>
      </model-viewer>
    </div>
  );
};

/* ---------------- VR SHOWROOM ---------------- */

const VRShowroom = () => {
  useEffect(() => {
    if (document.querySelector('script[data-aframe]')) return;

    const script = document.createElement('script');
    script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
    script.setAttribute('data-aframe', 'true');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <p style={{ color: '#fff' }}>VR Loading...</p>
      <Link to="/">
        <button className="btn btn-outline">Back Home</button>
      </Link>
    </div>
  );
};

/* ---------------- ROUTER ---------------- */

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