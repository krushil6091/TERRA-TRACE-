import React from 'react';

interface EmblemSealProps {
  className?: string;
  size?: number;
  variant?: 'light' | 'dark' | 'brass' | 'crimson';
}

export const EmblemSeal: React.FC<EmblemSealProps> = ({
  className = '',
  size = 28,
  variant = 'light',
}) => {
  const colorMap = {
    light: '#F7F5F0',
    dark: '#0B1F3A',
    brass: '#C9A227',
    crimson: '#8A1538',
  };

  const color = colorMap[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="National Forensic Examination Register Seal"
    >
      {/* Outer Concentric Precision Ring */}
      <circle cx="24" cy="24" r="22" stroke={color} strokeWidth="1.5" strokeDasharray="3 1.5" />
      <circle cx="24" cy="24" r="19.5" stroke={color} strokeWidth="1" />

      {/* 12-Radial Precision Ticks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 24 + 17 * Math.cos(angle);
        const y1 = 24 + 17 * Math.sin(angle);
        const x2 = 24 + 19 * Math.cos(angle);
        const y2 = 24 + 19 * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth="1"
          />
        );
      })}

      {/* Central Forensic Scale / Diamond Matrix Crest */}
      <polygon
        points="24,9 31,18 24,27 17,18"
        fill="none"
        stroke={color}
        strokeWidth="1.25"
      />
      <circle cx="24" cy="18" r="2.5" fill={color} />

      {/* Baseline Pillar & Foundation Arch */}
      <path
        d="M15 31 H33 M18 31 V37 M30 31 V37 M13 37 H35"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="square"
      />

      {/* Micro Stars / Integrity Points */}
      <polygon points="24,30 25,32 27,32 25.5,33.5 26,35.5 24,34 22,35.5 22.5,33.5 21,32 23,32" fill={color} />
      <circle cx="10" cy="24" r="1" fill={color} />
      <circle cx="38" cy="24" r="1" fill={color} />
    </svg>
  );
};
