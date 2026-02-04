import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import products from '../data/products.json';
import '@google/model-viewer';

const ProductDetail = () => {
  const { slug } = useParams();
  const product = products.find(p => p.slug === slug) || products[0];
  const [show360, setShow360] = useState(false);

  const openARFromPage = () => {
    const mv = document.querySelector('model-viewer');
    if (mv) {
      try {
        let arBtn = mv.querySelector('[slot="ar-button"]') || mv.querySelector('button[slot="ar-button"]');
        if (!arBtn && mv.shadowRoot) arBtn = mv.shadowRoot.querySelector('button[slot="ar-button"]');
        if (arBtn) arBtn.click();
      } catch (e) {
        const ua = navigator.userAgent || '';
        const origin = window.location.origin;
        if (/iPhone|iPad|iPod/i.test(ua)) window.location.href = `${origin}${product.usdz}`;
        else window.location.href = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(origin + product.glb)}&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;end`;
      }
    }
  };

  return (
    <div className="app-container" style={{ padding: '20px' }}>
      {/* Back Button with Icon style */}
      <Link to="/" className="btn btn-outline" style={{ alignSelf: 'flex-start', marginBottom: '20px', padding: '10px 20px' }}>
        ← BACK TO FLEET
      </Link>

      <div className="content-wrapper detail-layout">
        {/* Left: 3D Model Viewer */}
        <div className="model-section detail-model">
          <div className="status-badge">SYSTEM ACTIVE</div>
          <model-viewer
            src={product.glb}
            ios-src={product.usdz}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            shadow-intensity="2"
            exposure="1.2"
            environment-image="neutral"
            style={{ width: '100%', height: '500px' }}
          >
            <button slot="ar-button" style={{ display: 'none' }} aria-hidden="true"></button>
          </model-viewer>

          <div className="action-bar">
            <button className="btn btn-primary" onClick={openARFromPage}>PLACE IN SPACE (AR)</button>
            <Link to="/vr"><button className="btn btn-outline">VIRTUAL COCKPIT</button></Link>
            <button className="btn btn-secondary" onClick={() => setShow360(s => !s)}>
              {show360 ? 'CLOSE VIEW' : '360° SENSOR'}
            </button>
          </div>
        </div>

        {/* Right: Technical Specs Box */}
        <div className="info-section">
          <div className="glass-panel info-card">
            <h2 className="detail-title">{product.title}</h2>
            <div className="detail-price">{product.price}</div>
            
            <div className="divider"></div>
            
            <p className="detail-desc">{product.description}</p>
            
            <div className="tech-specs-list">
              <div className="tech-row"><span>MODEL:</span> <span>CD-X7</span></div>
              <div className="tech-row"><span>OS:</span> <span>DRONE-OS v4.2</span></div>
              <div className="tech-row"><span>CONNECTIVITY:</span> <span>SAT-LINK</span></div>
            </div>

            {show360 && (
              <div className="sensor-view-container fade-in">
                <img src={product.image} alt="360 sensor view" className="sensor-img" />
                <div className="scanline"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;