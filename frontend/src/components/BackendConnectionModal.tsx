import React, { useState, useEffect } from 'react';
import {
  getActiveBackendUrl,
  getStoredBackendUrl,
  setStoredBackendUrl,
  testBackendHealth,
} from '../services/api';
import { useIngestionStore } from '../stores/ingestionStore';
import { useTriageStore } from '../stores/triageStore';

interface BackendConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendConnectionModal: React.FC<BackendConnectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<{
    latencyMs?: number;
    message?: string;
  } | null>(null);

  const { fetchDatasetStatuses, fetchAuditLogs } = useIngestionStore();
  const { fetchQueue, fetchHierarchy } = useTriageStore();

  useEffect(() => {
    if (isOpen) {
      setUrlInput(getStoredBackendUrl() || getActiveBackendUrl());
      setTestStatus('idle');
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTestStatus('testing');
    setTestResult(null);
    const res = await testBackendHealth(urlInput);
    if (res.ok) {
      setTestStatus('success');
      setTestResult({
        latencyMs: res.latencyMs,
        message: `${res.message} (${res.latencyMs}ms)`,
      });
    } else {
      setTestStatus('error');
      setTestResult({
        latencyMs: res.latencyMs,
        message: res.message,
      });
    }
  };

  const handleSave = async () => {
    setStoredBackendUrl(urlInput);
    // Refresh all data
    await Promise.allSettled([
      fetchDatasetStatuses(),
      fetchAuditLogs(),
      fetchQueue(),
      fetchHierarchy(),
    ]);
    onClose();
  };

  const handleResetDefault = async () => {
    setStoredBackendUrl('');
    setUrlInput(getActiveBackendUrl());
    setTestStatus('idle');
    setTestResult(null);
    await Promise.allSettled([
      fetchDatasetStatuses(),
      fetchAuditLogs(),
      fetchQueue(),
      fetchHierarchy(),
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/75 backdrop-blur-sm">
      <div className="bg-[#FFFFFF] border-2 border-[#0B1F3A] rounded-[2px] w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#0B1F3A] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#C9A227]/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
            <h3 className="font-serif font-bold text-base tracking-wide">
              Backend Network Configuration
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#F7F5F0]/70 hover:text-white font-mono text-sm px-1.5 py-0.5"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-left">
          <p className="text-xs text-[#5C6670] leading-relaxed font-sans">
            Configure the live API backend target for this browser session. If hosted on Render, enter your Web Service URL (e.g. <code className="bg-[#F7F5F0] text-[#0B1F3A] px-1 py-0.5 font-mono text-[11px] border border-[#5C6670]/30 rounded-[2px]">https://your-app.onrender.com</code>).
          </p>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase font-bold text-[#0B1F3A]">
              Active Backend Base URL
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setTestStatus('idle');
                setTestResult(null);
              }}
              placeholder="https://your-service.onrender.com or http://localhost:8000"
              className="w-full px-3 py-2 border border-[#5C6670] rounded-[2px] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#0B1F3A] text-[#1A1A1A] bg-[#F7F5F0]/50"
            />
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-mono text-[#5C6670] uppercase">Quick Select:</span>
            <button
              type="button"
              onClick={() => {
                setUrlInput('http://localhost:8000');
                setTestStatus('idle');
                setTestResult(null);
              }}
              className="px-2 py-0.5 text-[10px] font-mono border border-[#5C6670]/40 rounded-[2px] bg-[#FFFFFF] hover:bg-[#F7F5F0] text-[#0B1F3A]"
            >
              Localhost (8000)
            </button>
            <button
              type="button"
              onClick={() => {
                setUrlInput('');
                setTestStatus('idle');
                setTestResult(null);
              }}
              className="px-2 py-0.5 text-[10px] font-mono border border-[#5C6670]/40 rounded-[2px] bg-[#FFFFFF] hover:bg-[#F7F5F0] text-[#5C6670]"
            >
              Clear / Relative (/api)
            </button>
          </div>

          {/* Test connection result block */}
          {testStatus === 'testing' && (
            <div className="p-3 bg-[#C9A227]/10 border border-[#C9A227]/40 rounded-[2px] flex items-center gap-2 text-xs font-mono text-[#0B1F3A]">
              <span className="w-3.5 h-3.5 border-2 border-[#0B1F3A] border-t-transparent rounded-full animate-spin" />
              <span>Probing backend endpoint (/health)... waking up service if sleeping</span>
            </div>
          )}

          {testStatus === 'success' && (
            <div className="p-3 bg-[#138808]/10 border border-[#138808]/40 rounded-[2px] space-y-1 text-xs font-mono text-[#138808]">
              <div className="font-bold flex items-center gap-1.5">
                <span>✓ CONNECTED</span>
                <span className="text-[10px] font-normal text-[#5C6670]">({testResult?.latencyMs}ms)</span>
              </div>
              <div className="text-[11px] text-[#1A1A1A] font-sans">
                {testResult?.message}
              </div>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="p-3 bg-[#8A1538]/10 border border-[#8A1538]/40 rounded-[2px] space-y-1 text-xs font-mono text-[#8A1538]">
              <div className="font-bold">✕ CONNECTION FAILED</div>
              <div className="text-[11px] text-[#1A1A1A] font-sans leading-tight">
                {testResult?.message}
              </div>
              <div className="text-[10px] text-[#5C6670] font-sans pt-1">
                Tip: On Render free tier, inactive services sleep and require 30–50 seconds to boot. Try testing again in 15 seconds.
              </div>
            </div>
          )}

          {/* Informational notice */}
          <div className="p-3 bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[2px] text-[11px] text-[#5C6670] space-y-1">
            <div className="font-mono font-bold text-[#0B1F3A] text-[10px] uppercase">
              // Render Free Tier Behavior Note
            </div>
            <p>
              Render puts free web services to sleep after 15 minutes of inactivity. When you send your first request, Render starts the container which takes ~30 seconds. All subsequent requests run instantly (&lt;100ms).
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#F7F5F0] px-5 py-3 border-t border-[#5C6670]/30 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetDefault}
            className="text-xs font-mono text-[#5C6670] hover:text-[#0B1F3A] underline"
          >
            Reset Default
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={testStatus === 'testing'}
              className="px-3 py-1.5 border border-[#0B1F3A] text-[#0B1F3A] bg-white hover:bg-[#0B1F3A]/5 text-xs font-mono uppercase font-bold rounded-[2px] cursor-pointer disabled:opacity-50"
            >
              {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90 text-xs font-mono uppercase font-bold rounded-[2px] cursor-pointer border border-[#0B1F3A]"
            >
              Save & Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
