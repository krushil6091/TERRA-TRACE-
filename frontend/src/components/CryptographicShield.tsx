import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { ShieldState } from '../stores/ingestionStore';
import type { DatasetStatus, IngestionResponse, ValidationErrorDetail } from '../types';

interface CryptographicShieldProps {
  status: ShieldState;
  datasetInfo?: DatasetStatus;
  lastResponse?: IngestionResponse | null;
  error?: ValidationErrorDetail | string | null;
  recordTypeName: string;
}

export const CryptographicShield: React.FC<CryptographicShieldProps> = ({
  status,
  datasetInfo,
  lastResponse,
  error,
  recordTypeName,
}) => {
  const [copied, setCopied] = useState(false);
  const hash = lastResponse?.file_hash_sha256 || datasetInfo?.file_hash_sha256;
  const rowCount = lastResponse?.row_count ?? datasetInfo?.row_count ?? 0;
  const isSynthetic = lastResponse?.is_synthetic ?? datasetInfo?.is_synthetic ?? false;
  const filename = lastResponse?.filename || datasetInfo?.filename;

  const copyHash = () => {
    if (hash) {
      navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (status === 'validating') {
    return (
      <div className="p-3 bg-[#FFFFFF] border-2 border-[#C9A227] rounded-[2px] text-[#1A1A1A] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-[#C9A227] border-t-transparent rounded-full animate-hash-spin" />
            <span className="text-[11px] font-mono font-bold text-[#0B1F3A] uppercase tracking-wider">
              // CRYPTOGRAPHIC HASHING IN PROGRESS
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#C9A227] font-bold uppercase">
            POLARS STREAM
          </span>
        </div>
        <p className="text-xs text-[#5C6670] font-sans">
          Validating strict schema columns and computing SHA-256 block hash for <strong className="text-[#1A1A1A]">{recordTypeName}</strong>...
        </p>
        <div className="text-[10px] text-[#5C6670] font-mono pt-1.5 border-t border-[#5C6670]/20 flex items-center justify-between">
          <span>Actual compute &lt;100ms. If spinning, Render may be waking up.</span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('terra-trace-open-backend-modal'))}
            className="underline text-[#0B1F3A] hover:text-[#C9A227] cursor-pointer font-bold"
          >
            Check Backend
          </button>
        </div>
      </div>
    );
  }

  if (status === 'verified') {
    return (
      <div className="p-3.5 bg-[#FFFFFF] border-2 border-[#0B1F3A] rounded-[2px] text-[#1A1A1A] space-y-2.5 relative overflow-hidden">
        {/* Verification Stamped Watermark */}
        <div className="absolute right-2 top-2 pointer-events-none opacity-85 animate-stamp">
          <div className="border-2 border-[#138808] px-2 py-0.5 rounded-[2px] font-mono font-bold text-[9px] text-[#138808] tracking-widest uppercase rotate-[-3deg] bg-white/90">
            ✓ COMMITTED
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-[#5C6670]/20 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#138808] inline-block" />
            <span className="text-[11px] font-mono font-bold text-[#0B1F3A] uppercase tracking-wider">
              // CHECKPOINT COMMITTED
            </span>
          </div>

          <div className="flex items-center gap-1.5 pr-20">
            {isSynthetic && (
              <span className="px-1.5 py-0.5 bg-[#C9A227] text-white text-[9px] font-mono uppercase font-bold rounded-[2px]">
                SIMULATED DATA
              </span>
            )}
            <span className="px-1.5 py-0.5 bg-[#0B1F3A] text-white text-[9px] font-mono uppercase font-bold rounded-[2px]">
              AUDITED
            </span>
          </div>
        </div>

        {filename && (
          <div className="flex items-center justify-between text-[11px] font-mono text-[#5C6670]">
            <span>FILE: <strong className="text-[#0B1F3A]">{filename}</strong></span>
            <span>ROWS: <strong className="text-[#0B1F3A]">{rowCount.toLocaleString()}</strong></span>
          </div>
        )}

        {hash && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#5C6670]">
              <span>SHA-256 FINGERPRINT:</span>
              <button
                type="button"
                onClick={copyHash}
                className="text-[10px] font-mono text-[#0B1F3A] hover:underline cursor-pointer flex items-center gap-1"
                title="Copy complete SHA-256 hash"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-[#138808]" />
                    <span className="text-[#138808] font-bold">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>COPY HASH</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-1.5 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] font-mono text-[10px] text-[#1A1A1A] break-all select-all">
              {hash}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === 'error') {
    let errorDetail = 'Validation rejected: Required schema constraints not satisfied.';
    let missingCols: string[] = [];

    if (error && typeof error === 'object') {
      if ('error' in error) errorDetail = error.error;
      if ('missing_columns' in error && Array.isArray(error.missing_columns)) {
        missingCols = error.missing_columns;
      }
    } else if (typeof error === 'string') {
      errorDetail = error;
    }

    const isConnectionError =
      errorDetail.toLowerCase().includes('backend') ||
      errorDetail.toLowerCase().includes('connect') ||
      errorDetail.toLowerCase().includes('render') ||
      errorDetail.toLowerCase().includes('html') ||
      errorDetail.toLowerCase().includes('failed to fetch') ||
      errorDetail.toLowerCase().includes('timed out');

    return (
      <div className="p-3.5 bg-[#FFFFFF] border-2 border-[#8A1538] rounded-[2px] text-[#1A1A1A] space-y-2">
        <div className="flex items-center justify-between border-b border-[#8A1538]/20 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8A1538] inline-block" />
            <span className="text-[11px] font-mono font-bold text-[#8A1538] uppercase tracking-wider">
              {isConnectionError ? '// BACKEND CONNECTION REQUIRED' : '// VALIDATION REJECTED'}
            </span>
          </div>
          <span className="px-1.5 py-0.5 bg-[#8A1538] text-white text-[9px] font-mono uppercase font-bold rounded-[2px]">
            {isConnectionError ? 'API OFFLINE' : 'SCHEMA ERROR'}
          </span>
        </div>

        <p className="text-xs text-[#8A1538] font-sans leading-tight">{errorDetail}</p>

        {isConnectionError && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('terra-trace-open-backend-modal'))}
              className="px-3 py-1.5 bg-[#0B1F3A] text-white rounded-[2px] font-mono text-[11px] font-bold uppercase tracking-wider hover:bg-[#0B1F3A]/90 cursor-pointer flex items-center gap-1.5 border border-[#0B1F3A]"
            >
              <span>Set / Test Backend API URL</span>
              <span>⚙</span>
            </button>
          </div>
        )}

        {missingCols.length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="text-[10px] font-mono text-[#8A1538] font-bold">
              MISSING COLUMNS:
            </div>
            <div className="flex flex-wrap gap-1">
              {missingCols.map((col) => (
                <span
                  key={col}
                  className="px-1.5 py-0.5 rounded-[2px] bg-[#8A1538] text-white font-mono text-[10px]"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Idle state
  return (
    <div className="p-3 bg-[#F7F5F0] border border-dashed border-[#5C6670] rounded-[2px] flex items-center justify-between text-[#5C6670]">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#5C6670] inline-block" />
        <span className="text-[11px] font-mono uppercase">
          // STATUS: AWAITING UPLOAD
        </span>
      </div>
      <span className="text-[10px] font-mono">0 ROWS COMMITTED</span>
    </div>
  );
};
