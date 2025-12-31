import React, { useState, useRef, useEffect } from 'react';
import '@google/model-viewer';
import QRCode from 'react-qr-code';

const PorscheViewer = () => {
  const [showQR, setShowQR] = useState(false);
  // Default QR points to the hash-based AR route so scanning works on static hosts / tunnels
  const defaultArQr = (typeof window !== 'undefined' ? window.location.origin + '/#/ar' : '/#/ar');
  const [qrValue, setQrValue] = useState(defaultArQr);
  const [detectStatus, setDetectStatus] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const modelRef = useRef(null);
  const observerRef = useRef(null);

  // Prefetch models on page load (downloads in background)
  useEffect(() => {
    // Start downloading models immediately in background
    const prefetchModel = (url) => {
      fetch(url, { mode: 'no-cors' }).catch(() => {});
    };
    
    // Prefetch after a short delay to not block initial render
    const timer = setTimeout(() => {
      prefetchModel('/models/porsche.glb');
      prefetchModel('/models/porsche.usdz');
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Lazy loading: only show model when it comes into viewport
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observerRef.current?.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (modelRef.current) {
      observerRef.current.observe(modelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, []);

  // Track loading progress
  useEffect(() => {
    const modelViewer = modelRef.current;
    if (!modelViewer) return;

    const handleProgress = (event) => {
      const progress = event.detail.totalProgress * 100;
      setLoadingProgress(Math.round(progress));
    };

    const handleLoad = () => {
      setIsLoaded(true);
      setLoadingProgress(100);
    };

    modelViewer.addEventListener('progress', handleProgress);
    modelViewer.addEventListener('load', handleLoad);

    return () => {
      modelViewer.removeEventListener('progress', handleProgress);
      modelViewer.removeEventListener('load', handleLoad);
    };
  }, [isVisible]);

  return (
    <div className="main-container">
      <nav className="navbar">911 TURBO EXPERIENCE</nav>
      
      <div className="content-wrapper">
        <div ref={modelRef} className="model-section">
          {!isLoaded && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#fff',
              zIndex: 10
            }}>
              <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading Model...</div>
              <div style={{ width: '200px', height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${loadingProgress}%`, height: '100%', background: '#0af', transition: 'width 0.3s' }}></div>
              </div>
              <div style={{ fontSize: '14px', marginTop: '5px' }}>{loadingProgress}%</div>
            </div>
          )}
          <model-viewer
            src={isVisible ? "/models/porsche.glb" : undefined}
            ios-src={isVisible ? "/models/porsche.usdz" : undefined}
            poster="https://via.placeholder.com/800x600/000000/FFFFFF/?text=Porsche+911"
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            auto-rotate-delay="1000"
            rotation-per-second="30deg"
            shadow-intensity="1"
            environment-image="neutral"
            exposure="1"
            loading="eager"
            reveal="auto"
            interaction-prompt="none"
            style={{ width: '100%', height: '100%', background: '#000' }}
          >
            <button slot="ar-button" className="ar-button">VIEW IN AR</button>
          </model-viewer>
        </div>

        <div className="controls-section">
          <div className="controls">
            <button onClick={() => setShowQR(!showQR)} className="btn-secondary">
              {showQR ? "Hide QR" : "Scan for AR"}
            </button>
            <button onClick={() => window.location.href='/vr'} className="btn-primary">
              Enter VR Showroom
            </button>
          </div>
        </div>
      </div>

      {showQR && (
        <div className="qr-modal">
          <p>Scan with your phone camera</p>
          <div style={{ marginBottom: 8 }}>
            <label htmlFor="qr-input" style={{ display: 'block', marginBottom: 6 }}>QR target URL</label>
            <input
              id="qr-input"
              type="text"
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
              style={{ width: 300, padding: 6 }}
            />
            <div style={{ marginTop: 6 }}>
              <button onClick={() => setQrValue(defaultArQr)} className="btn-secondary" style={{ marginRight: 8 }}>Use AR page</button>
              <button onClick={() => { navigator.clipboard && navigator.clipboard.writeText(qrValue); }} className="btn-primary" style={{ marginRight: 8 }}>Copy URL</button>
              <button onClick={async () => {
                setDetectStatus('Detecting tunnel...');
                // 1) If current URL already looks like a tunnel, use it
                try {
                  const href = window.location.href || '';
                  if (/ngrok\.io|loca\.lt|trycloudflare|localtunnel\.me/i.test(href)) {
                    setQrValue(href);
                    setDetectStatus('Using current URL (appears to be a tunnel)');
                    return;
                  }

                  // 2) Try ngrok local API (http://127.0.0.1:4040/api/tunnels)
                  try {
                    const controller = new AbortController();
                    const id = setTimeout(() => controller.abort(), 1500);
                    const res = await fetch('http://127.0.0.1:4040/api/tunnels', { signal: controller.signal });
                    clearTimeout(id);
                    if (res.ok) {
                      const data = await res.json();
                      if (data && data.tunnels && data.tunnels.length) {
                        const httpsTunnel = data.tunnels.find(t => t.public_url && t.public_url.startsWith('https')) || data.tunnels[0];
                        if (httpsTunnel && httpsTunnel.public_url) {
                          setQrValue(httpsTunnel.public_url);
                          setDetectStatus('Found ngrok tunnel');
                          return;
                        }
                      }
                    }
                  } catch (err) {
                    // ignore, fall through to not-found
                  }

                  setDetectStatus('No tunnel detected (open ngrok or use localtunnel and paste URL)');
                } catch (err) {
                  setDetectStatus('Detection failed: ' + (err && err.message ? err.message : String(err)));
                }
              }} className="btn-tertiary">Detect tunnel</button>
            </div>
          </div>

          {qrValue.includes('localhost') && (
            <div style={{ color: '#ffcc00', marginBottom: 8 }}>
              Note: QR points to a localhost address which phones cannot reach. Run the app via a tunnel (ngrok/localtunnel) or use your PC's LAN IP and paste that URL here.
            </div>
          )}
          {detectStatus && (
            <div style={{ color: '#9bd', marginBottom: 8 }}>{detectStatus}</div>
          )}

          <div className="qr-box">
             <QRCode value={qrValue} size={150} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PorscheViewer;