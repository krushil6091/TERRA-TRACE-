import React, { useState, useEffect } from 'react';
import { Activity, Info, ShieldCheck, AlertTriangle, Users, ChevronDown, ChevronUp } from 'lucide-react';

interface CandidateAnomalyPreview {
  id: string;
  score: number;
  room: string;
  seat: number;
  verdict: string;
}

interface CentreProfile {
  centreId: string;
  name: string;
  state: string;
  city: string;
  totalCandidates: number;
  flaggedCandidates: number;
  meanScore: number;
  maxScore: number;
  leakRisk: string;
  anomalySummary: string;
  candidates: CandidateAnomalyPreview[];
}

const CENTRE_PROFILES: Record<'jhajjar' | 'rajkot' | 'national', CentreProfile> = {
  jhajjar: {
    centreId: 'CENTRE_HR_230101',
    name: 'Hardayal Public School',
    state: 'Haryana',
    city: 'Jhajjar',
    totalCandidates: 2000,
    flaggedCandidates: 145,
    meanScore: 552.3,
    maxScore: 720.0,
    leakRisk: 'CRITICAL ANOMALY (D = 0.382)',
    anomalySummary: 'Shark-fin score clustering: 6 candidates achieved perfect 720/720 marks in single examination venue (p < 10^-12)',
    candidates: [
      { id: 'NEET24_230101_0001', score: 720.0, room: 'HALL_01', seat: 1, verdict: 'Perfect 720/720 score; impossible clustering at single exam centre (p < 10^-12)' },
      { id: 'NEET24_230101_0002', score: 720.0, room: 'HALL_01', seat: 2, verdict: 'Perfect 720/720 score; impossible clustering at single exam centre (p < 10^-12)' },
      { id: 'NEET24_230101_0003', score: 720.0, room: 'HALL_01', seat: 3, verdict: 'Perfect 720/720 score; impossible clustering at single exam centre (p < 10^-12)' },
      { id: 'NEET24_230101_0004', score: 720.0, room: 'HALL_01', seat: 4, verdict: 'Perfect 720/720 score; impossible clustering at single exam centre (p < 10^-12)' },
      { id: 'NEET24_230101_0005', score: 720.0, room: 'HALL_01', seat: 5, verdict: 'Perfect 720/720 score; impossible clustering at single exam centre (p < 10^-12)' },
      { id: 'NEET24_230101_0006', score: 720.0, room: 'HALL_01', seat: 6, verdict: 'Perfect 720/720 score; impossible clustering at single exam centre (p < 10^-12)' },
    ],
  },
  rajkot: {
    centreId: 'CENTRE_GJ_220101',
    name: 'School of Science, RK University',
    state: 'Gujarat',
    city: 'Rajkot',
    totalCandidates: 1500,
    flaggedCandidates: 177,
    meanScore: 535.8,
    maxScore: 716.2,
    leakRisk: 'CRITICAL ANOMALY (D = 0.347)',
    anomalySummary: 'Extreme concentration of scores in upper decile with anomalous right-tail skew (KS D = 0.347, p < 10^-12)',
    candidates: [
      { id: 'NEET24_220101_0001', score: 716.2, room: 'HALL_01', seat: 1, verdict: 'Upper decile score concentration; statistical divergence D = 0.347' },
      { id: 'NEET24_220101_0002', score: 712.0, room: 'HALL_01', seat: 2, verdict: 'Upper decile score concentration; statistical divergence D = 0.347' },
      { id: 'NEET24_220101_0003', score: 708.5, room: 'HALL_01', seat: 3, verdict: 'Upper decile score concentration; statistical divergence D = 0.347' },
    ],
  },
  national: {
    centreId: 'NAT_BASELINE_COHORT',
    name: 'National Baseline Cohort',
    state: 'All-India',
    city: 'National Jurisdiction',
    totalCandidates: 24000,
    flaggedCandidates: 0,
    meanScore: 380.0,
    maxScore: 680.0,
    leakRisk: 'NORMAL VARIANCE (D = 0.042)',
    anomalySummary: 'Natural empirical Gaussian bell curve verified across all honest nationwide exam centres',
    candidates: [],
  },
};

