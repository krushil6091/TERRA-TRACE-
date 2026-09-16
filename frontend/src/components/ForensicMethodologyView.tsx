import React, { useState } from 'react';
import {
  Layers,
  BarChart3,
  Grid,
  ShieldCheck,
  AlertTriangle,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  HelpCircle,
} from 'lucide-react';
import { WatermarkAnchor } from './common/WatermarkAnchor';
import { InfoTooltip } from './common/InfoTooltip';

type PresetMode = 'compromised' | 'clean';
type DisplayMode = 'unified' | 'cards' | 'ascii';

interface ForensicMethodologyViewProps {
  onBack?: () => void;
}

export const ForensicMethodologyView: React.FC<ForensicMethodologyViewProps> = ({ onBack }) => {
  const [preset, setPreset] = useState<PresetMode>('compromised');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('unified');
  const [copiedAscii, setCopiedAscii] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'all' | '1' | '2' | '3'>('all');

  // Dynamic parameters based on preset
  const isCompromised = preset === 'compromised';
  const delta = isCompromised ? 50.0 : 0.0;
  const rawScore = 3.0;
  const serverScore = isCompromised ? 53.0 : 3.0;
  const ksD = isCompromised ? 0.384 : 0.042;
  const ksPValue = isCompromised ? '< 10⁻¹²' : '0.482';
  const sharedWrong = isCompromised ? 17 : 2;
  const totalWrong = 20;
  const omegaScore = isCompromised ? 4.82 : 0.42;
  const omegaPValue = isCompromised ? '< 0.00001' : '0.674';
  const compositeRisk = isCompromised ? 91.5 : 8.2;

  const handleCopyAscii = () => {
    const text = `
       ┌──────────────────────────────────────────────┐
       │             RAW OMR SCANNER LOGS             │
       │  Q1: B (+4) | Q2: A (-1) | Q3: Blank (0) ... │
       └──────────────────────┬───────────────────────┘
                              │
                              ▼ (Recalculate with Answer Key)
                     ┌─────────────────┐
                     │ Raw Score: 3.0  │
                     └────────┬────────┘
                              │
                              ├──────────────────────────┐
                              │                          ▼
                              │               ┌───────────────────────┐
                              │               │ PUBLISHED SQL RESULTS │
                              │               │  Server Score: 53.0   │
                              │               └──────────┬────────────┘
                              │                          │
                              ▼                          ▼
                     ┌─────────────────────────────────────────┐
                     │    DISCREPANCY (Δ) = 53.0 - 3.0 = +50.0 │
                     │    STATUS: TAMPER DETECTED (ALERT!)     │
                     └─────────────────────────────────────────┘   

     Density ^
             │                  Centre Cohort Distribution (Compromised)
             │                     ┌─────────┐  (Narrow, unnaturally high scores)
             │                    ╱           ╲
             │                   ╱             ╲
             │    National      ╱               ╲
             │    Baseline     ╱                 ╲
             │    ┌───────┐   ╱                   ╲
             │   ╱         ╲ ╱                     ╲
             │  ╱           X                       ╲
             │ ╱           ╱ ╲                       ╲
             └─┴──────────┴───┴───────────────────────┴─────────> Score
               0          50  75                     180
                           ▲
                           │ Maximum Vertical Gap = KS-Statistic D

            EXAMINATION HALL (ROOM 101) - 2D SEATING MATRIX
                     ┌───────────┐    ┌───────────┐    ┌───────────┐
             Row 1   │  Seat 01  │    │  Seat 02  │    │  Seat 03  │
                     │ Score: 78 │    │ Score: 82 │    │ Score: 64 │
                     └───────────┘    └───────────┘    └───────────┘
                           │                │                │
                           ▼ (Distance = 1) ▼                ▼
                     ┌───────────┐    ┌───────────┐    ┌───────────┐
             Row 2   │  Seat 04  │◄──►│  Seat 05  │    │  Seat 06  │
                     │ CAND_004  │    │ CAND_005  │    │ Score: 71 │
                     │ Score: 142│    │ Score: 144│    │           │
                     └───────────┘    └───────────┘    └───────────┘
                           ▲                ▲
                           └────────────────┘
                    Shared Wrong Answers: 17 of 20
                    Wollack's ω Index = 4.82 (p < 0.00001)
                    PHYSICAL COLLUSION DETECTED!
    `;
    navigator.clipboard.writeText(text);
    setCopiedAscii(true);
    setTimeout(() => setCopiedAscii(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Return to Ingestion Header */}
      {onBack && (
        <div className="flex items-center justify-between pb-2 border-b border-[#5C6670]/20">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#5C6670] text-[#0B1F3A] hover:bg-[#F7F5F0] text-xs font-mono font-semibold rounded-[2px] cursor-pointer"
          >
            <span>&larr; Return to Ingestion Register</span>
          </button>
          <span className="text-[11px] font-mono text-[#5C6670]">
            PLAIN LANGUAGE FORENSIC GUIDE &bull; HOVER ? FOR FORMULAS
          </span>
        </div>
      )}

      {/* Top Banner Anchor */}
      <WatermarkAnchor
        number="02"
        tagline="FORENSIC METHODOLOGY // HOW THE 3 CHECKS WORK"
        title="How Terra Trace Catches Cheating: The 3 Core Checks"
        subtitle="Simple, plain-language checks that detect database mark tampering, center-level leaks, and room copying — backed by exact mathematical formulas when challenged in court."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {/* Preset Toggle */}
            <div className="inline-flex rounded-[2px] border border-[#5C6670] bg-[#FFFFFF] p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setPreset('compromised')}
                className={`px-3 py-1.5 rounded-[2px] transition-colors ${
                  isCompromised
                    ? 'bg-[#8A1538] text-white font-bold'
                    : 'text-[#5C6670] hover:text-[#1A1A1A]'
                }`}
              >
                Compromised Signal (Cheating)
              </button>
              <button
                type="button"
                onClick={() => setPreset('clean')}
                className={`px-3 py-1.5 rounded-[2px] transition-colors ${
                  !isCompromised
                    ? 'bg-[#0B1F3A] text-white font-bold'
                    : 'text-[#5C6670] hover:text-[#1A1A1A]'
                }`}
              >
                Clean Baseline (Honest)
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="inline-flex rounded-[2px] border border-[#5C6670] bg-[#FFFFFF] p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setDisplayMode('unified')}
                className={`px-2.5 py-1.5 rounded-[2px] ${
                  displayMode === 'unified' ? 'bg-[#0B1F3A] text-white font-bold' : 'text-[#5C6670]'
                }`}
              >
                Interactive Flow
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('cards')}
                className={`px-2.5 py-1.5 rounded-[2px] ${
                  displayMode === 'cards' ? 'bg-[#0B1F3A] text-white font-bold' : 'text-[#5C6670]'
                }`}
              >
                Technical Math
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('ascii')}
                className={`px-2.5 py-1.5 rounded-[2px] ${
                  displayMode === 'ascii' ? 'bg-[#0B1F3A] text-white font-bold' : 'text-[#5C6670]'
                }`}
              >
                ASCII Diagram
              </button>
            </div>
          </div>
        }
      />

      {/* Plain Language Explainer Notice */}
      <div className="bg-[#0B1F3A] text-white border-2 border-[#0B1F3A] rounded-[2px] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#138808] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#C9A227] font-bold">
              PLAIN LANGUAGE GUIDE // HOVER ON ANY &apos;?&apos; ICON FOR FORMULAS
            </span>
          </div>
          <p className="text-xs font-sans text-[#F7F5F0] leading-relaxed max-w-4xl">
            Everything below is explained in everyday English. Whenever you see a{' '}
            <span className="inline-flex items-center text-[#C9A227] font-bold">
              <HelpCircle className="w-3.5 h-3.5 inline mx-0.5" /> [?]
            </span>{' '}
            icon, hover on it to see the formal mathematical proof, Greek variables ($\Delta, D, \omega$), and High Court legal citations that satisfy technical evaluators.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-mono text-[#5C6670] uppercase">COMBINED RISK SCORE</div>
            <div className={`text-xl font-mono font-bold ${isCompromised ? 'text-[#8A1538]' : 'text-[#138808]'}`}>
              {compositeRisk.toFixed(1)} <span className="text-xs font-normal text-white/60">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODE 1: UNIFIED 3-LAYER VISUAL PIPELINE
      ══════════════════════════════════════════════════════════════════════ */}
      {(displayMode === 'unified' || displayMode === 'ascii') && (
        <div className="space-y-6">
          {/* Layer Filter Buttons */}
          <div className="flex items-center gap-2 border-b border-[#5C6670]/30 pb-3">
            <span className="text-xs font-mono uppercase text-[#5C6670] font-semibold">Filter Checks:</span>
            {[
              { id: 'all', label: 'All 3 Checks' },
              { id: '1', label: 'Check 1 (Database Tampering)' },
              { id: '2', label: 'Check 2 (Exam Centre Leak)' },
              { id: '3', label: 'Check 3 (Room Copying)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveLayer(tab.id as any)}
                className={`px-3 py-1 text-xs font-mono rounded-[2px] cursor-pointer transition-none ${
                  activeLayer === tab.id
                    ? 'bg-[#0B1F3A] text-white font-bold'
                    : 'bg-[#FFFFFF] border border-[#5C6670]/40 text-[#1A1A1A] hover:border-[#0B1F3A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ──────────────────────────────────────────────────────────────────
              CHECK 01: WERE MARKS CHANGED IN THE DATABASE?
          ────────────────────────────────────────────────────────────────── */}
          {(activeLayer === 'all' || activeLayer === '1') && (
            <div className="bg-[#FFFFFF] border-2 border-[#5C6670] rounded-[2px] p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#5C6670]/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#0B1F3A] text-white rounded-[2px]">
                    CHECK 01 // 45% WEIGHT
                  </span>
                  <Layers className="w-4 h-4 text-[#0B1F3A]" />
                  <h3 className="text-base font-bold text-[#0B1F3A] font-serif flex items-center gap-1.5">
                    <span>Were Marks Changed in the Database After the Exam?</span>
                    <InfoTooltip
                      technicalTerm="Deterministic Arithmetic Inversion (OMR vs SQL Re-scoring)"
                      formula="Δ = S_server - S_omr = 53.0 - 3.0 = +50.0"
                      courtPrecedent="Calcutta High Court (WBSSC 2016 Scandal)"
                      explanation="Recalculates the student's actual physical paper bubbles using the answer key, then subtracts from the marks published on the server. If Δ > 0, someone directly altered marks in the database."
                    />
                  </h3>
                </div>
                <div className="text-xs font-mono text-[#5C6670] flex items-center gap-1">
                  <span>Target: <strong>Database Injections (WBSSC Scandal)</strong></span>
                  <InfoTooltip
                    technicalTerm="WBSSC Calcutta High Court Case (2016)"
                    explanation="In the WBSSC scam, 8,000+ candidates submitted completely blank OMR sheets scoring 0 to 3 marks, but corrupt database administrators typed 53 marks directly into the server results table."
                    size={12}
                  />
                </div>
              </div>

              {/* Visual Flow Representation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Step 1: Raw OMR Box */}
                <div className="lg:col-span-4 bg-[#F7F5F0] border border-[#5C6670] rounded-[2px] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#0B1F3A] uppercase tracking-wider flex items-center gap-1">
                      <span>1. Candidate&apos;s Paper Sheet</span>
                      <InfoTooltip
                        technicalTerm="Raw Optical Mark Recognition (OMR) Scan"
                        formula="Score = 4 × Correct - 1 × Wrong"
                        explanation="Scanned directly from physical paper before anyone can touch the central website database."
                        size={12}
                      />
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#0B1F3A]/10 text-[#0B1F3A] rounded-[2px]">
                      PHYSICAL PAPER
                    </span>
                  </div>
                  <div className="bg-[#0B1F3A] text-[#F7F5F0] p-2.5 rounded-[2px] font-mono text-xs space-y-1">
                    <div className="text-[#C9A227]"># BUBBLES FILLED ON PAPER</div>
                    <div>Q01: B (+4) | Q02: A (-1)</div>
                    <div>Q03: Blank (0) | Q04: Blank (0)</div>
                    <div>Q05: C (-1) | Q06..Q50: Blank (0)</div>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-xs font-mono">
                    <span className="text-[#5C6670]">Real Score Earned:</span>
                    <strong className="text-[#0B1F3A] text-sm">{rawScore.toFixed(1)} / 200.0</strong>
                  </div>
                </div>

                {/* Arrow Connector */}
                <div className="lg:col-span-1 flex flex-col items-center justify-center text-[#5C6670]">
                  <ArrowRight className="w-5 h-5 hidden lg:block text-[#0B1F3A]" />
                  <span className="text-[10px] font-mono uppercase lg:hidden">&darr; COMPARE WITH</span>
                </div>

                {/* Step 2: Server SQL Box */}
                <div className="lg:col-span-3 bg-[#F7F5F0] border border-[#5C6670] rounded-[2px] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#0B1F3A] uppercase tracking-wider flex items-center gap-1">
                      <span>2. Marks Shown Online</span>
                      <InfoTooltip
                        technicalTerm="Published Server Database Score"
                        formula="SELECT final_score FROM published_results"
                        explanation="The score stored in the exam board's database and displayed on the student's marksheet."
                        size={12}
                      />
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#8A1538]/10 text-[#8A1538] rounded-[2px]">
                      WEBSITE DB
                    </span>
                  </div>
                  <div className="bg-[#FFFFFF] border border-[#5C6670]/40 p-2.5 rounded-[2px] font-mono text-xs space-y-1">
                    <div className="text-[#5C6670]">// server_database_entry</div>
                    <div>student_id: &quot;CAND_001_01_005&quot;</div>
                    <div className="font-bold text-[#0B1F3A]">published_score: {serverScore.toFixed(1)}</div>
                    <div className="text-[10px] text-[#5C6670]">updated: 2026-09-15T10:00Z</div>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-xs font-mono">
                    <span className="text-[#5C6670]">Score on Website:</span>
                    <strong className="text-[#0B1F3A] text-sm">{serverScore.toFixed(1)}</strong>
                  </div>
                </div>

                {/* Arrow Connector */}
                <div className="lg:col-span-1 flex flex-col items-center justify-center text-[#5C6670]">
                  <ArrowRight className="w-5 h-5 hidden lg:block text-[#0B1F3A]" />
                  <span className="text-[10px] font-mono uppercase lg:hidden">&darr; FIND DIFFERENCE</span>
                </div>

                {/* Step 3: Discrepancy & Status Alert */}
                <div className={`lg:col-span-3 border-2 rounded-[2px] p-4 space-y-2 ${
                  isCompromised ? 'bg-[#8A1538]/5 border-[#8A1538]' : 'bg-[#138808]/5 border-[#138808]'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                      <span>3. Secret Marks Added</span>
                      <InfoTooltip
                        technicalTerm="Arithmetic Difference (Δ)"
                        formula="Δ = Published - Paper"
                        courtPrecedent="Section 65B Indian Evidence Act"
                        explanation="In an honest exam, the difference must be exactly 0. Any extra marks added secretly trigger an automated tamper alarm."
                        size={12}
                      />
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 font-bold rounded-[2px] ${
                      isCompromised ? 'bg-[#8A1538] text-white' : 'bg-[#138808] text-white'
                    }`}>
                      {isCompromised ? 'TAMPER DETECTED' : 'CLEAN MATCH'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FFFFFF] border border-[#5C6670]/30 rounded-[2px] font-mono text-xs">
                    <div className="text-[#5C6670]">Extra Marks = Website - Paper</div>
                    <div className="text-base font-bold mt-1 text-[#0B1F3A]">
                      Difference = {serverScore.toFixed(1)} - {rawScore.toFixed(1)} = <span className={isCompromised ? 'text-[#8A1538]' : 'text-[#138808]'}>+{delta.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="text-[11px] font-sans pt-1">
                    {isCompromised ? (
                      <span className="text-[#8A1538] font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        ALERT: +50 EXTRA MARKS ADDED SECRETLY!
                      </span>
                    ) : (
                      <span className="text-[#138808] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        CLEAN: PAPER &amp; WEBSITE MATCH 100%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Simple Explainer Strip */}
              <div className="p-3.5 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-sans text-[#1A1A1A]">
                <div>
                  <strong>Why this matters:</strong> If a student only answered 2 questions on paper, but their online result says 53 marks, someone with database access cheated.
                </div>
                <div className="shrink-0 flex items-center gap-1 text-[11px] font-mono text-[#5C6670]">
                  <span>Exact Math: Δ = S_server - S_omr</span>
                  <InfoTooltip
                    technicalTerm="Reconciliation Math Formula"
                    formula="Risk_rec = min(100, (|Δ| / 1.0) × 100)"
                    explanation="Any difference greater than 1.0 mark immediately sets the reconciliation risk score to 100%."
                    size={13}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              CHECK 02: DID AN ENTIRE EXAM CENTRE SCORE ABNORMALLY HIGH?
          ────────────────────────────────────────────────────────────────── */}
          {(activeLayer === 'all' || activeLayer === '2') && (
            <div className="bg-[#FFFFFF] border-2 border-[#5C6670] rounded-[2px] p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#5C6670]/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#0B1F3A] text-white rounded-[2px]">
                    CHECK 02 // 35% WEIGHT
                  </span>
                  <BarChart3 className="w-4 h-4 text-[#0B1F3A]" />
                  <h3 className="text-base font-bold text-[#0B1F3A] font-serif flex items-center gap-1.5">
                    <span>Did an Entire Exam Centre Score Abnormally High?</span>
                    <InfoTooltip
                      technicalTerm="Two-Sample Kolmogorov-Smirnov Test (D-Statistic)"
                      formula="D = sup |F_centre(x) - F_national(x)| = 0.384 (p < 10⁻¹²)"
                      courtPrecedent="NEET-UG 2024 Centre Cluster Anomaly (Oasis School & Jhajjar)"
                      explanation="Compares all students at this single school against 2.4 million students across the entire country. If one school has an unnatural clump of top scores, it mathematically proves a localized paper leak."
                    />
                  </h3>
                </div>
                <div className="text-xs font-mono text-[#5C6670] flex items-center gap-1">
                  <span>Target: <strong>Centre Paper Leaks (NEET 2024)</strong></span>
                  <InfoTooltip
                    technicalTerm="NEET 2024 Centre Skew Precedent"
                    explanation="In NEET 2024, centers like Oasis School (Hazaribagh) and Hardayal Public School produced dozens of 720/720 scores. The Kolmogorov-Smirnov test proves this could not occur by chance."
                    size={12}
                  />
                </div>
              </div>

              {/* Graphic Chart + Explanatory Text */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Visual SVG Curve */}
                <div className="lg:col-span-7 bg-[#F7F5F0] border border-[#5C6670] rounded-[2px] p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono pb-1 border-b border-[#5C6670]/30">
                    <span className="font-bold text-[#0B1F3A] flex items-center gap-1">
                      <span>This School&apos;s Marks vs Whole Country</span>
                      <InfoTooltip
                        technicalTerm="Empirical Probability Density Function"
                        explanation="The blue dotted line is the normal bell curve for all 2.4 million Indian students. The red curve shows this specific suspicious school."
                        size={12}
                      />
                    </span>
                    <span className="text-[10px] text-[#5C6670]">2,400,000 National Baseline</span>
                  </div>

                  {/* SVG Chart */}
                  <div className="relative h-60 w-full bg-[#FFFFFF] border border-[#5C6670]/30 rounded-[2px] p-2 flex items-center justify-center">
                    <svg viewBox="0 0 500 220" className="w-full h-full">
                      {/* Grid Lines */}
                      <line x1="50" y1="190" x2="480" y2="190" stroke="#5C6670" strokeWidth="1.5" />
                      <line x1="50" y1="20" x2="50" y2="190" stroke="#5C6670" strokeWidth="1.5" />

                      {/* X-axis tick labels */}
                      <text x="50" y="205" fontSize="10" fontFamily="monospace" fill="#5C6670" textAnchor="middle">0</text>
                      <text x="170" y="205" fontSize="10" fontFamily="monospace" fill="#5C6670" textAnchor="middle">50</text>
                      <text x="250" y="205" fontSize="10" fontFamily="monospace" fill="#5C6670" textAnchor="middle">75</text>
                      <text x="360" y="205" fontSize="10" fontFamily="monospace" fill="#5C6670" textAnchor="middle">140</text>
                      <text x="450" y="205" fontSize="10" fontFamily="monospace" fill="#5C6670" textAnchor="middle">180</text>
                      <text x="475" y="205" fontSize="10" fontFamily="monospace" fill="#0B1F3A" fontWeight="bold">Score &gt;</text>

                      {/* Y-axis label */}
                      <text x="20" y="25" fontSize="10" fontFamily="monospace" fill="#0B1F3A" fontWeight="bold">Number of Students ^</text>

                      {/* National Baseline Curve (Broad Gaussian) */}
                      <path
                        d="M 50,188 Q 120,185 150,140 Q 180,50 200,50 Q 230,50 260,140 Q 300,185 450,189"
                        fill="none"
                        stroke="#0B1F3A"
                        strokeWidth="2"
                        strokeDasharray="4,2"
                      />
                      <text x="140" y="40" fontSize="10" fontFamily="sans-serif" fill="#0B1F3A" fontWeight="bold">
                        Entire Country (Normal Curve)
                      </text>

                      {/* Centre Cohort Distribution Curve */}
                      {isCompromised ? (
                        <>
                          {/* Compromised Curve: Spike at 145 */}
                          <path
                            d="M 120,188 Q 260,185 320,140 Q 360,20 380,20 Q 400,20 430,130 Q 450,180 470,189"
                            fill="rgba(138, 21, 56, 0.15)"
                            stroke="#8A1538"
                            strokeWidth="2.5"
                          />
                          <text x="310" y="15" fontSize="10" fontFamily="sans-serif" fill="#8A1538" fontWeight="bold">
                            This Centre (Unnatural High-Score Spike)
                          </text>

                          {/* Maximum Gap Marker */}
                          <line x1="270" y1="55" x2="270" y2="185" stroke="#C9A227" strokeWidth="2" strokeDasharray="3,3" />
                          <circle cx="270" cy="55" r="4" fill="#C9A227" />
                          <circle cx="270" cy="185" r="4" fill="#C9A227" />
                          <rect x="275" y="100" width="170" height="32" fill="#0B1F3A" rx="2" />
                          <text x="282" y="114" fontSize="9.5" fontFamily="monospace" fill="#FFFFFF" fontWeight="bold">
                            Unnatural Score Gap:
                          </text>
                          <text x="282" y="126" fontSize="9.5" fontFamily="monospace" fill="#C9A227" fontWeight="bold">
                            Gap D = {ksD.toFixed(3)} (p {ksPValue})
                          </text>
                        </>
                      ) : (
                        <>
                          {/* Clean Baseline Curve */}
                          <path
                            d="M 50,188 Q 120,185 152,138 Q 182,52 202,52 Q 232,52 262,138 Q 302,185 450,189"
                            fill="rgba(19, 136, 8, 0.15)"
                            stroke="#138808"
                            strokeWidth="2"
                          />
                          <text x="240" y="30" fontSize="10" fontFamily="sans-serif" fill="#138808" fontWeight="bold">
                            This Centre (Normal Honest Distribution)
                          </text>
                        </>
                      )}
                    </svg>
                  </div>
                </div>

                {/* Plain-Language Explanation Cards */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="bg-[#F7F5F0] border border-[#5C6670] rounded-[2px] p-4 space-y-2">
                    <div className="text-[11px] font-mono font-bold text-[#0B1F3A] uppercase tracking-wider flex items-center justify-between">
                      <span>Center-Wide Cheat Check</span>
                      <InfoTooltip
                        technicalTerm="Kolmogorov-Smirnov Statistic"
                        formula="D = sup |F_centre - F_national|"
                        explanation="Measures the maximum vertical distance between the two probability curves to ensure fairness."
                        size={12}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                      <div className="bg-[#FFFFFF] p-2 border border-[#5C6670]/20 rounded-[2px]">
                        <span className="text-[#5C6670] text-[10px] block">Abnormal Gap:</span>
                        <strong className={`text-sm ${isCompromised ? 'text-[#8A1538]' : 'text-[#138808]'}`}>
                          {ksD.toFixed(3)}
                        </strong>
                      </div>
                      <div className="bg-[#FFFFFF] p-2 border border-[#5C6670]/20 rounded-[2px]">
                        <span className="text-[#5C6670] text-[10px] block">Odds of Coincidence:</span>
                        <strong className="text-sm text-[#0B1F3A]">
                          {isCompromised ? 'Less than 1 in 1 Trillion' : 'Normal Variation'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FFFFFF] border border-[#5C6670]/30 rounded-[2px] text-xs font-sans text-[#1A1A1A] leading-relaxed">
                    <strong>What this checks in plain English:</strong> A few smart students can score high at any school. But if 50 students in the same building all get 170+ marks when the national average is 68, the exam paper was leaked locally before the test.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              CHECK 03: DID DESK NEIGHBORS COPY FROM EACH OTHER?
          ────────────────────────────────────────────────────────────────── */}
          {(activeLayer === 'all' || activeLayer === '3') && (
            <div className="bg-[#FFFFFF] border-2 border-[#5C6670] rounded-[2px] p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#5C6670]/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#0B1F3A] text-white rounded-[2px]">
                    CHECK 03 // 20% WEIGHT
                  </span>
                  <Grid className="w-4 h-4 text-[#0B1F3A]" />
                  <h3 className="text-base font-bold text-[#0B1F3A] font-serif flex items-center gap-1.5">
                    <span>Did Desk Neighbors Copy Answers from Each Other?</span>
                    <InfoTooltip
                      technicalTerm="Wollack's ω Psychometric Copier-Source Model"
                      formula="ω = (h_ij - E[h_ij]) / σ(h_ij) = 4.82 (p < 0.00001)"
                      courtPrecedent="UP Police SI & SSC Seating Collusion Rings"
                      explanation="Counts how many identical WRONG answers two neighbors shared. Honest smart students get the right answers, but two students choosing the exact same bizarre mistake 17 times proves copying."
                    />
                  </h3>
                </div>
                <div className="text-xs font-mono text-[#5C6670] flex items-center gap-1">
                  <span>Target: <strong>Hall Copying (UP Police SI Mafia)</strong></span>
                  <InfoTooltip
                    technicalTerm="UP Police SI Seating Ring Precedent"
                    explanation="In UP SI exams, solver syndicates bribed center coordinators to seat a paid solver directly beside a paying candidate. Wollack's formula detects this even when both students deny it."
                    size={12}
                  />
                </div>
              </div>

              {/* 2D Examination Room Seating Plan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold text-[#0B1F3A] uppercase tracking-wider flex items-center gap-1">
                    <span>Exam Room Seating Plan (Room 101)</span>
                    <InfoTooltip
                      technicalTerm="Spatial Seating Distance Constraint"
                      formula="Euclidean Distance ≤ 1.5 meters"
                      explanation="Only checks candidates who were physically seated close enough to see each other's papers."
                      size={12}
                    />
                  </h4>
                  <span className="text-[10px] font-mono text-[#5C6670]">
                    Row Spacing: 1.2m &bull; Desk Spacing: 1.0m
                  </span>
                </div>

                <div className="p-5 bg-[#F7F5F0] border border-[#5C6670] rounded-[2px] space-y-4">
                  {/* Row 1 */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#5C6670] font-bold">ROW 01 (NORMAL STUDENTS)</div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {[
                        { seat: 'Seat 01', score: 78, cand: 'CAND_001' },
                        { seat: 'Seat 02', score: 82, cand: 'CAND_002' },
                        { seat: 'Seat 03', score: 64, cand: 'CAND_003' },
                        { seat: 'Seat 04 (Empty)', score: 0, cand: 'EMPTY' },
                        { seat: 'Seat 05', score: 89, cand: 'CAND_004' },
                        { seat: 'Seat 06', score: 74, cand: 'CAND_005' },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-[#FFFFFF] border border-[#5C6670]/40 rounded-[2px] text-center font-mono"
                        >
                          <div className="text-[10px] text-[#5C6670]">{item.seat}</div>
                          <div className="text-xs font-bold text-[#0B1F3A]">{item.score > 0 ? `Score: ${item.score}` : 'VACANT'}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Row 2: Contains Collusion Pair */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#5C6670] font-bold">ROW 02 (SUSPICIOUS COPIER ROW)</div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {/* Seat 01 */}
                      <div className="p-2.5 bg-[#FFFFFF] border border-[#5C6670]/40 rounded-[2px] text-center font-mono">
                        <div className="text-[10px] text-[#5C6670]">Seat 01</div>
                        <div className="text-xs font-bold text-[#0B1F3A]">Score: 69</div>
                      </div>

                      {/* Seat 02 */}
                      <div className="p-2.5 bg-[#FFFFFF] border border-[#5C6670]/40 rounded-[2px] text-center font-mono">
                        <div className="text-[10px] text-[#5C6670]">Seat 02</div>
                        <div className="text-xs font-bold text-[#0B1F3A]">Score: 72</div>
                      </div>

                      {/* Seat 03 */}
                      <div className="p-2.5 bg-[#FFFFFF] border border-[#5C6670]/40 rounded-[2px] text-center font-mono">
                        <div className="text-[10px] text-[#5C6670]">Seat 03</div>
                        <div className="text-xs font-bold text-[#0B1F3A]">Score: 81</div>
                      </div>

                      {/* Collusion Pair: Seat 04 & Seat 05 */}
                      <div className={`p-2.5 rounded-[2px] text-center font-mono border-2 transition-all ${
                        isCompromised
                          ? 'bg-[#8A1538]/10 border-[#8A1538] shadow-sm'
                          : 'bg-[#FFFFFF] border-[#5C6670]/40'
                      }`}>
                        <div className="text-[10px] font-bold text-[#8A1538]">Seat 04 (Copier)</div>
                        <div className="text-xs font-bold text-[#0B1F3A]">CAND_004</div>
                        <div className="text-xs text-[#8A1538] font-bold">Score: 142</div>
                      </div>

                      <div className={`p-2.5 rounded-[2px] text-center font-mono border-2 transition-all ${
                        isCompromised
                          ? 'bg-[#8A1538]/10 border-[#8A1538] shadow-sm'
                          : 'bg-[#FFFFFF] border-[#5C6670]/40'
                      }`}>
                        <div className="text-[10px] font-bold text-[#8A1538]">Seat 05 (Source)</div>
                        <div className="text-xs font-bold text-[#0B1F3A]">CAND_005</div>
                        <div className="text-xs text-[#8A1538] font-bold">Score: 144</div>
                      </div>

                      {/* Seat 06 */}
                      <div className="p-2.5 bg-[#FFFFFF] border border-[#5C6670]/40 rounded-[2px] text-center font-mono">
                        <div className="text-[10px] text-[#5C6670]">Seat 06</div>
                        <div className="text-xs font-bold text-[#0B1F3A]">Score: 71</div>
                      </div>
                    </div>
                  </div>

                  {/* Physical Collusion Banner Between Seat 04 & Seat 05 */}
                  {isCompromised ? (
                    <div className="p-3 bg-[#FFFFFF] border-2 border-[#8A1538] rounded-[2px] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-[#8A1538] font-bold">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>COPYING DETECTED: SEAT 04 &larr;&rarr; SEAT 05 (Desk Distance = 1.0m)</span>
                        </div>
                        <div className="text-[#1A1A1A] text-[11px]">
                          Identical Mistakes: <strong>{sharedWrong} of {totalWrong} wrong answers shared</strong> (Normal random students share fewer than 2)
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-2">
                        <div>
                          <span className="text-[10px] text-[#5C6670] uppercase block">COPYING INDEX (ω)</span>
                          <strong className="text-base text-[#8A1538] font-bold">&omega; = {omegaScore.toFixed(2)} (p {omegaPValue})</strong>
                        </div>
                        <InfoTooltip
                          technicalTerm="Wollack's ω Index Calculation"
                          formula="ω = (17 - 1.8) / 3.15 = 4.82 (p < 0.00001)"
                          explanation="An omega score above 3.0 proves that the two neighbors did not work independently. When omega is 4.82, the probability of honest coincidence is less than 1 in 100,000."
                          size={14}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#FFFFFF] border border-[#138808] rounded-[2px] flex items-center justify-between text-xs font-mono text-[#138808]">
                      <span>No adjacent seating copying detected (All neighbors have normal independent errors).</span>
                      <strong className="text-[#138808]">&omega; = {omegaScore.toFixed(2)} (p {omegaPValue})</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Simple Explainer Strip */}
              <div className="p-3.5 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-sans text-[#1A1A1A]">
                <div>
                  <strong>Why this matters:</strong> Honest smart kids might get the same questions right. But when two desk neighbors pick the exact same strange wrong option 17 times in a row, they copied.
                </div>
                <div className="shrink-0 flex items-center gap-1 text-[11px] font-mono text-[#5C6670]">
                  <span>Psychometric Proof: p &lt; 0.00001</span>
                  <InfoTooltip
                    technicalTerm="Psychometric Bivariate Error Model"
                    formula="E[h_ij] = Σ P(wrong choice match | ability θ, difficulty b)"
                    explanation="Wollack's model accounts for question difficulty and student ability before declaring copying."
                    size={13}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              LAYER 04: OVERALL DECISION: HAND EVIDENCE TO HUMAN OFFICER
          ────────────────────────────────────────────────────────────────── */}
          <div className="bg-[#FFFFFF] border-2 border-[#0B1F3A] rounded-[2px] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#0B1F3A]/20 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0B1F3A]" />
                <h3 className="text-sm font-mono font-bold text-[#0B1F3A] uppercase tracking-wider flex items-center gap-1.5">
                  <span>Overall Decision: Hand All Evidence to Human Officer</span>
                  <InfoTooltip
                    technicalTerm="Human-in-the-Loop Adjudication Protocol"
                    formula="Risk = (0.45 × Check1) + (0.35 × Check2) + (0.20 × Check3)"
                    courtPrecedent="Section 65B Indian Evidence Act 1872"
                    explanation="Terra Trace NEVER automatically disqualifies a student. It calculates an explainable risk score and prepares a court-admissible PDF dossier for human investigators."
                  />
                </h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 bg-[#0B1F3A] text-white font-bold rounded-[2px]">
                NO AUTOMATED DISQUALIFICATION
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] space-y-1 font-mono text-xs">
                <span className="text-[#5C6670] text-[10px]">CHECK 1 (45% WEIGHT)</span>
                <div className="font-bold text-[#0B1F3A]">Database Tampering</div>
                <div className="text-sm text-[#8A1538] font-bold">
                  {isCompromised ? '100.0 / 100 (ALTERED)' : '0.0 / 100 (CLEAN)'}
                </div>
              </div>

              <div className="p-3 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] space-y-1 font-mono text-xs">
                <span className="text-[#5C6670] text-[10px]">CHECK 2 (35% WEIGHT)</span>
                <div className="font-bold text-[#0B1F3A]">Exam Centre Paper Leak</div>
                <div className="text-sm text-[#8A1538] font-bold">
                  {isCompromised ? '87.4 / 100 (ABNORMAL)' : '10.5 / 100 (NORMAL)'}
                </div>
              </div>

              <div className="p-3 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] space-y-1 font-mono text-xs">
                <span className="text-[#5C6670] text-[10px]">CHECK 3 (20% WEIGHT)</span>
                <div className="font-bold text-[#0B1F3A]">Desk Neighbor Copying</div>
                <div className="text-sm text-[#8A1538] font-bold">
                  {isCompromised ? '96.4 / 100 (COPIED)' : '8.4 / 100 (HONEST)'}
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[2px] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              <div>
                <span className="text-[#5C6670]">ACTION: </span>
                <strong className={isCompromised ? 'text-[#8A1538]' : 'text-[#138808]'}>
                  {isCompromised
                    ? 'SEND TO INVESTIGATOR WITH SECTION 65B EVIDENCE DOSSIER'
                    : 'AUTOMATICALLY CLEARED &bull; RESULT VERIFIED HONEST'}
                </strong>
              </div>
              <div className="text-[#5C6670] text-[11px]">
                Legal Certificate: Section 65B Indian Evidence Act / Section 63 BSA 2023
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODE 2: RETRO VT100 / BRUTALIST ASCII TERMINAL BLUEPRINT
      ══════════════════════════════════════════════════════════════════════ */}
      {(displayMode === 'ascii' || displayMode === 'cards') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#0B1F3A] font-bold uppercase">
              <Terminal className="w-4 h-4 text-[#0B1F3A]" />
              Courtroom-Ready ASCII Schematic &bull; Copyable for Presentation Slides
            </div>
            <button
              type="button"
              onClick={handleCopyAscii}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#0B1F3A] text-white text-xs font-mono rounded-[2px] cursor-pointer hover:bg-[#0B1F3A]/90"
            >
              {copiedAscii ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#138808]" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy ASCII Diagram</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-[#0B1F3A] text-[#F7F5F0] p-6 rounded-[2px] border-2 border-[#0B1F3A] overflow-x-auto">
            <pre className="font-mono text-xs sm:text-[13px] leading-relaxed select-all text-[#C9A227]">
{`       ┌──────────────────────────────────────────────┐
 │             RAW OMR SCANNER LOGS             │
 │  Q1: B (+4) | Q2: A (-1) | Q3: Blank (0) ... │
 └──────────────────────┬───────────────────────┘
                        │
                        ▼ (Recalculate with Answer Key)
               ┌─────────────────┐
               │ Raw Score: 3.0  │
               └────────┬────────┘
                        │
                        ├──────────────────────────┐
                        │                          ▼
                        │               ┌───────────────────────┐
                        │               │ PUBLISHED SQL RESULTS │
                        │               │  Server Score: 53.0   │
                        │               └──────────┬────────────┘
                        │                          │
                        ▼                          ▼
               ┌─────────────────────────────────────────┐
               │    DISCREPANCY (Δ) = 53.0 - 3.0 = +50.0  │
               │    STATUS: TAMPER DETECTED (ALERT!)     │
               └─────────────────────────────────────────┘   

     Density ^
             │                  Centre Cohort Distribution (Compromised)
             │                     ┌─────────┐  (Narrow, unnaturally high scores)
             │                    ╱           ╲
             │                   ╱             ╲
             │    National      ╱               ╲
             │    Baseline     ╱                 ╲
             │    ┌───────┐   ╱                   ╲
             │   ╱         ╲ ╱                     ╲
             │  ╱           X                       ╲
             │ ╱           ╱ ╲                       ╲
             └─┴──────────┴───┴───────────────────────┴─────────> Score
               0          50  75                     180
                           ▲
                           │ Maximum Vertical Gap = KS-Statistic D

            EXAMINATION HALL (ROOM 101) - 2D SEATING MATRIX
                     ┌───────────┐    ┌───────────┐    ┌───────────┐
             Row 1   │  Seat 01  │    │  Seat 02  │    │  Seat 03  │
                     │ Score: 78 │    │ Score: 82 │    │ Score: 64 │
                     └───────────┘    └───────────┘    └───────────┘
                           │                │                │
                           ▼ (Distance = 1) ▼                ▼
                     ┌───────────┐    ┌───────────┐    ┌───────────┐
             Row 2   │  Seat 04  │◄──►│  Seat 05  │    │  Seat 06  │
                     │ CAND_004  │    │ CAND_005  │    │ Score: 71 │
                     │ Score: 142│    │ Score: 144│    │           │
                     └───────────┘    └───────────┘    └───────────┘
                           ▲                ▲
                           └────────────────┘
                    Shared Wrong Answers: 17 of 20
                    Wollack's ω Index = 4.82 (p < 0.00001)
                    PHYSICAL COLLUSION DETECTED!`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
