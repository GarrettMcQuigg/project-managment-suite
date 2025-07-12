"use client"

export default function InternalBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(200,30%,98%)] via-[hsl(200,30%,96%)] to-[hsl(200,30%,94%)] dark:from-[hsl(175,90%,5%)] dark:via-[hsl(200,30%,2%)] dark:to-[hsl(200,30%,0%)] transition-colors duration-700" />

      {/* Subtle geometric grid overlay - echoing the landing background */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="subtleGrid" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <path
                d="M0,50 L200,50 M0,100 L200,100 M0,150 L200,150"
                stroke="rgba(24, 178, 170, 0.4)"
                strokeWidth="0.5"
                fill="none"
              />
              <path
                d="M50,0 L50,200 M100,0 L100,200 M150,0 L150,200"
                stroke="rgba(24, 178, 170, 0.4)"
                strokeWidth="0.5"
                fill="none"
              />
              {/* Subtle accent squares */}
              <rect x="0" y="0" width="50" height="50" fill="rgba(24, 178, 170, 0.02)" />
              <rect x="100" y="50" width="50" height="50" fill="rgba(24, 178, 170, 0.02)" />
              <rect x="50" y="150" width="50" height="50" fill="rgba(24, 178, 170, 0.02)" />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#subtleGrid)"
            style={{
              animation: "gridDrift 18s ease-in-out infinite",
            }}
          />
        </svg>
      </div>

      {/* Elegant floating shapes with cohesive colors */}
      <div className="absolute inset-0 opacity-20">
        {/* Primary accent blob - using same teal as landing background */}
        <div
          className="absolute h-[45rem] w-[45rem] -left-20 -top-32 rounded-[100%] bg-gradient-to-br from-[rgba(24,178,170,0.15)] via-[rgba(24,178,170,0.08)] to-transparent dark:from-[rgba(24,178,170,0.25)] dark:via-[rgba(24,178,170,0.15)] dark:to-transparent blur-3xl transform-gpu transition-all duration-700"
          style={{
            animation: "glowSlow 20s ease-in-out infinite",
          }}
        />

        {/* Secondary floating element */}
        <div
          className="absolute h-[30rem] w-[30rem] right-0 top-1/4 rounded-[100%] bg-gradient-to-bl from-[rgba(24,178,170,0.12)] via-[rgba(24,178,170,0.06)] to-transparent dark:from-[rgba(24,178,170,0.20)] dark:via-[rgba(24,178,170,0.12)] dark:to-transparent blur-3xl transform-gpu transition-all duration-700"
          style={{
            animation: "glowMedium 25s ease-in-out infinite",
          }}
        />

        {/* Geometric accent element - bridging organic and geometric */}
        <div
          className="absolute h-[20rem] w-[20rem] left-1/3 bottom-1/4 bg-gradient-to-tr from-[rgba(24,178,170,0.08)] to-transparent dark:from-[rgba(24,178,170,0.15)] dark:to-transparent blur-2xl transform-gpu transition-all duration-700"
          style={{
            clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            animation: "geometricFloat 15s ease-in-out infinite",
          }}
        />
      </div>

      {/* Animated accent lines with geometric influence */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(24, 178, 170, 0.3)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <g className="opacity-50 dark:opacity-30">
          {/* Flowing curves with subtle geometric segments */}
          <path fill="none" stroke="url(#line-gradient)" strokeWidth="1" d="">
            <animate
              attributeName="d"
              dur="20s"
              repeatCount="indefinite"
              values="M0,300 Q250,250 500,300 T1000,300;M0,300 Q250,350 500,300 T1000,300;M0,300 Q250,250 500,300 T1000,300"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            />
          </path>
          <path fill="none" stroke="url(#line-gradient)" strokeWidth="1" d="" className="opacity-30">
            <animate
              attributeName="d"
              dur="25s"
              repeatCount="indefinite"
              values="M0,600 Q250,550 500,600 T1000,600;M0,600 Q250,650 500,600 T1000,600;M0,600 Q250,550 500,600 T1000,600"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            />
          </path>

          {/* Subtle diagonal accent - echoing landing background */}
          <path
            d="M0,0 L200,200 M150,0 L350,200 M300,0 L500,200"
            stroke="rgba(24, 178, 170, 0.08)"
            strokeWidth="0.5"
            fill="none"
            opacity="0.6"
            style={{
              animation: "diagonalSubtle 22s ease-in-out infinite",
            }}
          />
        </g>
      </svg>

      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(0,0,0,0.02)] dark:to-[rgba(255,255,255,0.01)]" />

      <style jsx>{`
        @keyframes gridDrift {
          0%, 100% { 
            transform: translateX(0px) translateY(0px);
          }
          50% { 
            transform: translateX(5px) translateY(-3px);
          }
        }
        
        @keyframes geometricFloat {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          50% { 
            transform: translateY(-10px) rotate(2deg) scale(1.02);
          }
        }
        
        @keyframes diagonalSubtle {
          0%, 100% { 
            transform: translateX(0px);
            opacity: 0.6;
          }
          50% { 
            transform: translateX(8px);
            opacity: 0.3;
          }
        }

        @keyframes glowSlow {
          0%, 100% { 
            transform: translateY(0px) scale(1);
            opacity: 1;
          }
          50% { 
            transform: translateY(-5px) scale(1.01);
            opacity: 0.8;
          }
        }

        @keyframes glowMedium {
          0%, 100% { 
            transform: translateX(0px) scale(1);
            opacity: 1;
          }
          50% { 
            transform: translateX(5px) scale(1.02);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  )
}
