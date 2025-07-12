"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export function LandingBackground() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="absolute inset-0 -z-10 overflow-hidden bg-background" />
  }

  const isDark = theme === "dark"

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-background">
      {/* Clean gradient backdrop */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at top left, rgba(24, 178, 170, 0.08) 0%, transparent 50%)"
            : "radial-gradient(ellipse at top left, rgba(24, 178, 170, 0.05) 0%, transparent 50%)",
        }}
      />

      {/* Structured geometric lines with filled squares */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="gridWithFilledSquares" x="0" y="0" width="1200" height="1200" patternUnits="userSpaceOnUse">
            {/* Base grid lines with increased spacing */}
            <path
              d="M0,120 L1200,120 M0,240 L1200,240 M0,360 L1200,360 M0,480 L1200,480 M0,600 L1200,600 M0,720 L1200,720 M0,840 L1200,840 M0,960 L1200,960 M0,1080 L1200,1080"
              stroke={isDark ? "rgba(24, 178, 170, 0.12)" : "rgba(24, 178, 170, 0.04)"}
              strokeWidth="1"
              fill="none"
            />
            <path
              d="M120,0 L120,1200 M240,0 L240,1200 M360,0 L360,1200 M480,0 L480,1200 M600,0 L600,1200 M720,0 L720,1200 M840,0 L840,1200 M960,0 L960,1200 M1080,0 L1080,1200"
              stroke={isDark ? "rgba(24, 178, 170, 0.12)" : "rgba(24, 178, 170, 0.04)"}
              strokeWidth="1"
              fill="none"
            />
            
            {/* Filled squares (10% of 100 squares in the 10x10 grid) */}
            <rect x="0" y="0" width="120" height="120" fill={isDark ? "rgba(24, 178, 170, 0.03)" : "rgba(180, 180, 180, 0.06)"} />
            <rect x="360" y="120" width="120" height="120" fill={isDark ? "rgba(24, 178, 170, 0.03)" : "rgba(180, 180, 180, 0.06)"} />
            <rect x="840" y="120" width="120" height="120" fill={isDark ? "rgba(24, 178, 170, 0.03)" : "rgba(180, 180, 180, 0.06)"} />
            <rect x="120" y="360" width="120" height="120" fill={isDark ? "rgba(24, 178, 170, 0.03)" : "rgba(180, 180, 180, 0.06)"} />
            <rect x="600" y="360" width="120" height="120" fill={isDark ? "rgba(24, 178, 170, 0.03)" : "rgba(180, 180, 180, 0.06)"} />
            <rect x="240" y="600" width="120" height="120" fill={isDark ? "rgba(24, 178, 170, 0.03)" : "rgba(180, 180, 180, 0.06)"} />
            <rect x="960" y="600" width="120" height="120" fill={isDark ? "rgba(24, 178, 170, 0.03)" : "rgba(180, 180, 180, 0.06)"} />
            <rect x="480" y="840" width="120" height="120" fill={isDark ? "rgba(24, 178, 170, 0.03)" : "rgba(180, 180, 180, 0.06)"} />
            <rect x="720" y="960" width="120" height="120" fill={isDark ? "rgba(24, 178, 170, 0.03)" : "rgba(180, 180, 180, 0.06)"} />
            <rect x="1080" y="1080" width="120" height="120" fill={isDark ? "rgba(24, 178, 170, 0.03)" : "rgba(180, 180, 180, 0.06)"} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gridWithFilledSquares)" />

      </svg>
    </div>
  )
}
