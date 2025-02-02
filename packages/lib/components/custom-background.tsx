'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function CustomBackground() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return empty div with same classes during SSR and mounting
  if (!mounted) {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 h-full w-full fill-[#f5f8fa] dark:fill-[#010305]" />
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <defs>
          <radialGradient id="slateGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor={isDark ? 'rgba(20, 38, 46, 0.7)' : 'rgba(11, 25, 31, 0.4)'} />
            <stop offset="100%" stopColor={isDark ? 'rgba(11, 25, 31, 0)' : 'rgba(11, 25, 31, 0)'} />
          </radialGradient>
          <radialGradient id="turquoiseGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor={isDark ? 'rgba(24, 178, 170, 0.7)' : 'rgba(24, 178, 170, 0.25)'} />
            <stop offset="100%" stopColor={isDark ? 'rgba(24, 178, 170, 0)' : 'rgba(24, 178, 170, 0)'} />
          </radialGradient>

          <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill={isDark ? 'rgba(24, 61, 77, 0.712)' : 'rgba(11, 25, 31, 0.13)'} />
          </pattern>
        </defs>

        <rect width="100%" height="100%" className="fill-[#f5f8fa] dark:fill-[#010305]" />

        <rect width="100%" height="100%" fill="url(#dots)" />

        <path d="M0,300 Q250,250 500,400 T1000,300" fill="none" stroke={isDark ? 'rgba(11, 25, 31, 0.5)' : 'rgba(11, 25, 31, 0.25)'} strokeWidth="2">
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

        <path d="M0,600 Q250,550 500,700 T1000,600" fill="none" stroke={isDark ? 'rgba(24, 178, 170, 0.35)' : 'rgba(24, 178, 170, 0.322)'} strokeWidth="2">
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

        <circle cx="0" cy="0" r="500" fill="url(#slateGradient)">
          <animateMotion path="M 250 250 C 300 50 550 250 850 250 C 550 250 300 450 250 250" dur="20s" repeatCount="indefinite" rotate="auto" />
        </circle>

        <circle cx="1000" cy="1000" r="500" fill="url(#turquoiseGradient)">
          <animateMotion path="M 750 750 C 700 950 450 750 150 750 C 450 750 700 550 750 750" dur="20s" repeatCount="indefinite" rotate="auto" />
        </circle>
      </svg>
    </div>
  );
}
