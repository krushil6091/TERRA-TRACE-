import React from 'react';

interface WatermarkAnchorProps {
  number: string;
  title: string;
  subtitle?: string;
  tagline?: string;
  action?: React.ReactNode;
  align?: 'left' | 'right';
  theme?: 'paper' | 'navy' | 'brass';
}

export const WatermarkAnchor: React.FC<WatermarkAnchorProps> = ({
  number,
  title,
  subtitle,
  tagline,
  action,
  align = 'right',
  theme = 'paper',
}) => {
  const isNavy = theme === 'navy';
  const isBrass = theme === 'brass';

  return (
    <div
      className={`relative overflow-hidden border rounded-[2px] p-4 sm:p-7 select-none transition-none shadow-2xs ${
        isNavy
          ? 'bg-[#0B1F3A] border-[#0B1F3A] text-white'
          : isBrass
          ? 'bg-[#C9A227] border-[#C9A227] text-white'
          : 'bg-[#FFFFFF] border-[#5C6670] text-[#1A1A1A]'
      }`}
    >
      {/* Background Architectural Watermark (Strictly Corner-Pinned, Ultra-Subtle Opacity) */}
      <div
        className={`absolute ${
          align === 'left' ? 'left-4 sm:left-8' : 'right-4 sm:right-8'
        } top-4 sm:top-6 pointer-events-none select-none flex flex-col items-end text-right leading-none z-0 ${
          isNavy
            ? 'text-white/[0.025]'
            : isBrass
            ? 'text-[#0B1F3A]/[0.04]'
            : 'text-[#0B1F3A]/[0.022]'
        }`}
        aria-hidden="true"
      >
        <span className="font-display font-black text-6xl sm:text-9xl md:text-[104px] tracking-tighter leading-none">
          {number}
        </span>
        <span className="font-mono font-bold text-[8px] sm:text-[10px] tracking-[0.25em] uppercase mt-1 opacity-70">
          REGISTER // {number}
        </span>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 space-y-3.5">
        {/* Header Content Block */}
        <div className="space-y-1.5 max-w-2xl sm:max-w-3xl pr-14 sm:pr-36">
          {/* Index & Section Tag */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-[2px] tracking-wider uppercase ${
                isNavy
                  ? 'bg-white/10 text-[#F7F5F0]'
                  : isBrass
                  ? 'bg-[#0B1F3A] text-white'
                  : 'bg-[#0B1F3A] text-white'
              }`}
            >
              {number}
            </span>
            {tagline && (
              <span
                className={`font-mono text-[10px] uppercase tracking-widest font-semibold ${
                  isNavy ? 'text-[#F7F5F0]/70' : 'text-[#5C6670]'
                }`}
              >
                // {tagline}
              </span>
            )}
          </div>

          {/* Dominant Headline */}
          <h1
            className={`text-xl sm:text-3xl font-serif font-bold tracking-tight leading-tight ${
              isNavy ? 'text-white' : isBrass ? 'text-[#0B1F3A]' : 'text-[#0B1F3A]'
            }`}
          >
            {title}
          </h1>

          {/* Subtitle explanation */}
          {subtitle && (
            <p
              className={`text-xs font-sans leading-relaxed pt-0.5 ${
                isNavy ? 'text-[#F7F5F0]/80' : isBrass ? 'text-[#0B1F3A]/90' : 'text-[#5C6670]'
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Dedicated Action Row if Actions Exist */}
        {action && (
          <div className="pt-3 border-t border-[#5C6670]/20">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};
