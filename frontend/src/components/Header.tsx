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
      <header className="bg-[#0B1F3A] border-b border-[#5C6670]/40 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Emblem & Product Name in Serif on the Left */}
        <div className="flex items-center gap-3">
          <EmblemSeal size={26} variant="light" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-serif text-base font-bold tracking-wide">
                Terra Trace
              </span>
              <span className="text-[10px] font-mono text-[#C9A227] uppercase tracking-wider font-semibold border border-[#C9A227]/50 px-1.5 py-0.2 rounded-[2px] bg-[#C9A227]/10">
                FORENSIC DECISION REGISTER
              </span>
              <span className="hidden md:inline-block text-[10px] font-mono text-[#F7F5F0]/70 uppercase tracking-wider border border-[#5C6670]/60 px-1.5 py-0.2 rounded-[2px] bg-white/5">
                AIR-GAPPED ENCLAVE
              </span>
            </div>
            <div className="text-[10px] font-sans text-[#F7F5F0]/70">
              National Examination Board Integrity & Decision-Support System
            </div>
          </div>
        </div>

        {/* Admin Identity in Monospace on the Right */}
        <div className="flex items-center gap-2 text-right">
          <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse shrink-0" />
          <div className="font-mono text-xs text-[#F7F5F0] tracking-tight">
            {officerIdentity}
          </div>
        </div>
      </header>
    </div>
  );
};
