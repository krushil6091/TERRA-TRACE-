import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

export interface InfoTooltipProps {
  /** The primary technical term or concept name */
  technicalTerm: string;
  /** Optional mathematical formula or code notation */
  formula?: string;
  /** Optional court case precedent or statutory legal reference */
  courtPrecedent?: string;
  /** Plain-language explanation of what this technical math actually checks */
  explanation: string;
  /** Preferred tooltip position relative to icon */
  position?: 'top' | 'bottom' | 'right' | 'left';
  /** Optional custom trigger size */
  size?: number;
  /** Optional custom CSS class */
  className?: string;
}

interface Coords {
  top: number;
  left: number;
  width: number;
  placedAbove: boolean;
  arrowLeft: number;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  technicalTerm,
  formula,
  courtPrecedent,
  explanation,
  position = 'top',
  size = 14,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  // Compute viewport-safe position
  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();

    // Responsive width clamped to viewport
    const tooltipWidth = Math.min(320, window.innerWidth - 24);

    // Center horizontally on trigger, then clamp within viewport padding (12px)
    let left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
    if (left < 12) left = 12;
    if (left + tooltipWidth > window.innerWidth - 12) {
      left = window.innerWidth - tooltipWidth - 12;
    }

    // Arrow pointer position relative to tooltip box
    const arrowLeft = Math.max(
      14,
      Math.min(tooltipWidth - 14, triggerRect.left + triggerRect.width / 2 - left)
    );

    // Check vertical space
    const spaceAbove = triggerRect.top;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const estimatedHeight = 220;

    let placedAbove = true;
    let top = 0;

    if (position === 'bottom') {
      if (spaceBelow >= estimatedHeight || spaceBelow >= spaceAbove) {
        placedAbove = false;
        top = triggerRect.bottom + 8;
      } else {
        placedAbove = true;
        top = triggerRect.top - 8;
      }
    } else {
      // Default: prefer top unless not enough space
      if (spaceAbove >= estimatedHeight || spaceAbove >= spaceBelow) {
        placedAbove = true;
        top = triggerRect.top - 8;
      } else {
        placedAbove = false;
        top = triggerRect.bottom + 8;
      }
    }

    setCoords({
      top,
      left,
      width: tooltipWidth,
      placedAbove,
      arrowLeft,
    });
  }, [position]);

  const handleOpen = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    computePosition();
    setIsOpen(true);
  };

  const handleClose = () => {
    // 100ms grace period so user can move mouse into tooltip
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  const handleMouseEnterTooltip = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  // Recalculate position on scroll / resize while open
  useEffect(() => {
    if (!isOpen) return;
    computePosition();

    const handleScrollOrResize = () => {
      computePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, computePosition]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <span className={`inline-flex items-center align-middle ${className}`}>
      {/* Subtle Question Mark Icon Trigger */}
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Technical explanation for ${technicalTerm}`}
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
          } else {
            handleOpen();
          }
        }}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onFocus={handleOpen}
        onBlur={handleClose}
        className="text-[#5C6670] hover:text-[#0B1F3A] focus:text-[#0B1F3A] focus:outline-none p-0.5 rounded-full hover:bg-[#0B1F3A]/5 transition-colors cursor-help inline-flex items-center justify-center shrink-0"
      >
        <HelpCircle size={size} className="stroke-[2.2]" />
      </button>

      {/* Viewport-Clamped Floating Portal Popover */}
      {isOpen &&
        coords &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            onMouseEnter={handleMouseEnterTooltip}
            onMouseLeave={handleClose}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              transform: coords.placedAbove ? 'translateY(-100%)' : 'none',
              zIndex: 99999,
            }}
            className="p-3.5 bg-[#0B1F3A] text-white text-left rounded-[2px] shadow-2xl border border-[#C9A227]/50 pointer-events-auto transition-opacity duration-150 max-h-[85vh] overflow-y-auto"
          >
            {/* Header Strip: Technical Name */}
            <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-white/15">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9A227] font-bold">
                TECHNICAL FORENSIC SPEC
              </span>
              {courtPrecedent && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#8A1538] text-white font-bold rounded-[2px] shrink-0">
                  CASE PRECEDENT
                </span>
              )}
            </div>

            <div className="pt-2 space-y-2">
              {/* Technical Title */}
              <div className="font-serif text-xs font-bold text-[#F7F5F0] leading-snug">
                {technicalTerm}
              </div>

              {/* Optional Math Formula */}
              {formula && (
                <div className="p-2 bg-black/40 border border-white/10 rounded-[2px] font-mono text-[11px] text-[#C9A227] overflow-x-auto leading-relaxed">
                  <code>{formula}</code>
                </div>
              )}

              {/* Plain-Language Explanation */}
              <p className="text-[11px] font-sans text-[#F7F5F0]/90 leading-relaxed">
                {explanation}
              </p>

              {/* Court Precedent Note */}
              {courtPrecedent && (
                <div className="pt-1 text-[10px] font-mono text-[#F7F5F0]/70 border-t border-white/10">
                  <span className="text-[#C9A227]">COURT CUSTODY: </span>
                  {courtPrecedent}
                </div>
              )}
            </div>

            {/* Dynamic Viewport Pointer Triangle */}
            <div
              style={{ left: `${coords.arrowLeft}px` }}
              className={`absolute w-2 h-2 bg-[#0B1F3A] border-[#C9A227]/50 transform rotate-45 -translate-x-1/2 ${
                coords.placedAbove
                  ? 'top-full -mt-1 border-b border-r'
                  : 'bottom-full -mb-1 border-t border-l'
              }`}
            />
          </div>,
          document.body
        )}
    </span>
  );
};

