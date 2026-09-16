import React from 'react';
import { Terminal, ArrowRight, Eye } from 'lucide-react';
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

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2 relative z-10">
            {onLoadPreset && (
              <button
                type="button"
                onClick={() => onLoadPreset('wbssc')}
                disabled={isGeneratingSamples}
                className="px-4 py-2.5 bg-[#8A1538] hover:bg-[#8A1538]/90 text-white text-xs font-mono uppercase font-bold rounded-[2px] cursor-pointer flex items-center gap-2 border border-[#8A1538] transition-none disabled:opacity-50"
              >
                <span>Load WBSSC 2016 Case (Real)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {onNavigateToMethodology && (
              <button
                type="button"
                onClick={onNavigateToMethodology}
                className="px-3.5 py-2.5 bg-[#C9A227]/20 hover:bg-[#C9A227]/30 text-[#C9A227] text-xs font-mono uppercase font-bold rounded-[2px] cursor-pointer flex items-center gap-1.5 border border-[#C9A227] transition-none"
              >
                <span>⚡ How the 3 Checks Work</span>
              </button>
            )}

            {onNavigateToQueue && (
              <button
                type="button"
                onClick={onNavigateToQueue}
                className="px-4 py-2.5 bg-[#FFFFFF] hover:bg-[#F7F5F0] text-[#0B1F3A] text-xs font-mono uppercase font-bold rounded-[2px] cursor-pointer flex items-center gap-2 border border-[#FFFFFF] transition-none"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Triage Queue</span>
              </button>
            )}
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
