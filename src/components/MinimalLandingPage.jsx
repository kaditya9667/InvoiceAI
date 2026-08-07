import React, { useEffect, useState } from 'react';
import { Application } from '@splinetool/runtime';

export default function MinimalLandingPage({ onEnter }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = document.getElementById('spline-canvas');
    if (canvas) {
      const app = new Application(canvas);
      app.load('https://prod.spline.design/QCEOkIOHgdtHTdHB/scene.splinecode')
        .then(() => setIsLoaded(true))
        .catch((err) => console.error("Spline load error:", err));
    }
  }, []);

  return (
    <div 
      onClick={onEnter}
      className="relative w-screen h-screen overflow-hidden bg-[#090611] cursor-pointer"
    >
      {/* 
        100% Pure 3D Spline Canvas
        Cropped bottom watermark (-60px top margin offset)
      */}
      <div 
        className="absolute inset-0 w-full overflow-hidden" 
        style={{ height: 'calc(100vh + 120px)', marginTop: '-60px' }}
      >
        <canvas id="spline-canvas" className="w-full h-full pointer-events-auto" />
      </div>
    </div>
  );
}
