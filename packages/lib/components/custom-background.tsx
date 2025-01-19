import React from 'react';

export default function CustomBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <defs>
          <radialGradient id="purpleGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
          </radialGradient>
          <radialGradient id="pinkGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="rgba(236, 72, 153, 0.3)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0)" />
          </radialGradient>

          <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(139, 92, 246, 0.2)" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" className="fill-gray-100 dark:fill-gray-900" />

        <rect width="100%" height="100%" fill="url(#dots)" />

        <path d="M0,300 Q250,250 500,400 T1000,300" fill="none" className="stroke-purple-500/20" strokeWidth="2">
          <animate
            attributeName="d"
            dur="20s"
            repeatCount="indefinite"
            values="
                     M0,300 Q250,250 500,400 T1000,300;
                     M0,350 Q250,300 500,450 T1000,350;
                     M0,300 Q250,250 500,400 T1000,300"
          />
        </path>

        <path d="M0,600 Q250,550 500,700 T1000,600" fill="none" className="stroke-pink-500/20" strokeWidth="2">
          <animate
            attributeName="d"
            dur="15s"
            repeatCount="indefinite"
            values="
                     M0,600 Q250,550 500,700 T1000,600;
                     M0,650 Q250,600 500,750 T1000,650;
                     M0,600 Q250,550 500,700 T1000,600"
          />
        </path>

        <circle cx="0" cy="0" r="400" fill="url(#purpleGradient)">
          <animateMotion path="M 250 250 C 300 50 550 250 850 250 C 550 250 300 450 250 250" dur="20s" repeatCount="indefinite" rotate="auto" />
        </circle>

        <circle cx="1000" cy="1000" r="400" fill="url(#pinkGradient)">
          <animateMotion path="M 750 750 C 700 950 450 750 150 750 C 450 750 700 550 750 750" dur="20s" repeatCount="indefinite" rotate="auto" />
        </circle>
      </svg>
    </div>
  );
}