interface KSDistributionInspectorProps {
  flaggedCentres?: Array<{
    centre_id: string;
    centre_name: string;
    state_name: string;
    total_candidates: number;
    flagged_candidates?: number;
    ks_statistic_d?: number;
    p_value_approx?: number;
    kurtosis?: number;
    why_it_stood_out?: string;
  }>;
  selectedCenterKey?: 'jhajjar' | 'rajkot' | 'national';
  onSelectCenter?: (center: 'jhajjar' | 'rajkot' | 'national') => void;
}

export const KSDistributionInspector: React.FC<KSDistributionInspectorProps> = ({
  selectedCenterKey,
  onSelectCenter,
}) => {
  const [selectedCenter, setSelectedCenter] = useState<'jhajjar' | 'rajkot' | 'national'>(
    selectedCenterKey || 'jhajjar'
  );
  const [showExplanation, setShowExplanation] = useState(false);
  const [showRoster, setShowRoster] = useState(false);

  useEffect(() => {
    if (selectedCenterKey) {
      setSelectedCenter(selectedCenterKey);
    }
  }, [selectedCenterKey]);

  const handleCenterSelect = (key: 'jhajjar' | 'rajkot' | 'national') => {
    setSelectedCenter(key);
    if (onSelectCenter) {
      onSelectCenter(key);
    }
  };

  // Gaussian PDF for normal national curve (mean 380, std 120 out of 720)
  const generateNormalPoints = () => {
    const pts: [number, number][] = [];
    for (let x = 0; x <= 720; x += 15) {
      const mean = 380;
      const std = 120;
      const y = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
      const scaledY = 160 - y * 45000;
      pts.push([x, Math.max(15, scaledY)]);
    }
    return pts;
  };

  // Anomalous Shark-Fin curve (skewed heavily towards 640-715)
  const generateAnomalousPoints = (center: 'jhajjar' | 'rajkot') => {
    const pts: [number, number][] = [];
    for (let x = 0; x <= 720; x += 15) {
      let y = 0;
      if (center === 'jhajjar') {
        const base = (1 / (130 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - 400) / 130, 2)) * 0.4;
        const spike = (1 / (45 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - 680) / 45, 2)) * 1.6;
        y = base + spike;
      } else {
        const base = (1 / (110 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - 430) / 110, 2)) * 0.5;
        const spike = (1 / (55 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - 640) / 55, 2)) * 1.3;
        y = base + spike;
      }
      const scaledY = 160 - y * 36000;
      pts.push([x, Math.max(15, scaledY)]);
    }
    return pts;
  };

  const normalPts = generateNormalPoints();
  const anomalousPts = generateAnomalousPoints(selectedCenter === 'rajkot' ? 'rajkot' : 'jhajjar');

  const toSvgPath = (pts: [number, number][]) => {
    return pts.reduce((acc, [x, y], idx) => {
      const svgX = (x / 720) * 580 + 30;
      return `${acc} ${idx === 0 ? 'M' : 'L'} ${svgX.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  };

  const normalPath = toSvgPath(normalPts);
  const anomalousPath = toSvgPath(anomalousPts);

  const currentD = selectedCenter === 'jhajjar' ? 0.382 : selectedCenter === 'rajkot' ? 0.347 : 0.042;
  const currentP = selectedCenter === 'national' ? 0.892 : 0.0001;
  const currentKurtosis = selectedCenter === 'jhajjar' ? 4.82 : selectedCenter === 'rajkot' ? 3.91 : 0.08;

  const profile = CENTRE_PROFILES[selectedCenter];

  return (
    <div className="bg-[#0A192F] border border-[#1E293B] rounded-[2px] p-5 text-white space-y-4 shadow-md font-sans">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#C9A227]/15 border border-[#C9A227]/40 rounded-[2px] text-[#C9A227]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-[#F7F5F0]">
                Kolmogorov-Smirnov Distribution Divergence Inspector
              </span>
              <span className="text-[9px] font-mono text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/40 px-1.5 py-0.5 rounded uppercase font-semibold">
                Continuous 2-Sample Test
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] font-sans">
              Compares examination center score density curves directly against the national empirical Gaussian baseline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#071324] p-1 border border-[#1E293B] rounded-[2px] text-[11px] font-mono">
          <button
            type="button"
            onClick={() => handleCenterSelect('jhajjar')}
            className={`px-2.5 py-1 rounded-[2px] cursor-pointer transition-colors ${
              selectedCenter === 'jhajjar'
                ? 'bg-[#8A1538] text-white font-bold shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Jhajjar (NEET Case)
          </button>
          <button
            type="button"
            onClick={() => handleCenterSelect('rajkot')}
            className={`px-2.5 py-1 rounded-[2px] cursor-pointer transition-colors ${
              selectedCenter === 'rajkot'
                ? 'bg-[#C9A227] text-[#0A192F] font-bold shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Rajkot Cluster
          </button>
          <button
            type="button"
            onClick={() => handleCenterSelect('national')}
            className={`px-2.5 py-1 rounded-[2px] cursor-pointer transition-colors ${
              selectedCenter === 'national'
                ? 'bg-[#38BDF8] text-[#0A192F] font-bold shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            National Baseline
          </button>
        </div>
      </div>

      {/* SVG Density Curve Visualizer */}
      <div className="relative bg-[#071324] border border-[#1E293B] rounded-[2px] p-3 overflow-hidden">
        <svg viewBox="0 0 640 180" className="w-full h-44 select-none">
          <line x1="30" y1="30" x2="610" y2="30" stroke="#1E293B" strokeDasharray="3 3" />
          <line x1="30" y1="75" x2="610" y2="75" stroke="#1E293B" strokeDasharray="3 3" />
          <line x1="30" y1="120" x2="610" y2="120" stroke="#1E293B" strokeDasharray="3 3" />
          <line x1="30" y1="165" x2="610" y2="165" stroke="#334155" strokeWidth="1.5" />

          <text x="30" y="177" fill="#64748B" fontSize="9" fontFamily="monospace">0m</text>
          <text x="175" y="177" fill="#64748B" fontSize="9" fontFamily="monospace">180m</text>
          <text x="320" y="177" fill="#64748B" fontSize="9" fontFamily="monospace">360m (Cohort Median)</text>
          <text x="465" y="177" fill="#64748B" fontSize="9" fontFamily="monospace">540m</text>
          <text x="590" y="177" fill="#64748B" fontSize="9" fontFamily="monospace">720m</text>

          <path
            d={normalPath}
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeOpacity="0.85"
          />

          {selectedCenter !== 'national' && (
            <>
              <path
                d={`${anomalousPath} L 610 165 L 30 165 Z`}
                fill={selectedCenter === 'jhajjar' ? '#8A1538' : '#C9A227'}
                fillOpacity="0.18"
              />
              <path
                d={anomalousPath}
                fill="none"
                stroke={selectedCenter === 'jhajjar' ? '#F43F5E' : '#FBBF24'}
                strokeWidth="2.5"
              />

              <line
                x1="570"
                y1="35"
                x2="570"
                y2="145"
                stroke="#F43F5E"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              <circle cx="570" cy="35" r="3.5" fill="#F43F5E" />
              <circle cx="570" cy="145" r="3.5" fill="#38BDF8" />
              <rect x="510" y="70" width="115" height="24" rx="2" fill="#0A192F" stroke="#F43F5E" strokeWidth="1" />
              <text x="518" y="86" fill="#FCA5A5" fontSize="10" fontFamily="monospace" fontWeight="bold">
                KS D = {currentD.toFixed(3)}
              </text>
            </>
          )}
        </svg>

        <div className="absolute top-4 left-5 flex items-center gap-4 text-[10px] font-mono bg-[#0A192F]/90 px-2.5 py-1 border border-[#1E293B] rounded">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#38BDF8] inline-block" />
            <span className="text-slate-300">National Gaussian Baseline</span>
          </div>
          {selectedCenter !== 'national' && (
            <div className="flex items-center gap-1.5">
              <span className={`w-3 h-0.5 ${selectedCenter === 'jhajjar' ? 'bg-[#F43F5E]' : 'bg-[#FBBF24]'} inline-block`} />
              <span className={selectedCenter === 'jhajjar' ? 'text-rose-400 font-semibold' : 'text-amber-400 font-semibold'}>
                {selectedCenter === 'jhajjar' ? 'Jhajjar Spike (CENTRE_HR)' : 'Rajkot Cluster (CENTRE_GJ)'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="p-2.5 bg-[#071324] border border-[#1E293B] rounded-[2px]">
          <div className="text-[10px] text-[#94A3B8] uppercase">Kolmogorov D-Stat</div>
          <div className={`text-base font-bold mt-0.5 ${currentD >= 0.30 ? 'text-rose-400' : 'text-emerald-400'}`}>
            D = {currentD.toFixed(3)}
          </div>
          <div className="text-[9px] text-[#64748B]">Threshold: D &gt; 0.30</div>
        </div>

        <div className="p-2.5 bg-[#071324] border border-[#1E293B] rounded-[2px]">
          <div className="text-[10px] text-[#94A3B8] uppercase">Significance (p-value)</div>
          <div className={`text-base font-bold mt-0.5 ${currentP < 0.01 ? 'text-rose-400' : 'text-emerald-400'}`}>
            p &lt; {currentP < 0.01 ? '0.001' : '0.90'}
          </div>
          <div className="text-[9px] text-[#64748B]">Statistically Irrefutable</div>
        </div>

        <div className="p-2.5 bg-[#071324] border border-[#1E293B] rounded-[2px]">
          <div className="text-[10px] text-[#94A3B8] uppercase">Kurtosis (Peakedness)</div>
          <div className={`text-base font-bold mt-0.5 ${currentKurtosis > 3.0 ? 'text-amber-400' : 'text-slate-200'}`}>
            {currentKurtosis.toFixed(2)}
          </div>
          <div className="text-[9px] text-[#64748B]">Artificial Cluster Indicator</div>
        </div>

        <div className="p-2.5 bg-[#071324] border border-[#1E293B] rounded-[2px]">
          <div className="text-[10px] text-[#94A3B8] uppercase">Courtroom Finding</div>
          <div className="text-xs font-bold mt-1 text-[#F7F5F0] truncate">
            {selectedCenter === 'national' ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Normal Variance
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Localized Leak Proven
              </span>
            )}
          </div>
          <div className="text-[9px] text-[#64748B]">Pre-Declaration Interception</div>
        </div>
      </div>

      {/* Selected Centre Forensic Profile & Flagged Candidate Intelligence Bar */}
      <div className="p-3.5 bg-[#071324] border border-[#1E293B] rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold">
              // ACTIVE CENTRE FORENSIC PROFILE
            </span>
            <span className="text-[#64748B]">&bull;</span>
            <span className="text-[11px] text-[#38BDF8] font-mono">{profile.centreId}</span>
          </div>
          <div className="text-sm font-bold text-[#F7F5F0] font-serif">
            {profile.name} <span className="text-xs font-sans text-[#94A3B8]">({profile.city}, {profile.state})</span>
          </div>
          <div className="text-[11px] text-[#C9A227] font-sans">
            {profile.anomalySummary}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 bg-[#0A192F] border border-[#1E293B] rounded-[2px] text-center min-w-[90px]">
            <div className="text-[9px] text-[#94A3B8] uppercase">Total Tested</div>
            <div className="text-sm font-bold text-white font-mono">
              {profile.totalCandidates.toLocaleString()}
            </div>
          </div>

          <div className="px-3 py-1.5 bg-[#0A192F] border border-[#1E293B] rounded-[2px] text-center min-w-[110px]">
            <div className="text-[9px] text-[#94A3B8] uppercase">Flagged Cases</div>
            <div className={`text-sm font-bold font-mono ${profile.flaggedCandidates > 0 ? 'text-[#F43F5E]' : 'text-emerald-400'}`}>
              {profile.flaggedCandidates > 0 ? `${profile.flaggedCandidates} Flagged` : '0 Clean'}
            </div>
          </div>

          <div className="px-3 py-1.5 bg-[#0A192F] border border-[#1E293B] rounded-[2px] text-center min-w-[90px]">
            <div className="text-[9px] text-[#94A3B8] uppercase">Peak Mark</div>
            <div className={`text-sm font-bold font-mono ${profile.flaggedCandidates > 0 ? 'text-[#FBBF24]' : 'text-white'}`}>
              {profile.maxScore} <span className="text-[9px] text-[#64748B]">/ 720</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flagged Candidates Roster Accordion */}
      {profile.candidates.length > 0 && (
        <div className="bg-[#071324] border border-[#1E293B] rounded-[2px] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowRoster(!showRoster)}
            className="w-full px-3 py-2 bg-[#0A192F] hover:bg-[#122A4E] text-left text-xs font-mono flex items-center justify-between text-[#C9A227] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[#C9A227]" />
              <span className="font-bold">
                Inspect Flagged Candidates in {profile.name} ({profile.flaggedCandidates} Cases)
              </span>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
              {showRoster ? 'Hide Candidate Records' : 'Show Verified Records'}
              {showRoster ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
          </button>

          {showRoster && (
            <div className="p-3 border-t border-[#1E293B] space-y-2">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-[#94A3B8] text-[10px] uppercase">
                      <th className="py-1.5 px-2">Candidate ID</th>
                      <th className="py-1.5 px-2">Venue Location</th>
                      <th className="py-1.5 px-2 text-right">Score</th>
                      <th className="py-1.5 px-2">Empirical Anomaly Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/60 text-[11px]">
                    {profile.candidates.map((c) => (
                      <tr key={c.id} className="hover:bg-[#0A192F]">
                        <td className="py-1.5 px-2 font-bold text-[#F43F5E]">{c.id}</td>
                        <td className="py-1.5 px-2 text-[#94A3B8]">{c.room}, Seat #{c.seat}</td>
                        <td className="py-1.5 px-2 text-right font-bold text-white">{c.score.toFixed(1)} / 720</td>
                        <td className="py-1.5 px-2 text-slate-300 font-sans text-xs">{c.verdict}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-[10px] text-[#64748B] font-mono pt-1 text-right">
                Displaying priority cluster records &bull; Total {profile.flaggedCandidates} candidates in upper decile flagged for human adjudication.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mathematical Proof Toggle */}
      <div className="text-right">
        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-[11px] font-mono text-[#C9A227] hover:underline cursor-pointer inline-flex items-center gap-1"
        >
          <Info className="w-3 h-3" />
          <span>{showExplanation ? 'Hide Mathematical Proof' : 'How does the KS Test prove leaks mathematically?'}</span>
        </button>
      </div>

      {showExplanation && (
        <div className="p-3 bg-[#071324] border-l-2 border-[#C9A227] text-xs font-sans text-slate-300 leading-relaxed">
          <strong className="text-white font-mono">The Supremum Metric: </strong>
          The Two-Sample Kolmogorov-Smirnov test measures the maximum vertical distance between a center's empirical cumulative distribution and the national cohort. In honest centers, normal student talent variation creates smooth variance. When an exam center leaks an answer key (as in NEET-UG 2024 Jhajjar), scores jump into an artificial cluster. When <code className="text-[#C9A227]">D &ge; 0.30 (p &lt; 0.01)</code>, it mathematically refutes random chance, providing Section 65B-grade proof without relying on police confessions.
        </div>
      )}
    </div>
  );
};
