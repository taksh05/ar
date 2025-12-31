import React, { useState } from 'react';
import '@google/model-viewer';
import QRCode from 'react-qr-code';

const PorscheViewer = () => {
  const [showQR, setShowQR] = useState(false);
  const [qrValue, setQrValue] = useState(typeof window !== 'undefined' ? window.location.href : '');
  const [detectStatus, setDetectStatus] = useState('');

  return (
    <div className="main-container">
      <nav className="navbar">911 TURBO EXPERIENCE</nav>
      
      <model-viewer
        src="/models/porsche.glb"
        ios-src="/models/porsche.usdz"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="2"
        environment-image="neutral"
        exposure="1.2"
        style={{ width: '100%', height: '70vh', background: '#000' }}
      >
        <button slot="ar-button" className="ar-button">VIEW IN AR</button>
      </model-viewer>

      {/* Fallback direct link for iOS Quick Look: some phones/browsers open the USDZ directly
          If you're testing from a different device, make sure the site is reachable (use ngrok/localtunnel or serve on LAN). */}
      <a id="ar-link" rel="ar" href="/models/porsche.usdz" style={{ display: 'none' }} aria-hidden="true">Open in AR</a>

      <div className="controls">
        <button onClick={() => setShowQR(!showQR)} className="btn-secondary">
          {showQR ? "Hide QR" : "Scan for AR"}
        </button>
        <button onClick={() => window.location.href='/vr'} className="btn-primary">
          Enter VR Showroom
        </button>
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
              <button onClick={() => setQrValue(window.location.href)} className="btn-secondary" style={{ marginRight: 8 }}>Use current page</button>
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