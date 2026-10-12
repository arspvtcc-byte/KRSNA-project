import type { FC } from 'react';

export const MandalaBackground: FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Top Center Delicate Mandala */}
      <div className="absolute -top-32 sm:-top-40 left-1/2 -translate-x-1/2 w-[380px] sm:w-[480px] h-[380px] sm:h-[480px] opacity-[0.22] dark:opacity-[0.14] transition-opacity">
        <svg viewBox="0 0 400 400" className="w-full h-full fill-none stroke-[var(--border-dial)]">
          {/* Concentric rings */}
          <circle cx="200" cy="200" r="30" strokeWidth="1" />
          <circle cx="200" cy="200" r="55" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx="200" cy="200" r="80" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="110" strokeWidth="0.8" />
          <circle cx="200" cy="200" r="140" strokeWidth="1.2" strokeDasharray="4 4" />
          <circle cx="200" cy="200" r="170" strokeWidth="1.8" />

          {/* 16-petal lotus geometry */}
          {Array.from({ length: 16 }).map((_, i) => {
            const rot = i * 22.5;
            return (
              <g key={`top-petal-${i}`} transform={`rotate(${rot} 200 200)`}>
                <path
                  d="M 200 120 C 185 90, 190 70, 200 50 C 210 70, 215 90, 200 120 Z"
                  strokeWidth="1"
                />
                <path
                  d="M 200 145 C 192 130, 195 115, 200 100 C 205 115, 208 130, 200 145 Z"
                  strokeWidth="0.8"
                />
                <circle cx="200" cy="40" r="2.5" fill="var(--border-dial)" stroke="none" />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom Large Lotus Arc */}
      <div className="absolute -bottom-48 sm:-bottom-64 left-1/2 -translate-x-1/2 w-[650px] sm:w-[850px] h-[650px] sm:h-[850px] opacity-[0.18] dark:opacity-[0.12] transition-opacity">
        <svg viewBox="0 0 600 600" className="w-full h-full fill-none stroke-[var(--border-dial)]">
          <circle cx="300" cy="300" r="60" strokeWidth="1" />
          <circle cx="300" cy="300" r="100" strokeWidth="1.2" strokeDasharray="4 4" />
          <circle cx="300" cy="300" r="150" strokeWidth="1.5" />
          <circle cx="300" cy="300" r="200" strokeWidth="1" />
          <circle cx="300" cy="300" r="240" strokeWidth="1.8" strokeDasharray="5 5" />
          <circle cx="300" cy="300" r="280" strokeWidth="2" />

          {/* 24 Grand Petal Array */}
          {Array.from({ length: 24 }).map((_, i) => {
            const rot = i * 15;
            return (
              <g key={`bot-petal-${i}`} transform={`rotate(${rot} 300 300)`}>
                <path
                  d="M 300 150 C 280 110, 285 75, 300 45 C 315 75, 320 110, 300 150 Z"
                  strokeWidth="1.2"
                />
                <path
                  d="M 300 200 C 288 170, 292 140, 300 120 C 308 140, 312 170, 300 200 Z"
                  strokeWidth="0.8"
                />
                <circle cx="300" cy="32" r="3" fill="var(--border-dial)" stroke="none" />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
