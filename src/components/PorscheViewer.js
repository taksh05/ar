import React, { useState, useRef, useEffect } from 'react';
import '@google/model-viewer';
import QRCode from 'react-qr-code';
import { Link } from 'react-router-dom';

const CargoDroneViewer = () => {
  const [showQR, setShowQR] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const modelRef = useRef(null);
  
  // Drone Paths from your App.js
  const modelSrc = process.env.PUBLIC_URL + '/models/drone_final_v1.glb';
  const iosSrc   = process.env.PUBLIC_URL + '/models/drone_final_v1.usdz';
  const arUrl    = typeof window !== 'undefined' ? window.location.origin + '/#/ar' : '/#/ar';

  useEffect(() => {
    const ua = navigator.userAgent || '';
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(ua));
  }, []);

  // Loading Logic
  useEffect(() => {
    const modelViewer = modelRef.current;
    if (!modelViewer) return;
    const handleProgress = (e) => setLoadingProgress(Math.round(e.detail.totalProgress * 100));
    const handleLoad = () => setIsLoaded(true);

    modelViewer.addEventListener('progress', handleProgress);
    modelViewer.addEventListener('load', handleLoad);
    return () => {
      modelViewer.removeEventListener('progress', handleProgress);
      modelViewer.removeEventListener('load', handleLoad);
    };
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <h1> VIRTUAL DRONE SHOWROOM  <span style={{fontSize: '0.5rem', verticalAlign: 'middle', opacity: 0.6}}>V1.0</span></h1>
      </header>

      <div className="content-wrapper">
        {/* 3D Model Section */}
        <div className="model-section">
          {!isLoaded && (
            <div className="loading-indicator">
              <div className="loading-text">INITIALIZING SYSTEMS...</div>
              <div className="loading-bar-container">
                <div className="loading-bar" style={{ width: `${loadingProgress}%` }}></div>
              </div>
              <div className="loading-hint">{loadingProgress}%</div>
            </div>
          )}
          
          <model-viewer
            ref={modelRef}
            src={modelSrc}
            ios-src={iosSrc}
            alt="Cargo Drone 3D Model"
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-placement="floor"
            camera-controls
            auto-rotate
            shadow-intensity="1.5"
            environment-image="neutral"
            exposure="1"
            style={{ width: '100%', height: '100%' }}
          >
            {isMobile && (
              <button slot="ar-button" className="btn btn-primary ar-launch-button" style={{position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)'}}>
                VIEW IN YOUR SPACE
              </button>
            )}
          </model-viewer>
        </div>

        {/* Info & Controls Section */}
        <div className="controls-section">
          <div className="specs-grid">
            <div className="spec-item"><span>Payload</span><strong>15 KG</strong></div>
            <div className="spec-item"><span>Range</span><strong>40 KM</strong></div>
            <div className="spec-item"><span>Max Speed</span><strong>85 KM/H</strong></div>
            <div className="spec-item"><span>Battery</span><strong>45 MIN</strong></div>
          </div>

          <div className="controls">
            {!isMobile && (
              <button className="btn btn-outline" onClick={() => setShowQR(!showQR)}>
                {showQR ? 'HIDE AR SCANNER' : 'SCAN FOR AR'}
              </button>
            )}

            {showQR && (
              <div className="qr-container" style={{background: '#fff', padding: '15px', borderRadius: '15px', display: 'flex', justifyContent: 'center'}}>
                <QRCode value={arUrl} size={150} />
              </div>
            )}

            <Link to="/vr" className="btn btn-primary">LAUNCH VR INTERFACE</Link>
            <Link to="/products" className="btn btn-outline">TECHNICAL SPECS</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CargoDroneViewer;