'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function CreativeBackground() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            <stop offset="0%" stopColor={isDark ? 'rgba(20, 38, 46, 0.9)' : 'rgba(11, 25, 31, 0.6)'} />
            <stop offset="100%" stopColor={isDark ? 'rgba(24, 178, 170, 0.9)' : 'rgba(24, 178, 170, 0.4)'} />
          </linearGradient>
          <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? 'rgba(24, 178, 170, 0.9)' : 'rgba(24, 178, 170, 0.4)'} />
            <stop offset="100%" stopColor={isDark ? 'rgba(20, 38, 46, 0.9)' : 'rgba(11, 25, 31, 0.6)'} />
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
                M0,300 Q250,200 500,300 T1000,300 T1500,400 T2000,300 V1000 H0 Z;
                M0,200 Q250,350 500,250 T1000,200 T1500,300 T2000,250 V1000 H0 Z;
                M0,350 Q250,250 500,350 T1000,300 T1500,250 T2000,300 V1000 H0 Z;
                M0,300 Q250,200 500,300 T1000,300 T1500,400 T2000,300 V1000 H0 Z"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
            />
            <animate attributeName="fill" dur="20s" repeatCount="indefinite" values="url(#grad1); url(#grad2); url(#grad1)" />
          </path>
        </g>

        <g filter="url(#glow)" opacity="0.8">
          <path d="" fill="none" stroke={isDark ? 'rgba(24, 178, 170, 0.5)' : 'rgba(24, 178, 170, 0.4)'} strokeWidth="2">
            <animate
              attributeName="d"
              dur="25s"
              repeatCount="indefinite"
              values="
                M0,500 Q200,400 400,450 T800,500 T1200,450 T1600,500 T2000,450;
                M0,450 Q200,500 400,400 T800,450 T1200,500 T1600,450 T2000,500;
                M0,400 Q200,450 400,500 T800,400 T1200,450 T1600,500 T2000,400;
                M0,500 Q200,400 400,450 T800,500 T1200,450 T1600,500 T2000,450"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
            />
          </path>
        </g>

        <g filter="url(#glow)" opacity="0.6">
          <path d="" fill="none" stroke={isDark ? 'rgba(11, 25, 31, 0.7)' : 'rgba(11, 25, 31, 0.4)'} strokeWidth="2">
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

        <circle r="3" fill={isDark ? 'rgba(24, 178, 170, 0.8)' : 'rgba(24, 178, 170, 0.6)'}>
          <animateMotion dur="40s" repeatCount="indefinite" path="M100,200 C200,300 300,100 400,200 C500,300 600,100 700,200 C800,300 900,100 1000,200" />
        </circle>

        <circle r="5" fill={isDark ? 'rgba(20, 38, 46, 0.8)' : 'rgba(11, 25, 31, 0.5)'}>
          <animateMotion dur="50s" repeatCount="indefinite" path="M1000,400 C900,500 800,300 700,400 C600,500 500,300 400,400 C300,500 200,300 100,400" />
        </circle>
      </svg>
    </div>
  );
}
