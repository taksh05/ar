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
  const [autoARTriggered, setAutoARTriggered] = useState(false);

  useEffect(() => {
    // basic device detection: mobile or tablet
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    const mobileRegex = /Mobi|Android|iPhone|iPad|iPod|Tablet/i;
    const touch = typeof navigator !== 'undefined' && navigator.maxTouchPoints && navigator.maxTouchPoints > 1;
    setIsMobile(mobileRegex.test(ua) || touch || (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer:coarse)').matches));
  }, []);

  // Auto-launch AR on mobile/tablet without asking (best-effort).
  useEffect(() => {
    if (!isMobile || autoARTriggered) return;
    // Wait a moment for model-viewer to initialize
    const t = setTimeout(() => {
      try {
        const mv = document.querySelector('model-viewer');
        // Try to trigger the built-in AR flow by clicking the AR button if present
        let arBtn = null;
        if (mv) {
          // model-viewer may render the AR button in light DOM slot or in shadow DOM
          arBtn = mv.querySelector('[slot="ar-button"]') || mv.querySelector('button[slot="ar-button"]');
          // try shadowRoot if needed
          try {
            if (!arBtn && mv.shadowRoot) {
              arBtn = mv.shadowRoot.querySelector('[slot="ar-button"]') || mv.shadowRoot.querySelector('button[slot="ar-button"]');
            }
          } catch (e) {
            // ignore shadow access errors
          }
        }

        if (arBtn) {
          arBtn.click();
          setAutoARTriggered(true);
          return;
        }

        // Fallback: open platform-specific direct link
        const ua = navigator.userAgent || '';
        const origin = window.location.origin;
        if (/iPhone|iPad|iPod/i.test(ua)) {
          // open USDZ in same tab to trigger Quick Look
          window.location.href = `${origin}/models/porsche.usdz`;
          setAutoARTriggered(true);
          return;
        }

        // Android: try Scene Viewer intent
        const sceneIntent = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(origin + '/models/porsche.glb')}&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;end`;
        window.location.href = sceneIntent;
        setAutoARTriggered(true);
      } catch (err) {
        console.warn('Auto AR trigger failed', err);
      }
    }, 1200);

    return () => clearTimeout(t);
  }, [isMobile, autoARTriggered]);

  return (
    <div className="app-container">
      <header className="header">
        <h1>Porsche 911 Turbo</h1>
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
            {/* If on mobile/tablet, show the built-in AR button so users can launch AR directly.
                On desktop we keep the AR button hidden and surface a QR instead. */}
            {isMobile ? (
              <button slot="ar-button" className="btn btn-primary">VIEW IN AR</button>
            ) : (
              <button slot="ar-button" style={{ display: 'none' }}></button>
            )}
          </model-viewer>
        </div>

        <div className="controls-section">
          <div className="controls-row">
            {isMobile ? (
              // On mobile/tablet show direct AR instruction
              <>
                <div style={{ color: '#ddd', marginBottom: '15px', textAlign: 'center' }}>Tap <strong>VIEW IN AR</strong> to open AR on your device</div>
                <Link to="/vr" style={{ width: '100%' }}>
                  <button className="btn btn-primary" style={{ width: '100%' }}>Launch VR</button>
                </Link>
                <Link to="/products" style={{ width: '100%' }}>
                  <button className="btn btn-outline" style={{ width: '100%' }}>View Products</button>
                </Link>
              </>
            ) : (
              // Desktop: show buttons vertically
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
              {/* Use a hash route so direct navigation from a QR works on static hosts without server-side rewrites */}
              <QRCode value={(typeof window !== 'undefined' ? window.location.origin : '') + '/#/ar'} size={150} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- AR shortcut page (direct entry for mobiles via QR)
const ArView = () => {
  // Debug overlay state and helpers
  const [diagLines, setDiagLines] = React.useState([]);
  const pushDiag = (msg) => setDiagLines(d => [...d, `${new Date().toISOString()} - ${msg}`]);
  const [loadProgress, setLoadProgress] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // global error capture
    const onError = (event) => {
      pushDiag(`window.onerror: ${event.message || event}`);
    };
    const onRejection = (ev) => {
      pushDiag(`unhandledrejection: ${ev.reason && ev.reason.message ? ev.reason.message : String(ev.reason)}`);
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    // basic runtime checks
    pushDiag(`userAgent: ${navigator.userAgent}`);
    const mv = document.querySelector('#ar-model');
    pushDiag(`model-viewer element present: ${!!mv}`);

    // Check for model-viewer custom element
    try {
      const hasCustom = !!window.customElements && !!window.customElements.get && !!window.customElements.get('model-viewer');
      pushDiag(`model-viewer custom element registered: ${hasCustom}`);
    } catch (e) {
      pushDiag(`customElements check failed: ${e && e.message ? e.message : e}`);
    }

    // WebXR support check (best-effort)
    if (navigator.xr && navigator.xr.isSessionSupported) {
      navigator.xr.isSessionSupported('immersive-ar').then(supported => {
        pushDiag(`WebXR immersive-ar supported: ${supported}`);
      }).catch(err => pushDiag(`WebXR check error: ${err && err.message ? err.message : err}`));
    } else {
      pushDiag('WebXR not available on this browser');
    }

    // HEAD check for assets (some older browsers/tunnels might block HEAD; we try and fallback)
    const origin = window.location.origin;
    const urls = [`${origin}/models/porsche.glb`, `${origin}/models/porsche.usdz`];
    urls.forEach(async (u) => {
      try {
        const res = await fetch(u, { method: 'HEAD' });
        pushDiag(`${u} -> ${res.status} ${res.statusText}; content-type=${res.headers.get('content-type')}`);
      } catch (err) {
        // fallback try GET but don't download body fully; just attempt and abort quickly
        try {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), 1500);
          const res2 = await fetch(u, { method: 'GET', signal: controller.signal });
          clearTimeout(id);
          pushDiag(`${u} -> ${res2.status} ${res2.statusText}; content-type=${res2.headers.get('content-type')}`);
        } catch (err2) {
          pushDiag(`${u} -> fetch error: ${err2 && err2.message ? err2.message : err2}`);
        }
      }
    });

    // attach events to model-viewer if present
    if (mv) {
      const onLoad = () => {
        pushDiag('model-viewer: load event fired');
        setIsLoading(false);
        setLoadProgress(100);
      };
      const onErrorEvent = (e) => pushDiag(`model-viewer error event: ${e && e.detail ? JSON.stringify(e.detail) : String(e)}`);
      mv.addEventListener('load', onLoad);
      mv.addEventListener('error', onErrorEvent);
      // progress may help on slow devices
      mv.addEventListener('progress', (p) => {
        const progress = p && p.detail && p.detail.totalProgress !== undefined ? p.detail.totalProgress : 0;
        setLoadProgress(Math.round(progress * 100));
        pushDiag(`model-viewer progress: ${p && p.detail ? JSON.stringify(p.detail) : String(p)}`);
      });

      return () => {
        window.removeEventListener('error', onError);
        window.removeEventListener('unhandledrejection', onRejection);
        mv.removeEventListener('load', onLoad);
        mv.removeEventListener('error', onErrorEvent);
      };
    }

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);
  // Do NOT auto-redirect on page load; instead present a clear tappable AR button.
  // Automatic redirects can cause the browser to show an app-open prompt unexpectedly.

  const openAR = () => {
    try {
      const mv = document.querySelector('model-viewer');
      if (mv) {
        // Find slotted ar-button or a button in shadowRoot and click it (user-initiated)
        let arBtn = mv.querySelector('[slot="ar-button"]') || mv.querySelector('button[slot="ar-button"]');
        try {
          if (!arBtn && mv.shadowRoot) {
            arBtn = mv.shadowRoot.querySelector('button[slot="ar-button"]');
          }
        } catch (e) {
          // ignore shadow access errors
        }
        if (arBtn) {
          arBtn.click();
          return;
        }
        // As a last resort, use a rel="ar" anchor for iOS Quick Look, or intent on Android
        const ua = navigator.userAgent || '';
        const origin = window.location.origin;
        if (/iPhone|iPad|iPod/i.test(ua)) {
          // try clicking a rel="ar" link if present (preferred for Quick Look)
          const arLink = document.getElementById('ar-link');
          if (arLink) {
            arLink.click();
            return;
          }
          window.location.href = `${origin}/models/porsche.usdz`;
          return;
        }
        const sceneIntent = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(origin + '/models/porsche.glb')}&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;end`;
        window.location.href = sceneIntent;
      }
    } catch (err) {
      console.warn('Open AR failed', err);
    }
  };

  return (
    <div className="ar-viewer-container">
      {/* Hidden rel=ar anchor for iOS Quick Look fallback */}
      <a id="ar-link" rel="ar" href="/models/porsche.usdz" style={{ display: 'none' }}>Open in AR</a>
      <model-viewer
        id="ar-model"
        src="/models/porsche.glb"
        ios-src="/models/porsche.usdz"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        style={{ width: '100%', height: '100vh' }}
      >
        <button slot="ar-button" style={{ display: 'none' }} aria-hidden="true"></button>
      </model-viewer>

      <div className="ar-launch-overlay">
        {isLoading && (
          <div className="loading-indicator">
            <div className="loading-bar-container">
              <div className="loading-bar" style={{ width: `${loadProgress}%` }}></div>
            </div>
            <div className="loading-text">Downloading 3D model... {loadProgress}%</div>
            <div className="loading-hint">Large file (74 MB) — may take 30-60s on mobile data</div>
          </div>
        )}
        
        <div className="ar-instructions">
          <div className="ar-title">Place the car in your room</div>
          <div className="ar-copy">Point your camera at a flat surface and tap "Place in room". Move slowly to help the device detect the floor.</div>
        </div>

        <div className="ar-buttons">
          <button className="ar-launch-button" onClick={openAR} disabled={isLoading}>
            {isLoading ? 'Loading model...' : 'Place in room (AR)'}
          </button>
          <button className="btn btn-outline" onClick={() => window.location.href = '#/vr'}>Enter VR</button>
          <button className="btn btn-secondary" onClick={() => window.location.href = '#/'}>360 View</button>
        </div>

        <div className="ar-hint">If AR doesn't open, try Safari (iOS) or Chrome (Android). Make sure the page URL is the one you scanned (contains <code>#/ar</code>).</div>
      </div>
      {/* Debug panel for older devices: visible on-screen to capture errors and network checks */}
      <div className="debug-panel" aria-live="polite">
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Diagnostics</div>
        <div className="debug-rows">
          {diagLines.length === 0 ? <div className="debug-row">No diagnostics yet</div> : diagLines.slice().reverse().map((l, i) => (
            <div key={i} className="debug-row">{l}</div>
          ))}
        </div>
        <div style={{ marginTop: 8 }}>
          <button className="btn btn-outline" onClick={() => { navigator.clipboard && navigator.clipboard.writeText(diagLines.join('\n')); }}>Copy diagnostics</button>
        </div>
      </div>
    </div>
  );
};

// --- VR SHOWROOM COMPONENT ---
const VRShowroom = () => {
  useEffect(() => {
    // Create A-Frame script and build the scene only after it loads to avoid timing issues
    if (document.querySelector('script[data-aframe-custom]')) return; // avoid double-loading
    const script = document.createElement('script');
    script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
    script.setAttribute('data-aframe-custom', 'true');
    document.body.appendChild(script);

    const container = document.createElement('div');
    container.id = 'aframe-container';
    container.style.width = '100vw';
    container.style.height = '100vh';
    document.body.appendChild(container);

    const buildScene = () => {
      // Populate container with scene markup
      container.innerHTML = `
        <a-scene>
          <a-sky color="#050505"></a-sky>
          <a-plane position="0 0 0" rotation="-90 0 0" width="100" height="100" color="#111"></a-plane>
          <a-entity id="carEntity" gltf-model="/models/porsche.glb" position="0 0 -3" scale="1.6 1.6 1.6" visible="false" animation="property: rotation; to: 0 360 0; loop: true; dur: 20000; easing: linear"></a-entity>
          <a-light type="ambient" intensity="0.3"></a-light>
          <a-light type="point" position="2 4 -3" intensity="1"></a-light>
          <a-camera position="0 1.6 0"></a-camera>
        </a-scene>
      `;

      // Attach model-loaded listener
      const carEl = container.querySelector('#carEntity');
      if (carEl) {
        carEl.addEventListener('model-loaded', () => {
          carEl.setAttribute('visible', 'true');
        });
        // in case already resolved, set visible
        setTimeout(() => carEl.setAttribute('visible', 'true'), 600);
      }
    };

    const onScriptLoad = () => {
      // small delay to allow A-Frame to initialize
      setTimeout(buildScene, 120);
    };

    script.addEventListener('load', onScriptLoad);

    return () => {
      script.removeEventListener('load', onScriptLoad);
      if (script && script.parentNode) document.body.removeChild(script);
      const cont = document.getElementById('aframe-container');
      if (cont && cont.parentNode) cont.parentNode.removeChild(cont);
    };
  }, []);

  return <div />;
};

// --- ROUTING WRAPPER ---
function App() {
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

export default App;