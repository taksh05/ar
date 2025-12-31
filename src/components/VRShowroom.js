import React, { useEffect } from 'react';

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
      <a-scene shadow="type: pcfsoft">
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
    </div>
  );
};

export default VRShowroom;