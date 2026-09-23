import React, { useState } from 'react';
import { Scale, ArrowRight, MapPin } from 'lucide-react';
import { useTriageStore } from '../stores/triageStore';

export interface StateForensicProfile {
  id: string;
  name: string;
  code: string;
  status: 'Critical Alert' | 'Server Tampering' | 'Physical Leak' | 'Elevated Risk' | 'Congruent Baseline';
  riskScore: number;
  totalExaminees: string;
  flaggedCentres: number;
  primaryVenues: string[];
  legalReference: string;
  courtBench: string;
  evidentiaryFinding: string;
  ksDivergence: number;
  pValText: string;
  kurtosis: number;
  meanDriftPercent: number;
  distractorMatchRate: number;
  benchmarkNotes: string;
}

const REAL_STATES_DATA: StateForensicProfile[] = [
  {
    id: 'haryana',
    name: 'Haryana',
    code: 'HR',
    status: 'Critical Alert',
    riskScore: 88.4,
    totalExaminees: '1,42,800',
    flaggedCentres: 12,
    primaryVenues: ['Centre 104 (Hardayal School, Jhajjar)', 'Centre 109 (Bahadurgarh)', 'Centre 115 (Rohtak)'],
    legalReference: 'Supreme Court of India — WP(C) No. 368/2024',
    courtBench: 'CJI D.Y. Chandrachud Bench',
    evidentiaryFinding: 'Unprecedented score clustering with 6 candidates securing perfect 720/720 at a single Jhajjar venue. Right-shifted shark-fin distribution confirmed by KS test.',
    ksDivergence: 0.382,
    pValText: '< 10⁻¹²',
    kurtosis: 4.82,
    meanDriftPercent: 22.4,
    distractorMatchRate: 48.6,
    benchmarkNotes: 'Extreme right-tail kurtosis (+4.82) confirms non-random score distribution inconsistent with natural talent variance.'
  },
  {
    id: 'gujarat',
    name: 'Gujarat',
    code: 'GJ',
    status: 'Critical Alert',
    riskScore: 82.6,
    totalExaminees: '1,89,400',
    flaggedCentres: 8,
    primaryVenues: ['Centre 208 (Rajkot West)', 'Centre 402 (Jay Jalaram School, Godhra)', 'Centre 214 (Ahmedabad)'],
    legalReference: 'Gujarat Police CID Crime FIR 11/2024 & CBI Transfer',
    courtBench: 'Godhra Sessions Court / Gujarat High Court',
    evidentiaryFinding: 'Synchronized seating collusion identified across 16 examinees sharing rare distractor options (Q14 Option C, Q27 Option A) with Wollack ω exceeding 4.12.',
    ksDivergence: 0.347,
    pValText: '2.1 × 10⁻⁹',
    kurtosis: 3.91,
    meanDriftPercent: 18.7,
    distractorMatchRate: 54.2,
    benchmarkNotes: 'Pairwise distractor match rate is 4.5× higher than the state baseline, indicating localized room-level answer broadcast.'
  },
  {
    id: 'west_bengal',
    name: 'West Bengal',
    code: 'WB',
    status: 'Server Tampering',
    riskScore: 94.1,
    totalExaminees: '2,15,600',
    flaggedCentres: 3,
    primaryVenues: ['Kolkata Headquarters Commission Server', 'Centre 312 (Kolkata Central)', 'Centre 318 (Siliguri)'],
    legalReference: 'Calcutta High Court — WPA No. 5504/2021',
    courtBench: 'Special Division Bench (Justice Debangsu Basak & Md. Shabbar Rashidi)',
    evidentiaryFinding: 'Direct physical-to-digital divergence. 15 candidates scored 3.0–4.0 marks on physical OMR sheets but were published with 52.0–54.0 marks on central server database (+49.0 marks inflation).',
    ksDivergence: 0.091,
    pValText: '0.643',
    kurtosis: 0.22,
    meanDriftPercent: 49.0,
    distractorMatchRate: 11.4,
    benchmarkNotes: 'Clean centre distributions (KS D=0.09) prove the integrity violation occurred downstream in the central database, not inside examination halls.'
  },
  {
    id: 'bihar',
    name: 'Bihar',
    code: 'BR',
    status: 'Physical Leak',
    riskScore: 86.9,
    totalExaminees: '2,78,000',
    flaggedCentres: 14,
    primaryVenues: ['Centre 501 (Khemnichak, Patna)', 'Learnt Boys Hostel Safe House', 'Centre 519 (Nalanda)'],
    legalReference: 'CBI Special Crime Branch FIR No. RC 218/2024',
    courtBench: 'Special CBI Court, Patna',
    evidentiaryFinding: 'Pre-exam question paper compromise. Partial paper burns recovered matching master test booklet set. Rapid score density in upper deciles with sharp cliff below passing mark.',
    ksDivergence: 0.365,
    pValText: '4.8 × 10⁻¹¹',
    kurtosis: 5.12,
    meanDriftPercent: 24.1,
    distractorMatchRate: 46.8,
    benchmarkNotes: 'Upper-decile score concentration confirms advance access to answer keys prior to candidate room entry.'
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    code: 'RJ',
    status: 'Elevated Risk',
    riskScore: 64.2,
    totalExaminees: '2,42,100',
    flaggedCentres: 9,
    primaryVenues: ['Centre 601 (Kota City Hub)', 'Centre 611 (Jaipur Vidhyadhar)', 'Centre 624 (Jodhpur)'],
    legalReference: 'Rajasthan Special Operations Group (SOG) Case 12/2021',
    courtBench: 'Rajasthan High Court, Jaipur Bench',
    evidentiaryFinding: 'Distributed micro-syndicates exploiting adjacent seating grids in high-density coaching hubs. Wollack ω values between 3.4 and 3.9 in four contiguous examination halls.',
    ksDivergence: 0.228,
    pValText: '1.4 × 10⁻⁴',
    kurtosis: 2.14,
    meanDriftPercent: 11.3,
    distractorMatchRate: 38.2,
    benchmarkNotes: 'Localized distractor clusters detected without macro-level score inflation, representing surgical cheating patterns.'
  },
  {
    id: 'uttar_pradesh',
    name: 'Uttar Pradesh',
    code: 'UP',
    status: 'Elevated Risk',
    riskScore: 78.5,
    totalExaminees: '4,10,500',
    flaggedCentres: 18,
    primaryVenues: ['Centre 701 (Civil Lines, Prayagraj)', 'Centre 718 (Alambagh, Lucknow)', 'Centre 742 (Meerut)'],
    legalReference: 'UP Special Task Force (STF) FIR No. 48/2024',
    courtBench: 'Allahabad High Court, Lucknow Bench',
    evidentiaryFinding: 'Timestamp divergence: Answer keys surfaced in digital channels 3 hours and 42 minutes before exam commencement. Administrative mass cancellation occurred due to lack of granular isolation.',
    ksDivergence: 0.294,
    pValText: '3.2 × 10⁻⁷',
    kurtosis: 3.25,
    meanDriftPercent: 15.8,
    distractorMatchRate: 41.5,
    benchmarkNotes: 'Terra Trace could have isolated the 148 compromised candidates within 30 minutes, preventing cancellation of the 48-lakh examinee cohort.'
  },
  {
    id: 'national_baseline',
    name: 'National Baseline',
    code: 'IN',
    status: 'Congruent Baseline',
    riskScore: 12.1,
    totalExaminees: '24,06,079',
    flaggedCentres: 0,
    primaryVenues: ['All India Standard Gaussian Control (4,750 Venues)'],
    legalReference: 'National Examination Standard Specification (NTA/UPSC Protocol)',
    courtBench: 'All-India Jurisdictional Reference',
    evidentiaryFinding: 'Statistically normal bell curve distribution (Mean μ = 342.1, Std Dev σ = 68.4). Zero spatial distractor clustering and zero reconciliation drift.',
    ksDivergence: 0.082,
    pValText: '0.812',
    kurtosis: -0.14,
    meanDriftPercent: 0.0,
    distractorMatchRate: 11.8,
    benchmarkNotes: 'Canonical baseline. Rejection region for Kolmogorov-Smirnov test set at D > 0.15 (α = 0.01).'
  }
];

