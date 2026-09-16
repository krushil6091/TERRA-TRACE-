import React from 'react';
import { useAuth } from '../context/AuthContext';
import { EmblemSeal } from './common/EmblemSeal';

export const Header: React.FC = () => {
  const { user } = useAuth();

  const officerIdentity = user
    ? `OFFICER: ${user.full_name} | BADGE: ${user.badge_id}`
    : 'OFFICER: Lead Forensic Auditor | BADGE: EXAM-SEC-7749';

  return (
    <div className="w-full shrink-0 z-40">
      {/* 3-4px Flat Static Indian Tricolor Accent Bar */}
      <div className="w-full h-[3px] flex" aria-hidden="true">
        <div className="w-1/3 h-full bg-[#FF9933]" />
        <div className="w-1/3 h-full bg-[#FFFFFF]" />
        <div className="w-1/3 h-full bg-[#138808]" />
      </div>

      {/* Thin Navy Top Bar */}
      <header className="bg-[#0B1F3A] border-b border-[#5C6670]/40 px-3 sm:px-6 py-2 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Emblem & Product Name in Serif on the Left */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <EmblemSeal size={24} variant="light" className="shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-white font-serif text-sm sm:text-base font-bold tracking-wide">
                Terra Trace
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono text-[#C9A227] uppercase tracking-wider font-semibold border border-[#C9A227]/50 px-1.5 py-0.2 rounded-[2px] bg-[#C9A227]/10 whitespace-nowrap">
                FORENSIC REGISTER
              </span>
              <span className="hidden md:inline-block text-[10px] font-mono text-[#F7F5F0]/70 uppercase tracking-wider border border-[#5C6670]/60 px-1.5 py-0.2 rounded-[2px] bg-white/5 whitespace-nowrap">
                AIR-GAPPED ENCLAVE
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] font-sans text-[#F7F5F0]/70 truncate">
              National Examination Board Integrity & Decision-Support System
            </div>
          </div>
        </div>

        {/* Admin Identity in Monospace on the Right */}
        <div className="flex items-center gap-2 text-left sm:text-right pt-1 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#138808] animate-pulse shrink-0" />
          <div className="font-mono text-[10px] sm:text-xs text-[#F7F5F0]/90 tracking-tight truncate max-w-[280px] sm:max-w-none">
            {officerIdentity}
          </div>
        </div>
      </header>
    </div>
  );
};
