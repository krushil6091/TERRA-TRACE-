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
          <div className="flex items-center gap-3 text-right">
            {/* Backend Connection Health Badge */}
            <button
              type="button"
              onClick={() => setIsBackendModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] border text-[10px] font-mono cursor-pointer transition-colors ${
                apiHealth === 'healthy'
                  ? 'border-[#138808]/50 bg-[#138808]/20 text-[#6EE7B7] hover:bg-[#138808]/30'
                  : apiHealth === 'checking'
                  ? 'border-[#C9A227]/50 bg-[#C9A227]/20 text-[#FDE047] hover:bg-[#C9A227]/30'
                  : 'border-[#D9381E]/60 bg-[#D9381E]/25 text-[#FCA5A5] hover:bg-[#D9381E]/35 animate-pulse'
              }`}
              title={`Active API: ${activeUrl} (Click to configure or test)`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  apiHealth === 'healthy'
                    ? 'bg-[#10B981]'
                    : apiHealth === 'checking'
                    ? 'bg-[#F59E0B] animate-ping'
                    : 'bg-[#EF4444]'
                }`}
              />
              <span className="font-bold uppercase tracking-wider">
                {apiHealth === 'healthy' ? 'API LIVE' : apiHealth === 'checking' ? 'PROBING...' : 'SET BACKEND URL'}
              </span>
              <span className="text-[10px] opacity-80">⚙</span>
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
      </div>

      {/* Backend Settings Dialog */}
      <BackendConnectionModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
      />
    </>
  );
};
