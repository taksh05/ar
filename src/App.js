// --- MAIN 360 & AR COMPONENT ---
const Home = () => {
  const [showQR, setShowQR] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // basic device detection: mobile or tablet
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    const mobileRegex = /Mobi|Android|iPhone|iPad|iPod|Tablet/i;
    const touch = typeof navigator !== 'undefined' && navigator.maxTouchPoints && navigator.maxTouchPoints > 1;
    setIsMobile(mobileRegex.test(ua) || touch || (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer:coarse)').matches));
  }, []);

  /** * REMOVED: The second useEffect that contained "Auto-launch AR" logic.
   * This prevents the phone from jumping straight to the camera.
   **/

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
            {/* On mobile, we show a button that links to the AR page 
               so it matches the experience of the QR code exactly.
            */}
            {isMobile ? (
              <Link to="/ar" slot="ar-button" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center', lineHeight: '40px' }}>
                VIEW IN AR
              </Link>
            ) : (
              <button slot="ar-button" style={{ display: 'none' }}></button>
            )}
          </model-viewer>
        </div>

        <div className="controls-section">
          <div className="controls-row">
            {isMobile ? (
              <>
                <div style={{ color: '#ddd', marginBottom: '15px', textAlign: 'center' }}>Tap <strong>VIEW IN AR</strong> to open the full experience</div>
                <Link to="/vr" style={{ width: '100%' }}>
                  <button className="btn btn-primary" style={{ width: '100%' }}>Launch VR</button>
                </Link>
                <Link to="/products" style={{ width: '100%' }}>
                  <button className="btn btn-outline" style={{ width: '100%' }}>View Products</button>
                </Link>
              </>
            ) : (
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
              <QRCode value={(typeof window !== 'undefined' ? window.location.origin : '') + '/#/ar'} size={150} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};