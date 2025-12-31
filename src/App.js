import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import '@google/model-viewer';
import QRCode from 'react-qr-code';

// --- MAIN 360 & AR COMPONENT ---
const Home = () => {
  const [showQR, setShowQR] = useState(false);

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
        <button slot="ar-button" style={{display: 'none'}}></button>
      </model-viewer>

      <div className="controls-row">
        <button className="btn btn-outline" onClick={() => setShowQR(!showQR)}>
          {showQR ? "Close QR" : "Scan for AR"}
        </button>
        <Link to="/vr">
          <button className="btn btn-primary">Launch VR</button>
        </Link>
      </div>

      {showQR && (
        <div className="qr-container">
          <p style={{marginBottom: '10px'}}>Scan to view in your room</p>
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
    return () => {
      document.body.removeChild(script);
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
        <a-entity gltf-model="#car" position="0 0 -5" scale="2 2 2" animation="property: rotation; to: 0 360 0; loop: true; dur: 20000; easing: linear"></a-entity>
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