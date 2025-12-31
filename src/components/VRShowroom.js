import React, { useEffect, useState } from 'react';

const VRShowroom = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Suppress A-Frame warnings and errors in React
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      // Filter out A-Frame React warnings
      if (args[0] && typeof args[0] === 'string' && 
          (args[0].includes('Warning: Unknown event handler') || 
           args[0].includes('THREE.') ||
           args[0].includes('A-Frame'))) {
        return;
      }
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('THREE.')) {
        return;
      }
      originalWarn.apply(console, args);
    };

    // Check if A-Frame is already loaded
    if (window.AFRAME) {
      setLoadProgress(50);
      setIsLoading(false);
      setLoadProgress(100);
      return () => {
        console.error = originalError;
        console.warn = originalWarn;
      };
    }

    const script = document.createElement('script');
    script.src = "https://aframe.io/releases/1.4.0/aframe.min.js";
    script.async = true;
    
    script.onerror = () => {
      setError('Failed to load VR library. Please check your internet connection.');
      setIsLoading(false);
      console.error = originalError;
      console.warn = originalWarn;
    };
    
    script.onload = () => {
      setLoadProgress(50);
      // Wait for A-Frame to initialize
      setTimeout(() => {
        setIsLoading(false);
        setLoadProgress(100);
      }, 1000);
    };
    
    try {
      document.body.appendChild(script);
    } catch (e) {
      setError('Failed to initialize VR. ' + e.message);
      setIsLoading(false);
      console.error = originalError;
      console.warn = originalWarn;
    }
    
    return () => { 
      console.error = originalError;
      console.warn = originalWarn;
      
      try {
        if (script.parentNode) {
          document.body.removeChild(script);
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      const scene = document.querySelector('a-scene');
      if (scene && scene.parentNode) {
        scene.parentNode.removeChild(scene);
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#050505',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          flexDirection: 'column',
          color: '#fff',
          padding: '20px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '20px', color: '#ff4444' }}>Error Loading VR</div>
          <div style={{ fontSize: '16px', marginBottom: '30px', textAlign: 'center', maxWidth: '500px' }}>{error}</div>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 28px',
              background: '#d50000',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            Back to Home
          </button>
        </div>
      )}
      {isLoading && !error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#050505',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          flexDirection: 'column',
          color: '#fff'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>Loading VR Showroom...</div>
          <div style={{ width: '300px', height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${loadProgress}%`, height: '100%', background: '#0af', transition: 'width 0.5s' }}></div>
          </div>
          <div style={{ fontSize: '16px', marginTop: '10px' }}>{loadProgress}%</div>
        </div>
      )}
      {!error && (
        <a-scene shadow="type: pcfsoft" loading-screen="enabled: false" vr-mode-ui="enabled: true">
        <a-assets>
          <a-asset-item id="porsche-model" src="/models/porsche.glb"></a-asset-item>
        </a-assets>

        <a-sky color="#050505"></a-sky>
        <a-plane position="0 0 0" rotation="-90 0 0" width="100" height="100" color="#111" shadow></a-plane>

        <a-entity 
          gltf-model="#porsche-model" 
          position="0 0 -4" 
          scale="2.5 2.5 2.5"
          shadow="cast: true"
        ></a-entity>

        <a-light type="ambient" intensity="0.4"></a-light>
        <a-light type="spot" position="0 10 2" intensity="2" angle="40" penumbra="1" shadow></a-light>
        <a-camera position="0 1.6 0"></a-camera>
      </a-scene>
      )}
    </div>
  );
};

export default VRShowroom;