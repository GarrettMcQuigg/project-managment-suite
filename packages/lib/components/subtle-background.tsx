import React from 'react';

export default function SubtleBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(200,30%,98%)] via-[hsl(200,30%,96%)] to-[hsl(200,30%,94%)] dark:from-[hsl(175,90%,5%)] dark:via-[hsl(200,30%,2%)] dark:to-[hsl(200,30%,0%)] transition-colors duration-700" />

      {/* Elegant floating shapes with smoother gradients */}
      <div className="absolute inset-0 opacity-20">
        {/* Primary accent blob */}
        <div
          className="absolute h-[45rem] w-[45rem] -left-20 -top-32 rounded-[100%] 
          bg-gradient-to-br 
          from-[hsl(175,90%,35%)] 
          via-[hsl(175,90%,25%)] 
          to-transparent
          dark:from-[hsl(175,90%,45%)] 
          dark:via-[hsl(175,90%,35%)] 
          dark:to-transparent 
          blur-3xl transform-gpu transition-all duration-700
          animate-glow-slow"
        />

        {/* Secondary floating element */}
        <div
          className="absolute h-[30rem] w-[30rem] right-0 top-1/4 rounded-[100%]
          bg-gradient-to-bl 
          from-[hsl(175,90%,30%)] 
          via-[hsl(175,90%,25%)] 
          to-transparent
          dark:from-[hsl(175,90%,40%)] 
          dark:via-[hsl(175,90%,30%)] 
          dark:to-transparent
          blur-3xl transform-gpu transition-all duration-700
          animate-glow-medium"
        />
      </div>

      {/* Subtle animated accent lines */}
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="hsl(175,90%,30%)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        <g className="opacity-50 dark:opacity-30">
          {/* Animated accent curves */}
          <path fill="none" stroke="url(#line-gradient)" strokeWidth="1" d="">
            <animate
              attributeName="d"
              dur="20s"
              repeatCount="indefinite"
              values="
                M0,300 Q250,250 500,300 T1000,300;
                M0,300 Q250,350 500,300 T1000,300;
                M0,300 Q250,250 500,300 T1000,300"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            />
          </path>
          <path fill="none" stroke="url(#line-gradient)" strokeWidth="1" d="" className="opacity-30">
            <animate
              attributeName="d"
              dur="25s"
              repeatCount="indefinite"
              values="
                M0,600 Q250,550 500,600 T1000,600;
                M0,600 Q250,650 500,600 T1000,600;
                M0,600 Q250,550 500,600 T1000,600"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            />
          </path>
        </g>
      </svg>

      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(0,0,0,0.02)] dark:to-[rgba(255,255,255,0.01)]" />
    </div>
  );
}
