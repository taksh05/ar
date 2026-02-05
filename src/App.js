import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import '@google/model-viewer';
import QRCode from 'react-qr-code';
import ProductGrid from './components/ProductGrid';
import ProductDetail from './components/ProductDetail';

/* ---------------- COMMON MODEL PATH ---------------- */

const modelSrc = process.env.PUBLIC_URL + '/models/drone_final_v1.glb';
const iosSrc   = process.env.PUBLIC_URL + '/models/drone_final_v1.usdz';

/* ---------------- HOME ---------------- */

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
        <h1>VIRTUAL DRONE SHOWROOM </h1>
      </header>

      <div className="content-wrapper">
        <div className="model-section">
          <model-viewer
            src={modelSrc}
            ios-src={iosSrc}
            alt="drone model"
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-placement="floor"
            ar-scale="auto"
            camera-controls
            auto-rotate
            style={{ width: '100%', height: '500px' }}
          >
            {isMobile && (
              <Link to="/ar" slot="ar-button" className="btn btn-primary">
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
                <div style={{ marginTop: 20, textAlign: 'center' }}>
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

/* ---------------- AR VIEW ---------------- */

const ArView = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <model-viewer
        src={modelSrc}
        ios-src={iosSrc}
        alt="drone model"
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-placement="floor"
        ar-scale="auto"
        camera-controls
        style={{ width: '100%', height: '100%' }}
      >
        <button slot="ar-button" className="btn btn-primary">
          VIEW IN AR
        </button>
      </model-viewer>
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
      </Routes>
    </Router>
  );
}