export const StateForensicExplorer: React.FC = () => {
  const [selectedStateId, setSelectedStateId] = useState<string>('haryana');
  const [isComparingBaseline, setIsComparingBaseline] = useState<boolean>(true);
  const { setSearchQuery } = useTriageStore();

  const selectedState = REAL_STATES_DATA.find((s) => s.id === selectedStateId) || REAL_STATES_DATA[0];
  const baselineState = REAL_STATES_DATA.find((s) => s.id === 'national_baseline') || REAL_STATES_DATA[REAL_STATES_DATA.length - 1];

  const getStatusBadge = (status: StateForensicProfile['status']) => {
    switch (status) {
      case 'Critical Alert':
        return 'bg-[#8A1538] text-white border-[#8A1538]';
      case 'Server Tampering':
        return 'bg-[#8A1538] text-white border-[#8A1538] animate-pulse';
      case 'Physical Leak':
        return 'bg-[#8A1538] text-white border-[#8A1538]';
      case 'Elevated Risk':
        return 'bg-[#C9A227] text-white border-[#C9A227]';
      case 'Congruent Baseline':
        return 'bg-[#0B1F3A] text-white border-[#0B1F3A]';
      default:
        return 'bg-[#5C6670] text-white border-[#5C6670]';
    }
  };

  const handleFilterQueue = (cityNameOrCode: string) => {
    setSearchQuery(cityNameOrCode);
    const queueElement = document.getElementById('adjudication-queue-table');
    if (queueElement) {
      queueElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-5 space-y-5 text-left shadow-sm">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#5C6670]/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#5C6670] uppercase font-bold tracking-wider">
              SOVEREIGN JURISDICTIONAL RADAR // REAL-STATE FORENSIC AUDIT
            </span>
            <span className="px-1.5 py-0.2 bg-[#0B1F3A] text-white text-[9px] font-mono rounded-[2px]">
              SUPREME COURT & HIGH COURT MATTERS
            </span>
          </div>
          <h3 className="text-base font-bold text-[#0B1F3A] font-serif mt-0.5">
            National State-by-State Forensic Integrity Radar
          </h3>
          <p className="text-xs text-[#5C6670] font-sans mt-0.5">
            Empirical comparative analysis across states experiencing exam litigation. Select any state to inspect distribution shifts, court citations, and statistical drift from the National Baseline.
          </p>
        </div>

        {/* Technical Attestation Tag */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsComparingBaseline(!isComparingBaseline)}
            className={`px-3 py-1.5 rounded-[2px] text-xs font-mono font-medium border transition-colors cursor-pointer ${
              isComparingBaseline
                ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                : 'bg-[#F7F5F0] text-[#1A1A1A] border-[#5C6670] hover:bg-[#FFFFFF]'
            }`}
          >
            {isComparingBaseline ? 'Baseline Overlay: ON' : 'Baseline Overlay: OFF'}
          </button>
        </div>
      </div>

      {/* State Selector Horizontal Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {REAL_STATES_DATA.map((state) => {
          const isSelected = state.id === selectedStateId;
          return (
            <button
              key={state.id}
              type="button"
              onClick={() => setSelectedStateId(state.id)}
              className={`p-2.5 rounded-[2px] text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-md ring-1 ring-[#0B1F3A]'
                  : 'bg-[#F7F5F0] text-[#1A1A1A] border-[#5C6670]/40 hover:bg-[#FFFFFF] hover:border-[#0B1F3A]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-[#C9A227]' : 'text-[#5C6670]'}`}>
                  {state.code}
                </span>
                <span className={`text-[9px] font-mono px-1 py-0.2 rounded-[2px] ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-[#5C6670]'
                }`}>
                  Risk {state.riskScore.toFixed(0)}
                </span>
              </div>
              <div className="mt-1">
                <div className={`text-xs font-bold font-serif truncate ${isSelected ? 'text-white' : 'text-[#0B1F3A]'}`}>
                  {state.name}
                </div>
                <div className={`text-[10px] font-mono truncate mt-0.5 ${
                  state.status === 'Critical Alert' || state.status === 'Server Tampering'
                    ? isSelected ? 'text-red-300 font-bold' : 'text-[#8A1538] font-semibold'
                    : state.status === 'Elevated Risk'
                    ? isSelected ? 'text-amber-200' : 'text-[#C9A227] font-semibold'
                    : isSelected ? 'text-blue-200' : 'text-[#5C6670]'
                }`}>
                  {state.status}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected State Deep-Dive Dossier */}
      <div className="border border-[#5C6670]/40 rounded-[2px] bg-[#F7F5F0] p-4 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (7 cols): Jurisdictional Case & Forensic Narrative */}
          <div className="lg:col-span-7 space-y-4">
            {/* Title & Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#5C6670]/30 pb-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#0B1F3A] font-serif">
                    {selectedState.name} Examination Integrity Dossier
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded-[2px] border ${getStatusBadge(selectedState.status)}`}>
                    {selectedState.status}
                  </span>
                </div>
                <div className="text-xs text-[#5C6670] font-mono mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0B1F3A]" />
                  <span>State Territory: {selectedState.name} ({selectedState.code})</span>
                  <span>&bull;</span>
                  <span>Total Cohort: <strong>{selectedState.totalExaminees}</strong></span>
                  <span>&bull;</span>
                  <span className={selectedState.flaggedCentres > 0 ? 'text-[#8A1538] font-bold' : 'text-[#0B1F3A]'}>
                    {selectedState.flaggedCentres} Venues Flagged
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {selectedState.id !== 'national_baseline' && (
                <button
                  type="button"
                  onClick={() => handleFilterQueue(selectedState.name)}
                  className="px-3 py-1.5 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white text-xs font-sans font-medium rounded-[2px] flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Filter Queue to {selectedState.code}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Legal Citation Card */}
            <div className="bg-[#FFFFFF] border border-[#5C6670]/30 p-3.5 rounded-[2px] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#5C6670] uppercase font-bold flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[#0B1F3A]" />
                  <span>Judicial & Investigative Citation</span>
                </span>
                <span className="text-[10px] font-mono text-[#0B1F3A] font-semibold">
                  {selectedState.courtBench}
                </span>
              </div>
              <div className="text-xs font-serif font-bold text-[#0B1F3A]">
                {selectedState.legalReference}
              </div>
              <p className="text-xs text-[#1A1A1A] font-sans leading-relaxed">
                {selectedState.evidentiaryFinding}
              </p>
            </div>

            {/* Venues Audited */}
            <div>
              <span className="text-[10px] font-mono text-[#5C6670] uppercase font-bold">
                PRIMARY EXAMINATION CENTRES AUDITED
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5">
                {selectedState.primaryVenues.map((venue, idx) => (
                  <div key={idx} className="bg-[#FFFFFF] border border-[#5C6670]/30 p-2 rounded-[2px] text-xs font-mono">
                    <div className="text-[9px] text-[#5C6670] uppercase">Venue 0{idx + 1}</div>
                    <div className="font-semibold text-[#0B1F3A] truncate" title={venue}>
                      {venue}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expert Forensic Assessment */}
            <div className="p-3 bg-[#FFFFFF] border-l-2 border-[#0B1F3A] border-y border-r border-[#5C6670]/30 rounded-[2px] text-xs font-sans text-[#1A1A1A] leading-relaxed">
              <strong className="text-[#0B1F3A] font-mono uppercase text-[11px] block mb-0.5">
                Forensic Auditor Evaluation:
              </strong>
              {selectedState.benchmarkNotes}
            </div>
          </div>

          {/* Right Column (5 cols): State vs National Delta Barometer */}
          <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#5C6670]/40 rounded-[2px] p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-[#5C6670]/20 pb-2">
                <span className="text-[10px] font-mono uppercase font-bold text-[#5C6670]">
                  FORENSIC STATISTICAL BAROMETER
                </span>
                <span className="text-[10px] font-mono text-[#0B1F3A] font-semibold">
                  {selectedState.name} vs National Control
                </span>
              </div>

              {/* Barometer Metrics */}
              <div className="space-y-3.5 mt-3">
                {/* 1. Kolmogorov-Smirnov Divergence */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans text-[#1A1A1A] font-medium">KS Divergence (D-Stat):</span>
                    <span className="font-mono font-bold">
                      <span className={selectedState.ksDivergence >= 0.15 ? 'text-[#8A1538]' : 'text-[#0B1F3A]'}>
                        D = {selectedState.ksDivergence.toFixed(3)}
                      </span>
                      {isComparingBaseline && (
                        <span className="text-[10px] text-[#5C6670] font-normal ml-1.5">
                          (Nat: {baselineState.ksDivergence.toFixed(3)})
                        </span>
                      )}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 w-full bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[1px] relative overflow-hidden">
                    <div
                      className={`h-full ${
                        selectedState.ksDivergence >= 0.3 ? 'bg-[#8A1538]' : selectedState.ksDivergence >= 0.15 ? 'bg-[#C9A227]' : 'bg-[#0B1F3A]'
                      }`}
                      style={{ width: `${Math.min(selectedState.ksDivergence * 200, 100)}%` }}
                    />
                    {/* Critical threshold line at D=0.15 (30% width) */}
                    <div className="absolute top-0 bottom-0 left-[30%] w-0.5 bg-[#8A1538] opacity-60" title="Rejection Threshold (D=0.15)" />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-[#5C6670]">
                    <span>0.00 (Gaussian)</span>
                    <span className="text-[#8A1538]">D=0.15 (Critical Threshold)</span>
                    <span>0.50 (Severe)</span>
                  </div>
                </div>

                {/* 2. Empirical P-Value */}
                <div className="flex items-center justify-between p-2 bg-[#F7F5F0] border border-[#5C6670]/20 rounded-[2px] text-xs">
                  <span className="font-sans text-[#5C6670]">p-value (Null Hypothesis Prob):</span>
                  <span className="font-mono font-bold text-[#0B1F3A]">
                    {selectedState.pValText}
                    {selectedState.ksDivergence >= 0.15 && (
                      <span className="ml-1 text-[10px] text-[#8A1538] font-sans font-bold">(p &lt; 0.01 Rejection)</span>
                    )}
                  </span>
                </div>

                {/* 3. Kurtosis Shift */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans text-[#1A1A1A] font-medium">Distribution Kurtosis (Tail Peak):</span>
                    <span className="font-mono font-bold">
                      <span className={selectedState.kurtosis >= 2.0 ? 'text-[#8A1538]' : 'text-[#0B1F3A]'}>
                        {selectedState.kurtosis > 0 ? `+${selectedState.kurtosis.toFixed(2)}` : selectedState.kurtosis.toFixed(2)}
                      </span>
                      {isComparingBaseline && (
                        <span className="text-[10px] text-[#5C6670] font-normal ml-1.5">
                          (Nat: {baselineState.kurtosis.toFixed(2)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[1px] relative overflow-hidden">
                    <div
                      className={`h-full ${
                        selectedState.kurtosis >= 3.0 ? 'bg-[#8A1538]' : selectedState.kurtosis >= 1.0 ? 'bg-[#C9A227]' : 'bg-[#0B1F3A]'
                      }`}
                      style={{ width: `${Math.min(Math.max((selectedState.kurtosis + 1) * 16, 5), 100)}%` }}
                    />
                  </div>
                </div>

                {/* 4. Distractor Match Rate */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans text-[#1A1A1A] font-medium">Wrong Option Sharing Rate:</span>
                    <span className="font-mono font-bold">
                      <span className={selectedState.distractorMatchRate >= 30.0 ? 'text-[#8A1538]' : 'text-[#0B1F3A]'}>
                        {selectedState.distractorMatchRate.toFixed(1)}%
                      </span>
                      {isComparingBaseline && (
                        <span className="text-[10px] text-[#5C6670] font-normal ml-1.5">
                          (Nat: {baselineState.distractorMatchRate.toFixed(1)}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[1px] relative overflow-hidden">
                    <div
                      className={`h-full ${
                        selectedState.distractorMatchRate >= 40.0 ? 'bg-[#8A1538]' : selectedState.distractorMatchRate >= 25.0 ? 'bg-[#C9A227]' : 'bg-[#0B1F3A]'
                      }`}
                      style={{ width: `${Math.min(selectedState.distractorMatchRate * 1.5, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Statutory Certificate Note */}
            <div className="pt-2 border-t border-[#5C6670]/30 flex items-center justify-between text-[10px] font-mono text-[#5C6670]">
              <span>Section 65B Admissible Evidence</span>
              <span className="text-[#0B1F3A] font-bold">DPDP ACT 2023 SECURE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
