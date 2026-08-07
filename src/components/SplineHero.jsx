import React from 'react';

export default function SplineHero() {
  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-[#090611]">
      <div 
        className="absolute inset-0 w-full overflow-hidden" 
        style={{ height: 'calc(100% + 120px)', marginTop: '-60px' }}
      >
        <iframe
          src="https://my.spline.design/qceokiohgdthtdhb-20512803b9b47e23a2f3a61cffc94e0e/"
          className="w-full h-full border-0 pointer-events-auto"
          title="Spline 3D Scene"
        />
      </div>
    </div>
  );
}
