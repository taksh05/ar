import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import '@google/model-viewer';
import QRCode from 'react-qr-code';

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
    <div className="app-container" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header className="header" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1>Cargo Drone / Porsche View</h1>
      </header>

      <div className="content-wrapper">
        <div className="model-section">
          <model-viewer
            src="/models/porsche.glb"
            ios-src="/models/porsche.usdz"
            alt="drone model"
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-placement="floor"
            ar-scale="auto"
            camera-controls
            auto-rotate
            shadow-intensity="2"
            environment-image="neutral"
            exposure="1"
            style={{ width: '100%', height: '500px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}
          >
            {isMobile && (
              <Link
                to="/ar"
                slot="ar-button"
                className="btn btn-primary"
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                VIEW IN REAL SIZE AR
              </Link>
            )}
          </model-viewer>
        </div>

        <div className="controls-section" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {!isMobile && (
            <>
              <button
                className="btn btn-outline"
                onClick={() => setShowQR(!showQR)}
                style={{ width: '100%', padding: '10px', cursor: 'pointer' }}
              >
                {showQR ? 'Close QR' : 'Scan for AR'}
              </button>

              {showQR && (
                <div className="qr-container" style={{ marginTop: 20, textAlign: 'center', padding: '10px', border: '1px solid #ddd' }}>
                  <p>Scan with your phone to view in your space</p>
                  <QRCode value={arUrl} size={160} />
                </div>
              )}
            </>
          )}

          <Link to="/vr" style={{ width: '100%' }}>
            <button className="btn btn-primary" style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>
              Launch VR Showroom
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ---------------- AR VIEW (FULLSCREEN FOR MOBILE) ---------------- */

const ArView = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      <Link 
        to="/" 
        style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '20px', 
          zIndex: 10, 
          color: 'white', 
          textDecoration: 'none',
          background: 'rgba(0,0,0,0.5)',
          padding: '8px 15px',
          borderRadius: '20px'
        }}
      >
        ✕ Back
      </Link>
      
      <model-viewer
        src="/models/porsche.glb"
        ios-src="/models/porsche.usdz"
        alt="drone model"
        ar
        ar-placement="floor" /* Forces ground tracking */
        ar-scale="auto"      /* Starts at 1:1, but allows zoom */
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        environment-image="neutral"
        shadow-intensity="2"
        shadow-softness="0.5"
        exposure="1"
        style={{ width: '100%', height: '100%' }}
      >
        <button 
          slot="ar-button" 
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '15px 30px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          START AR EXPERIENCE
        </button>
      </model-viewer>
    </div>
  );
};

/* ---------------- VR SHOWROOM (STUB) ---------------- */

const VRShowroom = () => {
  return (
    <div style={{ padding: 40, textAlign: 'center', background: '#222', height: '100vh', color: 'white' }}>
      <h2>VR Mode</h2>
      <p>A-Frame / WebXR Content would load here.</p>
      <Link to="/">
        <button style={{ padding: '10px 20px', cursor: 'pointer' }}>Back Home</button>
      </Link>
    </div>
  );
};

/* ---------------- MAIN APP ROUTER ---------------- */

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ar" element={<ArView />} />
        <Route path="/vr" element={<VRShowroom />} />
      </Routes>
    </Router>
  );
}