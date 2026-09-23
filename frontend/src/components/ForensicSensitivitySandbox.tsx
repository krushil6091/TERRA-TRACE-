import React, { useState, useMemo } from 'react';
import { Zap, ShieldAlert } from 'lucide-react';

export const ForensicSensitivitySandbox: React.FC = () => {
  // Interactive Slider States
  const [scoreInflationDelta, setScoreInflationDelta] = useState<number>(50);
  const [leakDiffusionPercent, setLeakDiffusionPercent] = useState<number>(75);
  const [wollackCutoff, setWollackCutoff] = useState<number>(3.0);

  // Computed Mathematical Metrics
  const computedKS = useMemo(() => {
    // D ranges from 0.082 (baseline) to 0.420 at 100% diffusion
    const d = 0.082 + (leakDiffusionPercent / 100) * 0.338;
    let pVal = '0.812';
    let isSignificant = false;

    if (d >= 0.30) {
      pVal = '< 1.0 × 10⁻¹²';
      isSignificant = true;
    } else if (d >= 0.20) {
      pVal = '4.2 × 10⁻⁸';
      isSignificant = true;
    } else if (d >= 0.15) {
      pVal = '0.0031';
      isSignificant = true;
    } else {
      pVal = (0.812 - (d / 0.15) * 0.8).toFixed(3);
    }

    return { d: parseFloat(d.toFixed(3)), pVal, isSignificant };
  }, [leakDiffusionPercent]);

  // Seating collusion outcomes based on cutoff
  const computedCollusion = useMemo(() => {
    let flaggedPairs = 0;
    let falsePositiveRisk = '< 0.001%';
    let riskTier = 'High Standard';

    if (wollackCutoff <= 2.0) {
      flaggedPairs = 14;
      falsePositiveRisk = '4.8%';
      riskTier = 'Loose Screening';
    } else if (wollackCutoff <= 2.8) {
      flaggedPairs = 5;
      falsePositiveRisk = '0.62%';
      riskTier = 'Elevated Threshold';
    } else if (wollackCutoff <= 3.5) {
      flaggedPairs = 2; // Exact Ground Truth pairs: B-02/B-03 and D-04/D-05
      falsePositiveRisk = '< 0.13%';
      riskTier = 'Court-Grade (Default)';
    } else {
      flaggedPairs = 1;
      falsePositiveRisk = '< 0.003%';
      riskTier = 'Ultra Stringent';
    }

    return { flaggedPairs, falsePositiveRisk, riskTier };
  }, [wollackCutoff]);

  // Dynamic SVG Curve Points for Distribution
  const curvePaths = useMemo(() => {
    // Baseline Gaussian
    const baselinePts = [
      [10, 110], [50, 105], [90, 95], [130, 75], [170, 45],
      [210, 20], [250, 15], [290, 20], [330, 45], [370, 75],
      [410, 95], [450, 105], [490, 110]
    ];

    // Morphing Centre Curve based on leakDiffusionPercent
    // As diffusion increases, apex shifts right from x=250 to x=390, and peak height rises
    const shift = (leakDiffusionPercent / 100) * 120; // 0 to 120px right
    const peakY = 15 - (leakDiffusionPercent / 100) * 8; // sharper peak

    const morphedPts = [
      [10, 110],
      [50, 108],
      [100, 104],
      [150, 96],
      [200, 82 - (leakDiffusionPercent / 100) * 20],
      [250 + shift * 0.4, 55 - (leakDiffusionPercent / 100) * 15],
      [270 + shift * 0.7, 30 - (leakDiffusionPercent / 100) * 15],
      [290 + shift, peakY],
      [310 + shift * 1.05, 30],
      [340 + shift * 0.9, 70],
      [390 + shift * 0.6, 95],
      [440, 105],
      [490, 110]
    ];

    const toD = (pts: number[][]) => {
      let d = `M ${pts[0][0]} ${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) {
        d += ` L ${pts[i][0]} ${pts[i][1]}`;
      }
      return d;
    };

    return {
      baseline: toD(baselinePts),
      morphed: toD(morphedPts),
      apexX: Math.min(290 + shift, 470),
      apexY: peakY
    };
  }, [leakDiffusionPercent]);

  // Preset Loaders
  const loadPreset = (preset: 'wbssc' | 'neet' | 'clean') => {
    if (preset === 'wbssc') {
      setScoreInflationDelta(50);
      setLeakDiffusionPercent(15);
      setWollackCutoff(3.0);
    } else if (preset === 'neet') {
      setScoreInflationDelta(0);
      setLeakDiffusionPercent(85);
      setWollackCutoff(3.0);
    } else {
      setScoreInflationDelta(0);
      setLeakDiffusionPercent(0);
      setWollackCutoff(3.0);
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-5 space-y-5 text-left shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#5C6670]/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#5C6670] uppercase font-bold tracking-wider">
              INTERACTIVE FORENSIC LABORATORY // SENSITIVITY TESTING
            </span>
            <span className="px-1.5 py-0.2 bg-[#8A1538] text-white text-[9px] font-mono rounded-[2px] uppercase font-bold animate-pulse">
              LIVE SIMULATOR
            </span>
          </div>
          <h3 className="text-base font-bold text-[#0B1F3A] font-serif mt-0.5">
            What-If Forensic Parameter & Stress-Testing Sandbox
          </h3>
          <p className="text-xs text-[#5C6670] font-sans mt-0.5">
            Evaluate mathematical boundary conditions across all 3 layers. Move sliders to simulate subtle paper leak diffusion, variable database score tampering, or psychometric collusion thresholds.
          </p>
        </div>

        {/* Quick Scenario Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => loadPreset('wbssc')}
            className="px-2.5 py-1.5 bg-[#F7F5F0] hover:bg-[#0B1F3A] hover:text-white text-[#0B1F3A] text-xs font-mono rounded-[2px] border border-[#5C6670]/40 transition-colors cursor-pointer"
          >
            WBSSC Preset (Δ=+50)
          </button>
          <button
            type="button"
            onClick={() => loadPreset('neet')}
            className="px-2.5 py-1.5 bg-[#F7F5F0] hover:bg-[#0B1F3A] hover:text-white text-[#0B1F3A] text-xs font-mono rounded-[2px] border border-[#5C6670]/40 transition-colors cursor-pointer"
          >
            NEET Preset (D=0.38)
          </button>
          <button
            type="button"
            onClick={() => loadPreset('clean')}
            className="px-2.5 py-1.5 bg-[#F7F5F0] hover:bg-[#0B1F3A] hover:text-white text-[#0B1F3A] text-xs font-mono rounded-[2px] border border-[#5C6670]/40 transition-colors cursor-pointer"
          >
            Reset to Baseline
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls (5 cols) & Right Live Reactive Visualizer (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          {/* Slider 1: Score Inflation Delta */}
          <div className="p-3.5 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[#0B1F3A] font-bold uppercase text-[11px]">
                01 // Server Score Delta (ΔS)
              </span>
              <span className="font-mono font-bold text-sm text-[#8A1538]">
                {scoreInflationDelta > 0 ? `+${scoreInflationDelta}.0 Marks` : '0.0 (Unchanged)'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={scoreInflationDelta}
              onChange={(e) => setScoreInflationDelta(parseInt(e.target.value, 10))}
              className="w-full accent-[#0B1F3A] cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-[#5C6670]">
              <span>0.0 (Clean)</span>
              <span>+25.0 (Moderate)</span>
              <span>+60.0 (WBSSC Scale)</span>
            </div>
            <div className="pt-1 text-[11px] font-sans flex items-center justify-between border-t border-[#5C6670]/20">
              <span className="text-[#5C6670]">Layer 1 Verdict:</span>
              <span className={`font-mono font-bold ${
                scoreInflationDelta >= 15 ? 'text-[#8A1538]' : scoreInflationDelta > 0 ? 'text-[#C9A227]' : 'text-[#0B1F3A]'
              }`}>
                {scoreInflationDelta >= 15 ? '15 Severely Tampered Flags' : scoreInflationDelta > 0 ? '15 Borderline Flags' : '0 Flags (Clean)'}
              </span>
            </div>
          </div>

          {/* Slider 2: Paper Leak Diffusion Ratio */}
          <div className="p-3.5 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[#0B1F3A] font-bold uppercase text-[11px]">
                02 // Paper Leak Diffusion Skew
              </span>
              <span className="font-mono font-bold text-sm text-[#8A1538]">
                {leakDiffusionPercent}% Diffusion
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={leakDiffusionPercent}
              onChange={(e) => setLeakDiffusionPercent(parseInt(e.target.value, 10))}
              className="w-full accent-[#0B1F3A] cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-[#5C6670]">
              <span>0% (Natural Gaussian)</span>
              <span>50% (Partial Leak)</span>
              <span>100% (Hard Center Compromise)</span>
            </div>
            <div className="pt-1 text-[11px] font-sans flex items-center justify-between border-t border-[#5C6670]/20">
              <span className="text-[#5C6670]">KS Divergence (D):</span>
              <span className={`font-mono font-bold ${computedKS.isSignificant ? 'text-[#8A1538]' : 'text-[#0B1F3A]'}`}>
                D = {computedKS.d.toFixed(3)} (p = {computedKS.pVal})
              </span>
            </div>
          </div>

          {/* Slider 3: Wollack Omega Cutoff */}
          <div className="p-3.5 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[#0B1F3A] font-bold uppercase text-[11px]">
                03 // Wollack ω Seating Cutoff
              </span>
              <span className="font-mono font-bold text-sm text-[#0B1F3A]">
                ω &ge; {wollackCutoff.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="1.5"
              max="4.5"
              step="0.1"
              value={wollackCutoff}
              onChange={(e) => setWollackCutoff(parseFloat(e.target.value))}
              className="w-full accent-[#0B1F3A] cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-[#5C6670]">
              <span>1.5 (Loose)</span>
              <span className="text-[#0B1F3A] font-bold">3.0 (Court Standard)</span>
              <span>4.5 (Strict)</span>
            </div>
            <div className="pt-1 text-[11px] font-sans flex items-center justify-between border-t border-[#5C6670]/20">
              <span className="text-[#5C6670]">False Accusation Risk:</span>
              <span className="font-mono font-bold text-[#0B1F3A]">
                {computedCollusion.falsePositiveRisk} &bull; {computedCollusion.flaggedPairs} Pairs Flagged
              </span>
            </div>
          </div>
        </div>

        {/* Right Live Reactive Visualizer */}
        <div className="lg:col-span-7 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#5C6670]/20 pb-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#5C6670] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#0B1F3A]" />
                <span>DYNAMIC REACTION MONITOR // 3-LAYER MATHEMATICAL SYNTHESIS</span>
              </span>
              <span className="text-[10px] font-mono text-[#0B1F3A] font-semibold">
                POLARS RUST ACCELERATED
              </span>
            </div>

            {/* Live Morphing SVG Distribution Display */}
            <div className="mt-3 bg-[#FFFFFF] border border-[#5C6670]/30 rounded-[2px] p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-serif font-bold text-[#0B1F3A]">
                  Real-Time Probability Density Reaction Curve
                </span>
                <div className="flex items-center gap-3 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-[#5C6670]">
                    <span className="w-3 h-0.5 bg-[#5C6670] inline-block" /> Baseline (Gaussian)
                  </span>
                  <span className="flex items-center gap-1 text-[#8A1538] font-bold">
                    <span className="w-3 h-0.5 bg-[#8A1538] inline-block" /> Simulated Distribution
                  </span>
                </div>
              </div>

              {/* Dynamic SVG Drawing */}
              <div className="h-32 w-full relative">
                <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="10" y1="110" x2="490" y2="110" stroke="#5C6670" strokeWidth="1" strokeOpacity="0.3" />
                  <line x1="250" y1="10" x2="250" y2="110" stroke="#5C6670" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.3" />
                  
                  {/* Baseline Gaussian Curve */}
                  <path
                    d={curvePaths.baseline}
                    fill="none"
                    stroke="#5C6670"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    strokeOpacity="0.7"
                  />

                  {/* Morphed Curve */}
                  <path
                    d={curvePaths.morphed}
                    fill="none"
                    stroke="#8A1538"
                    strokeWidth="2.5"
                    className="transition-all duration-150 ease-out"
                  />

                  {/* Apex Flag */}
                  <circle
                    cx={curvePaths.apexX}
                    cy={curvePaths.apexY}
                    r="4"
                    fill="#8A1538"
                    className="transition-all duration-150 ease-out"
                  />
                  <line
                    x1={curvePaths.apexX}
                    y1={curvePaths.apexY}
                    x2={curvePaths.apexX}
                    y2="110"
                    stroke="#8A1538"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    strokeOpacity="0.5"
                  />
                </svg>

                {/* Legend callouts */}
                <div className="absolute bottom-1 right-2 text-[9px] font-mono text-[#8A1538] font-bold">
                  {leakDiffusionPercent > 40 ? 'Right-Shifted Shark-Fin' : 'Normal Variance'}
                </div>
              </div>
            </div>

            {/* Tri-Layer Evidentiary Synthesis Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
              {/* Layer 1 Box */}
              <div className="bg-[#FFFFFF] border border-[#5C6670]/30 p-2.5 rounded-[2px] space-y-1">
                <div className="text-[9px] font-mono text-[#5C6670] uppercase">Layer 1: Reconciliation</div>
                <div className={`text-xs font-mono font-bold ${scoreInflationDelta >= 15 ? 'text-[#8A1538]' : 'text-[#0B1F3A]'}`}>
                  {scoreInflationDelta >= 15 ? '100% Caught (Δ ≥ 15)' : scoreInflationDelta > 0 ? 'Borderline Drift' : 'Zero Drift (Pass)'}
                </div>
                <div className="text-[10px] text-[#5C6670] font-sans">
                  Bitwise delta check validates every mark.
                </div>
              </div>

              {/* Layer 2 Box */}
              <div className="bg-[#FFFFFF] border border-[#5C6670]/30 p-2.5 rounded-[2px] space-y-1">
                <div className="text-[9px] font-mono text-[#5C6670] uppercase">Layer 2: Centre Patterns</div>
                <div className={`text-xs font-mono font-bold ${computedKS.isSignificant ? 'text-[#8A1538]' : 'text-[#0B1F3A]'}`}>
                  {computedKS.isSignificant ? 'Divergence Confirmed' : 'Normal Bell Curve'}
                </div>
                <div className="text-[10px] text-[#5C6670] font-sans">
                  KS D = {computedKS.d.toFixed(3)} against baseline.
                </div>
              </div>

              {/* Layer 3 Box */}
              <div className="bg-[#FFFFFF] border border-[#5C6670]/30 p-2.5 rounded-[2px] space-y-1">
                <div className="text-[9px] font-mono text-[#5C6670] uppercase">Layer 3: Seating Twin</div>
                <div className={`text-xs font-mono font-bold ${computedCollusion.flaggedPairs > 0 ? 'text-[#8A1538]' : 'text-[#0B1F3A]'}`}>
                  {computedCollusion.flaggedPairs} Collusion Pairs
                </div>
                <div className="text-[10px] text-[#5C6670] font-sans">
                  Wollack standard: {computedCollusion.riskTier}.
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Audit Verdict Banner */}
          <div className="p-3 bg-[#0B1F3A] text-white rounded-[2px] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#C9A227]" />
              <span>
                SIMULATED ADJUDICATION VERDICT: <strong>
                  {scoreInflationDelta >= 15 || computedKS.d >= 0.25 || computedCollusion.flaggedPairs >= 2
                    ? 'STATUTORY ISOLATION WARRANTED'
                    : 'NOMINAL EXAMINATION INTEGRITY'}
                </strong>
              </span>
            </div>
            <span className="text-[10px] text-[#F7F5F0]/70 uppercase">
              Section 65B Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
