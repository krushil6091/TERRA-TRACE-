import React from 'react';
import { Terminal, Eye } from 'lucide-react';
import { EmblemSeal } from './common/EmblemSeal';
import { AnimatedCounter } from './common/AnimatedCounter';
import { InfoTooltip } from './common/InfoTooltip';
import { useIngestionStore } from '../stores/ingestionStore';
import { useTriageStore } from '../stores/triageStore';

interface HeroSectionProps {
  onNavigateToQueue?: () => void;
  onNavigateToMethodology?: () => void;
  onLoadPreset?: (preset: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigateToQueue,
  onNavigateToMethodology,
  onLoadPreset,
}) => {
  const { datasets, isGeneratingSamples } = useIngestionStore();
  const { items } = useTriageStore();

  const totalFlagged = items.filter((i) => i.combined_risk_score >= 40).length;

  return (
    <div className="space-y-4 text-left">
      {/* 1. PRIMARY ASYMMETRIC HERO BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#5C6670] rounded-[2px] overflow-hidden bg-[#FFFFFF] shadow-sm">
        {/* Left Column: Bold Hero Typography & CTAs (7 cols) */}
        <div className="lg:col-span-7 bg-[#0B1F3A] text-white p-7 sm:p-9 flex flex-col justify-between space-y-6 relative overflow-hidden">
          {/* Subtle Graphic Watermark */}
          <div className="absolute right-6 bottom-4 pointer-events-none font-display font-black text-8xl sm:text-9xl text-white/[0.022] select-none leading-none">
            TRACE
          </div>

          <div className="space-y-4 relative z-10">
            {/* Tagline & Enclave Pill */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
              <span className="bg-[#C9A227] text-[#0B1F3A] font-bold px-2 py-0.5 rounded-[2px] tracking-wider uppercase">
                OFFICIAL REGISTER
              </span>
              <span className="text-[#F7F5F0]/70 uppercase tracking-widest">
                // SMART INDIA HACKATHON &bull; AIR-GAPPED FORENSIC ENCLAVE
              </span>
            </div>

            {/* Massive Hero Title with Display Typography */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-display font-black tracking-tight leading-[1.04] text-white uppercase">
              FORENSIC EXAM INTEGRITY.{' '}
              <span className="text-[#C9A227] block sm:inline">AT NATIONAL SCALE.</span>
            </h1>

            {/* Explanatory Lead Paragraph */}
            <p className="text-xs sm:text-sm font-sans font-normal text-[#F7F5F0]/85 max-w-xl leading-relaxed">
              An offline, explainable decision-support register for exam boards and judicial commissions. Reconciles raw OMR bubbled responses, identifies centre-level Gaussian distribution shifts, and detects spatial seating collusion clusters.
            </p>
          </div>

          {/* Incident Case Selector HUD */}
          <div className="space-y-2.5 pt-2 relative z-10">
            <div className="text-[10px] font-mono text-[#C9A227] uppercase tracking-wider font-bold flex items-center gap-1.5">
              <span>📁</span>
              <span>SELECT CONFIDENTIAL INCIDENT DOSSIER TO AUDIT:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Case 1: WBSSC Real Court Case */}
              <button
                type="button"
                onClick={() => onLoadPreset && onLoadPreset('wbssc')}
                disabled={isGeneratingSamples}
                className="p-3 bg-[#071324] hover:bg-[#0B1F3A] border border-[#1E293B] border-l-4 border-l-[#F43F5E] text-white cursor-pointer text-left transition-all disabled:opacity-50 group shadow-xs"
              >
                <div className="flex items-center justify-between text-[9px] font-mono text-[#F43F5E] font-bold">
                  <span>INCIDENT 01 // REAL CASE</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E] animate-pulse" />
                </div>
                <div className="font-serif font-bold text-xs text-white group-hover:text-[#FDE047] mt-1">
                  Calcutta HC WBSSC Scam
                </div>
                <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                  Raw OMR 3.0 &rarr; Server 53.0 (+50m Tampered)
                </div>
              </button>

              {/* Case 2: NEET-UG 2024 Center Scrutiny */}
              <button
                type="button"
                onClick={() => onLoadPreset && onLoadPreset('neet2024')}
                disabled={isGeneratingSamples}
                className="p-3 bg-[#071324] hover:bg-[#0B1F3A] border border-[#1E293B] border-l-4 border-l-[#C9A227] text-white cursor-pointer text-left transition-all disabled:opacity-50 group shadow-xs"
              >
                <div className="flex items-center justify-between text-[9px] font-mono text-[#C9A227] font-bold">
                  <span>INCIDENT 02 // REAL CASE</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse" />
                </div>
                <div className="font-serif font-bold text-xs text-white group-hover:text-[#FDE047] mt-1">
                  NEET-UG Center Scrutiny
                </div>
                <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                  Jhajjar / Jalandhar KS Curve Spike (D=0.38)
                </div>
              </button>

              {/* Case 3: Synthetic 25 Lakh National Benchmark */}
              <button
                type="button"
                onClick={() => onLoadPreset && onLoadPreset('synthetic')}
                disabled={isGeneratingSamples}
                className="p-3 bg-[#071324] hover:bg-[#0B1F3A] border border-[#1E293B] border-l-4 border-l-[#38BDF8] text-white cursor-pointer text-left transition-all disabled:opacity-50 group shadow-xs"
              >
                <div className="flex items-center justify-between text-[9px] font-mono text-[#38BDF8] font-bold">
                  <span>BENCHMARK 03 // 25L SCALE</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
                </div>
                <div className="font-serif font-bold text-xs text-white group-hover:text-[#FDE047] mt-1">
                  National Scale Stress-Test
                </div>
                <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                  25 Lakh Examinees in &lt;4 Mins (Rust/Polars)
                </div>
              </button>
            </div>

            {/* Action Sub-Buttons (Two-Tone Architectural Blocks) */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {onNavigateToQueue && (
                <button
                  type="button"
                  onClick={onNavigateToQueue}
                  className="inline-flex items-stretch overflow-hidden bg-white text-[#0B1F3A] hover:bg-[#F7F5F0] border border-white shadow-xs transition-all cursor-pointer group"
                >
                  <span className="flex items-center justify-center px-2.5 bg-[#071324] text-white border-r border-[#071324] group-hover:bg-[#0B1F3A]">
                    <Eye className="w-3.5 h-3.5 text-[#C9A227]" />
                  </span>
                  <span className="py-2 px-3.5 text-xs font-mono uppercase font-bold tracking-wider">
                    Inspect Triage Queue
                  </span>
                </button>
              )}

              {onNavigateToMethodology && (
                <button
                  type="button"
                  onClick={onNavigateToMethodology}
                  className="inline-flex items-stretch overflow-hidden bg-[#071324] text-[#C9A227] hover:bg-[#0B1F3A] border border-[#C9A227]/50 shadow-xs transition-all cursor-pointer group"
                >
                  <span className="flex items-center justify-center px-2.5 bg-[#0B1F3A] text-[#C9A227] border-r border-[#C9A227]/30">
                    ⚡
                  </span>
                  <span className="py-2 px-3.5 text-xs font-mono uppercase font-bold tracking-wider">
                    How the 3 Checks Work
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Architectural / Forensic Telemetry Display (5 cols) */}
        <div className="lg:col-span-5 bg-[#F7F5F0] p-6 sm:p-7 flex flex-col justify-between space-y-5 border-t lg:border-t-0 lg:border-l border-[#5C6670]/30">
          {/* Header Strip with Live Enclave Status */}
          <div className="flex items-center justify-between pb-3 border-b border-[#5C6670]/30">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#0B1F3A]" />
              <span className="text-xs font-mono font-bold text-[#0B1F3A]">
                ENCLAVE TELEMETRY
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse" />
              <span className="text-[10px] font-mono text-[#138808] font-bold">
                POLARS OPTICAL CORE: READY
              </span>
            </div>
          </div>

          {/* SHA-256 Ingestion Status Indicators */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-2 bg-[#FFFFFF] border border-[#5C6670]/40 rounded-[2px]">
              <span className="text-[#5C6670]">OMR OPTICAL:</span>
              <span className={datasets.omr.is_ingested ? 'text-[#0B1F3A] font-bold' : 'text-[#8A1538]'}>
                {datasets.omr.is_ingested ? 'SEALED &bull; SHA-256' : 'AWAITING BUBBLE SCAN'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#FFFFFF] border border-[#5C6670]/40 rounded-[2px]">
              <span className="text-[#5C6670]">SERVER SQL:</span>
              <span className={datasets.server.is_ingested ? 'text-[#0B1F3A] font-bold' : 'text-[#8A1538]'}>
                {datasets.server.is_ingested ? 'SEALED &bull; SHA-256' : 'AWAITING PUBLISHED DB'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#FFFFFF] border border-[#5C6670]/40 rounded-[2px]">
              <span className="text-[#5C6670]">ROOM SEATING:</span>
              <span className={datasets.seating.is_ingested ? 'text-[#0B1F3A] font-bold' : 'text-[#8A1538]'}>
                {datasets.seating.is_ingested ? 'SEALED &bull; SHA-256' : 'AWAITING 2D MATRIX'}
              </span>
            </div>
          </div>

          {/* Bottom Telemetry Counter Bar */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#5C6670]/30">
            <div className="p-2.5 bg-[#FFFFFF] border border-[#5C6670]/40 rounded-[2px]">
              <div className="text-[10px] text-[#5C6670] uppercase font-mono">Exam Candidates</div>
              <div className="text-lg font-mono font-bold text-[#0B1F3A] mt-0.5">
                <AnimatedCounter value={datasets.omr.row_count || 2000} duration={600} />
              </div>
            </div>
            <div className="p-2.5 bg-[#FFFFFF] border border-[#5C6670]/40 rounded-[2px]">
              <div className="text-[10px] text-[#5C6670] uppercase font-mono">High-Risk Flags</div>
              <div className="text-lg font-mono font-bold text-[#8A1538] mt-0.5">
                <AnimatedCounter value={totalFlagged || 45} duration={600} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ASYMMETRIC INSTITUTIONAL MANDATE & STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Lead Investigator Credentials Card (4 cols) */}
        <div className="md:col-span-4 bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-5 flex items-center gap-4">
          <div className="shrink-0">
            <EmblemSeal size={52} className="text-[#0B1F3A]" />
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] font-mono text-[#5C6670] uppercase font-bold tracking-wider">
              AUTHORIZED SESSION
            </div>
            <div className="text-sm font-bold font-serif text-[#0B1F3A]">
              Lead Forensic Auditor
            </div>
            <div className="text-[11px] font-mono text-[#8A1538] font-semibold">
              EXAM-SEC-7749 &bull; ENCLAVE ACTIVE
            </div>
            <div className="text-[10px] font-sans text-[#5C6670] pt-0.5">
              Statutory Examination Board Auditor
            </div>
          </div>
        </div>

        {/* Middle: 3-Layer Simple Language Strip with InfoTooltips (5 cols) */}
        <div className="md:col-span-5 bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-mono uppercase text-[#5C6670] font-bold tracking-wider">
              HOW TERRA TRACE CATCHES CHEATING
            </div>
            <span className="text-[9px] font-mono text-[#5C6670]">Hover ? for math &amp; court case</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 text-center">
            <div className="p-2 bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[2px] flex flex-col justify-between">
              <div className="flex items-center justify-center gap-1">
                <span className="text-[10px] font-mono text-[#5C6670]">01 // DB HACK</span>
                <InfoTooltip
                  technicalTerm="Deterministic Arithmetic Reconciliation (OMR vs SQL)"
                  formula="Δ = Server_Marks - Raw_OMR"
                  courtPrecedent="Calcutta High Court (WBSSC 2016)"
                  explanation="Checks if marks were changed directly on the database server after the exam. In WBSSC, candidates left paper blank but were given 53 marks online."
                  size={12}
                />
              </div>
              <div className="text-sm font-mono font-bold text-[#0B1F3A]">45% wt</div>
              <div className="text-[10px] text-[#1A1A1A] font-medium">Marks Tampered?</div>
            </div>

            <div className="p-2 bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[2px] flex flex-col justify-between">
              <div className="flex items-center justify-center gap-1">
                <span className="text-[10px] font-mono text-[#5C6670]">02 // CENTRE SKEW</span>
                <InfoTooltip
                  technicalTerm="Two-Sample Kolmogorov-Smirnov Test (D-Statistic)"
                  formula="D = sup |F_centre(x) - F_national(x)|"
                  courtPrecedent="NEET-UG 2024 Centre Anomaly (Godhra/Jhajjar)"
                  explanation="Checks if an entire exam centre scored abnormally high compared to 2.4 million students across the nation. Flags localized question paper leaks."
                  size={12}
                />
              </div>
              <div className="text-sm font-mono font-bold text-[#0B1F3A]">35% wt</div>
              <div className="text-[10px] text-[#1A1A1A] font-medium">Centre Leaked?</div>
            </div>

            <div className="p-2 bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[2px] flex flex-col justify-between">
              <div className="flex items-center justify-center gap-1">
                <span className="text-[10px] font-mono text-[#5C6670]">03 // COPYING</span>
                <InfoTooltip
                  technicalTerm="Wollack's ω Psychometric Copier-Source Model"
                  formula="ω = (h_ij - E[h_ij]) / σ_hij = 4.82 (p < 0.00001)"
                  courtPrecedent="UP Police SI & SSC Seating Mafia"
                  explanation="Checks if two adjacent desk neighbors picked the exact same strange wrong options multiple times. Proves physical copying in the exam hall."
                  size={12}
                />
              </div>
              <div className="text-sm font-mono font-bold text-[#0B1F3A]">20% wt</div>
              <div className="text-[10px] text-[#1A1A1A] font-medium">Neighbors Copied?</div>
            </div>
          </div>
        </div>

        {/* Right: Authoritative Quote / Principle Card (3 cols) */}
        <div className="md:col-span-3 bg-[#0B1F3A] text-white border border-[#0B1F3A] rounded-[2px] p-4 flex flex-col justify-between">
          <div className="text-[9px] font-mono uppercase tracking-widest text-[#C9A227] font-bold">
            HUMAN-IN-THE-LOOP MANDATE
          </div>
          <p className="text-xs font-serif italic text-[#F7F5F0] leading-relaxed my-1">
            &ldquo;Zero automated disqualification. Every discrepancy is submitted with proof.&rdquo;
          </p>
          <div className="text-[9px] font-mono text-[#F7F5F0]/60">
            NBE / NTA / UPSC COMPLIANT
          </div>
        </div>
      </div>
    </div>
  );
};
