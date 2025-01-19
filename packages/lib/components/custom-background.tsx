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
        </defs>
        <rect width="100%" height="100%" className="fill-gray-100 dark:fill-gray-900" />
        <circle cx="0" cy="0" r="400" fill="url(#purpleGradient)">
          <animateMotion path="M 250 250 Q 300 50 550 250 T 850 250" dur="20s" repeatCount="indefinite" />
        </circle>
        <circle cx="1000" cy="1000" r="400" fill="url(#pinkGradient)">
          <animateMotion path="M 750 750 Q 700 950 450 750 T 150 750" dur="20s" repeatCount="indefinite" />
        </circle>
        <path d="M0,0 L1000,1000 M1000,0 L0,1000" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" />
      </svg>
    </div>
  );
}
