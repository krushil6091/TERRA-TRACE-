import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { EmblemSeal } from './common/EmblemSeal';
import { BackendConnectionModal } from './BackendConnectionModal';
import { testBackendHealth, getActiveBackendUrl } from '../services/api';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
  const [apiHealth, setApiHealth] = useState<'healthy' | 'checking' | 'error'>('checking');

  const checkStatus = useCallback(async () => {
    setApiHealth('checking');
    try {
      const res = await testBackendHealth();
      setApiHealth(res.ok ? 'healthy' : 'error');
    } catch {
      setApiHealth('error');
    }
  }, []);

  useEffect(() => {
    checkStatus();

    const handleBackendChange = () => {
      checkStatus();
    };

    window.addEventListener('terra-trace-backend-changed', handleBackendChange);
    const handleOpenModal = () => setIsBackendModalOpen(true);
    window.addEventListener('terra-trace-open-backend-modal', handleOpenModal);

    // Periodically re-check health every 60 seconds
    const interval = setInterval(checkStatus, 60000);

    return () => {
      window.removeEventListener('terra-trace-backend-changed', handleBackendChange);
      window.removeEventListener('terra-trace-open-backend-modal', handleOpenModal);
      clearInterval(interval);
    };
  }, [checkStatus]);

  const officerIdentity = user
    ? `OFFICER: ${user.full_name} | BADGE: ${user.badge_id}`
    : 'OFFICER: Lead Forensic Auditor | BADGE: EXAM-SEC-7749';

  const activeUrl = getActiveBackendUrl() || 'Relative (/api)';

  return (
    <>
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

          {/* Controls & Admin Identity in Monospace on the Right */}
          <div className="flex items-center gap-2.5 text-right">
            {/* Mobile / Web User Manual Button */}
            <a
              href="/manual.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-stretch overflow-hidden border border-[#C9A227]/60 bg-[#071324] hover:bg-[#0E2038] text-[#FDE047] text-[10px] font-mono cursor-pointer transition-colors shadow-2xs group"
              title="Open Mobile-Friendly User Manual & Pitch Playbook"
            >
              <span className="flex items-center justify-center px-1.5 bg-[#C9A227]/20 border-r border-[#C9A227]/40">
                📖
              </span>
              <span className="py-1 px-2 font-bold uppercase tracking-wider">
                MANUAL
              </span>
            </a>

            {/* Backend Connection Health Badge */}
            <button
              type="button"
              onClick={() => setIsBackendModalOpen(true)}
              className={`inline-flex items-stretch overflow-hidden border text-[10px] font-mono cursor-pointer transition-colors shadow-2xs ${
                apiHealth === 'healthy'
                  ? 'border-[#138808]/60 bg-[#071324] text-[#6EE7B7] hover:bg-[#0E2038]'
                  : apiHealth === 'checking'
                  ? 'border-[#C9A227]/60 bg-[#071324] text-[#FDE047] hover:bg-[#0E2038]'
                  : 'border-[#D9381E]/80 bg-[#071324] text-[#FCA5A5] hover:bg-[#0E2038] animate-pulse'
              }`}
              title={`Active API: ${activeUrl} (Click to configure or test)`}
            >
              <span className={`flex items-center justify-center px-1.5 border-r ${
                apiHealth === 'healthy' ? 'border-[#138808]/40 bg-[#138808]/20' : apiHealth === 'checking' ? 'border-[#C9A227]/40 bg-[#C9A227]/20' : 'border-[#D9381E]/40 bg-[#D9381E]/20'
              }`}>
                <span
                  className={`w-2 h-2 rounded-full ${
                    apiHealth === 'healthy'
                      ? 'bg-[#10B981]'
                      : apiHealth === 'checking'
                      ? 'bg-[#F59E0B] animate-ping'
                      : 'bg-[#EF4444]'
                  }`}
                />
              </span>
              <span className="py-1 px-2 font-bold uppercase tracking-wider flex items-center gap-1">
                <span>{apiHealth === 'healthy' ? 'API LIVE' : apiHealth === 'checking' ? 'PROBING...' : 'SET BACKEND URL'}</span>
                <span className="opacity-80">⚙</span>
              </span>
            </button>

            {/* Officer Badge */}
            <div className="flex items-center gap-2 pl-1 border-l border-[#5C6670]/40">
              <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse shrink-0" />
              <div className="font-mono text-xs text-[#F7F5F0] tracking-tight">
                {officerIdentity}
              </div>
            </div>
          </div>
        </header>

        {/* Sovereign Air-Gapped Hardware & Cryptography Telemetry Ribbon */}
        <div className="w-full bg-[#071324] border-b border-[#1E293B] px-6 py-1 flex items-center justify-between text-[10px] font-mono text-[#94A3B8] select-none overflow-x-auto gap-4 shadow-inner">
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="tracking-wider">SOVEREIGN ENCLAVE: 100% AIR-GAPPED</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-cyan-300 hidden md:inline">
              POLARS RUST: <span className="text-white font-semibold">VECTORIZED &bull; SUB-100MS</span>
            </span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-amber-300">
              HASH ROOT: <span className="text-white font-semibold">SHA-256 CHECKPOINT ACTIVE</span>
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[9px]">
            <span className="text-slate-400 hidden lg:inline">
              MEMORY: <span className="text-emerald-400 font-semibold">~14.2 MB (ARROW)</span>
            </span>
            <span className="text-slate-600 hidden lg:inline">|</span>
            <span className="text-amber-300 font-semibold bg-amber-950/50 border border-amber-800/60 px-2 py-0.5 rounded tracking-wide">
              DPDP ACT 2023 &bull; ZERO CLOUD LEAKAGE
            </span>
          </div>
        </div>
      </div>

      {/* Backend Settings Dialog */}
      <BackendConnectionModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
      />
    </>
  );
};
