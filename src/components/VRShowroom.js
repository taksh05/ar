import React, { useEffect, useState } from 'react';

const VRShowroom = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && 
          (args[0].includes('Warning: Unknown event handler') || args[0].includes('THREE.') || args[0].includes('A-Frame'))) return;
      originalError.apply(console, args);
    };

    if (window.AFRAME) {
      setIsLoading(false);
      setLoadProgress(100);
      return;
    }

    const script = document.createElement('script');
    script.src = "https://aframe.io/releases/1.4.0/aframe.min.js";
    script.async = true;
    script.onload = () => {
      setLoadProgress(50);
      setTimeout(() => { setIsLoading(false); setLoadProgress(100); }, 1000);
    };
    script.onerror = () => setError('VR Systems Offline. Check Connection.');
    document.body.appendChild(script);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return (
    <div className="vr-wrapper" style={{ width: '100vw', height: '100vh', background: '#000' }}>
      {isLoading && (
        <div className="loading-indicator" style={{ position: 'fixed', zIndex: 9999, background: '#000', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ color: '#00f2ff', fontFamily: 'Orbitron' }}>INITIALIZING VR HANGAR</h2>
          <div className="loading-bar-container" style={{ width: '300px' }}>
            <div className="loading-bar" style={{ width: `${loadProgress}%` }}></div>
          </div>
          <p>{loadProgress}%</p>
        </div>
      )}

      {!error && !isLoading && (
        <a-scene shadow="type: pcfsoft" embedded style={{ height: '100vh', width: '100vw' }}>
          <a-assets>
            {/* Drone model path from your app */}
            <a-asset-item id="drone-model" src="/models/drone_final_v1.glb"></a-asset-item>
          </a-assets>

          <a-sky color="#020205"></a-sky>
          
          {/* Futuristic Grid Floor */}
          <a-grid static-body material="opacity: 0.2; color: #00f2ff"></a-grid>
          <a-plane position="0 -0.1 0" rotation="-90 0 0" width="100" height="100" color="#050505"></a-plane>

          {/* The Drone */}
          <a-entity 
            gltf-model="#drone-model" 
            position="0 1.5 -3" 
            scale="1.5 1.5 1.5"
            animation="property: rotation; to: 0 360 0; loop: true; dur: 20000; easing: linear"
            shadow="cast: true"
          ></a-entity>

          {/* Cinematic Lights */}
          <a-light type="ambient" intensity="0.3"></a-light>
          <a-light type="point" position="2 4 -2" intensity="1.5" color="#00f2ff"></a-light>
          <a-light type="point" position="-2 4 -2" intensity="1.5" color="#7000ff"></a-light>
          
          <a-camera position="0 1.6 0">
             <a-cursor color="#00f2ff"></a-cursor>
          </a-camera>
        </a-scene>
      )}
      
      <button 
        onClick={() => window.location.hash = '/'} 
        className="btn btn-outline" 
        style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, fontSize: '10px' }}>
        EXIT VR
      </button>
    </div>
  );
};

export default VRShowroom;