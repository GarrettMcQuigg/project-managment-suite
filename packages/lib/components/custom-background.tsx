'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function CreativeBackground() {
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
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? 'rgba(20, 38, 46, 0.7)' : 'rgba(11, 25, 31, 0.4)'} />
            <stop offset="100%" stopColor={isDark ? 'rgba(24, 178, 170, 0.7)' : 'rgba(24, 178, 170, 0.25)'} />
          </linearGradient>
          <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? 'rgba(24, 178, 170, 0.7)' : 'rgba(24, 178, 170, 0.25)'} />
            <stop offset="100%" stopColor={isDark ? 'rgba(20, 38, 46, 0.7)' : 'rgba(11, 25, 31, 0.4)'} />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="100%" height="100%" className="fill-[#f5f8fa] dark:fill-[#010305]" />

        <g filter="url(#glow)">
          <path d="">
            <animate
              attributeName="d"
              dur="20s"
              repeatCount="indefinite"
              values="
                M0,500 Q250,400 500,500 T1000,500 T1500,600 T2000,500 V1000 H0 Z;
                M0,400 Q250,550 500,450 T1000,400 T1500,500 T2000,450 V1000 H0 Z;
                M0,550 Q250,450 500,550 T1000,500 T1500,450 T2000,500 V1000 H0 Z;
                M0,500 Q250,400 500,500 T1000,500 T1500,600 T2000,500 V1000 H0 Z"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
            />
            <animate attributeName="fill" dur="20s" repeatCount="indefinite" values="url(#grad1); url(#grad2); url(#grad1)" />
          </path>
        </g>

        <g filter="url(#glow)" opacity="0.7">
          <path d="" fill="none" stroke={isDark ? 'rgba(24, 178, 170, 0.35)' : 'rgba(24, 178, 170, 0.322)'} strokeWidth="2">
            <animate
              attributeName="d"
              dur="25s"
              repeatCount="indefinite"
              values="
                M0,800 Q200,700 400,750 T800,800 T1200,750 T1600,800 T2000,750;
                M0,750 Q200,800 400,700 T800,750 T1200,800 T1600,750 T2000,800;
                M0,700 Q200,750 400,800 T800,700 T1200,750 T1600,800 T2000,700;
                M0,800 Q200,700 400,750 T800,800 T1200,750 T1600,800 T2000,750"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
            />
          </path>
        </g>

        <g filter="url(#glow)" opacity="0.5">
          <path d="" fill="none" stroke={isDark ? 'rgba(11, 25, 31, 0.5)' : 'rgba(11, 25, 31, 0.25)'} strokeWidth="2">
            <animate
              attributeName="d"
              dur="30s"
              repeatCount="indefinite"
              values="
                M0,200 Q250,100 500,150 T1000,200 T1500,150 T2000,200;
                M0,150 Q250,200 500,100 T1000,150 T1500,200 T2000,150;
                M0,100 Q250,150 500,200 T1000,100 T1500,150 T2000,200;
                M0,200 Q250,100 500,150 T1000,200 T1500,150 T2000,200"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
            />
          </path>
        </g>

        <circle r="3" fill={isDark ? 'rgba(24, 178, 170, 0.7)' : 'rgba(24, 178, 170, 0.5)'}>
          <animateMotion dur="40s" repeatCount="indefinite" path="M100,100 C200,200 300,0 400,100 C500,200 600,0 700,100 C800,200 900,0 1000,100" />
        </circle>

        <circle r="5" fill={isDark ? 'rgba(20, 38, 46, 0.7)' : 'rgba(11, 25, 31, 0.4)'}>
          <animateMotion dur="50s" repeatCount="indefinite" path="M1000,800 C900,900 800,700 700,800 C600,900 500,700 400,800 C300,900 200,700 100,800" />
        </circle>
      </svg>
    </div>
  );
}
