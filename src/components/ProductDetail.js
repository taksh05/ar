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
        // fallback
        const ua = navigator.userAgent || '';
        const origin = window.location.origin;
        if (/iPhone|iPad|iPod/i.test(ua)) window.location.href = `${origin}${product.usdz}`;
        else window.location.href = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(origin + product.glb)}&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;end`;
      }
    }
  };

  return (
    <div style={{ padding: 24, color: '#fff' }}>
      <Link to="#/" className="btn btn-outline">Back</Link>
      <h2 style={{ marginTop: 12 }}>{product.title}</h2>
      <div style={{ display: 'flex', gap: 24, marginTop: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 480px', minWidth: 320 }}>
          <model-viewer
            src={product.glb}
            ios-src={product.usdz}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            style={{ width: '100%', height: 420, background: '#000' }}
          >
            <button slot="ar-button" style={{ display: 'none' }} aria-hidden="true"></button>
          </model-viewer>

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="btn btn-primary" onClick={openARFromPage}>Place in room (AR)</button>
            <Link to="#/vr"><button className="btn btn-outline">Enter VR</button></Link>
            <button className="btn btn-secondary" onClick={() => setShow360(s => !s)}>{show360 ? 'Hide 360' : '360 View'}</button>
          </div>
        </div>

        <div style={{ flex: '1 1 320px', minWidth: 260 }}>
          <div style={{ background: '#0b0b0b', padding: 12, borderRadius: 8 }}>
            <h3 style={{ marginTop: 0 }}>{product.price}</h3>
            <p>{product.description}</p>
          </div>

          {show360 && (
            <div style={{ marginTop: 12 }}>
              <img src={product.image} alt={`${product.title} 360`} style={{ width: '100%', borderRadius: 8 }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
