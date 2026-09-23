import React, { useState } from 'react';
import { Grid, User, Shield, Link2, Info, Eye } from 'lucide-react';

interface DeskData {
  id: string;
  row: number;
  col: number;
  deskCode: string;
  candidateId: string;
  score: number;
  isFlagged: boolean;
  partnerId?: string;
  partnerDesk?: string;
  omegaScore?: number;
  sharedWrongCount?: number;
  kIndex?: number;
  status: 'clean' | 'collusion_suspect' | 'absent';
}

export const SeatingDigitalTwin: React.FC = () => {
  const [selectedDesk, setSelectedDesk] = useState<DeskData | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'flagged'>('all');
  const [showExplanation, setShowExplanation] = useState(false);

  const desks: DeskData[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E'];

  for (let r = 1; r <= 5; r++) {
    for (let c = 1; c <= 5; c++) {
      const deskCode = `${rows[r - 1]}-${c < 10 ? '0' + c : c}`;
      const candidateNum = (r - 1) * 5 + c;
      const candidateId = `NEET_24_00${candidateNum < 10 ? '0' + candidateNum : candidateNum}`;

      const isPair1 = r === 2 && c === 2;
      const isPair2 = r === 2 && c === 3;
      const isPair3 = r === 4 && c === 4;
      const isPair4 = r === 4 && c === 5;
      const isFlagged = isPair1 || isPair2 || isPair3 || isPair4;

      let partnerId: string | undefined;
      let partnerDesk: string | undefined;
      let omegaScore: number | undefined;
      let sharedWrongCount: number | undefined;
      let kIndex: number | undefined;

      if (isPair1) {
        partnerId = 'NEET_24_0008';
        partnerDesk = 'B-03';
        omegaScore = 3.42;
        sharedWrongCount = 8;
        kIndex = 0.0004;
      } else if (isPair2) {
        partnerId = 'NEET_24_0007';
        partnerDesk = 'B-02';
        omegaScore = 3.42;
        sharedWrongCount = 8;
        kIndex = 0.0004;
      } else if (isPair3) {
        partnerId = 'NEET_24_0020';
        partnerDesk = 'D-05';
        omegaScore = 3.18;
        sharedWrongCount = 7;
        kIndex = 0.0008;
      } else if (isPair4) {
        partnerId = 'NEET_24_0019';
        partnerDesk = 'D-04';
        omegaScore = 3.18;
        sharedWrongCount = 7;
        kIndex = 0.0008;
      }

      desks.push({
        id: `desk-${r}-${c}`,
        row: r,
        col: c,
        deskCode,
        candidateId,
        score: isFlagged ? 685 : Math.floor(340 + ((r * 13 + c * 17) % 280)),
        isFlagged,
        partnerId,
        partnerDesk,
        omegaScore,
        sharedWrongCount,
        kIndex,
        status: isFlagged ? 'collusion_suspect' : 'clean',
      });
    }
  }

  const activeDesk = selectedDesk || desks.find((d) => d.isFlagged) || desks[0];

  return (
    <div className="bg-[#0A192F] border border-[#1E293B] rounded-[2px] p-5 text-white space-y-4 shadow-md font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#C9A227]/15 border border-[#C9A227]/40 rounded-[2px] text-[#C9A227]">
            <Grid className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-[#F7F5F0]">
                Spatial Seating Digital Twin — Exam Hall 104
              </span>
              <span className="text-[9px] font-mono text-[#C9A227] bg-[#C9A227]/15 border border-[#C9A227]/40 px-1.5 py-0.5 rounded uppercase font-semibold">
                Wollack &omega; &amp; Holland K Layer
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Interactive 2D classroom layout. Evaluates pair-wise Euclidean adjacency against binomial shared distractor probabilities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#071324] p-1 border border-[#1E293B] rounded-[2px] text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded-[2px] cursor-pointer transition-colors ${
              filterMode === 'all'
                ? 'bg-[#0B1F3A] text-white border border-[#38BDF8]/40 font-bold'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            All 25 Desks
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('flagged')}
            className={`px-2.5 py-1 rounded-[2px] cursor-pointer transition-colors ${
              filterMode === 'flagged'
                ? 'bg-[#8A1538] text-white font-bold shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Collusion Pairs Only (2 Pairs)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 bg-[#071324] border border-[#1E293B] rounded-[2px] p-4 relative overflow-hidden">
          <div className="w-full py-1 mb-4 bg-[#0A192F] border border-[#334155] rounded-[2px] text-center text-[10px] font-mono text-slate-400 tracking-wider uppercase">
            ▲ INVIGILATOR ROSTRUM &amp; CCTV CAMERA 01-A (EXAM FRONT) ▲
          </div>

          <div className="grid grid-cols-5 gap-2 relative">
            {desks.map((d) => {
              const isSelected = activeDesk.id === d.id;
              const isDimmed = filterMode === 'flagged' && !d.isFlagged;

              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDesk(d)}
                  className={`relative p-2.5 rounded-[2px] border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                    isDimmed
                      ? 'opacity-20 bg-[#071324] border-[#1E293B]'
                      : d.isFlagged
                      ? isSelected
                        ? 'bg-[#8A1538] border-rose-400 shadow-lg ring-2 ring-rose-400/50'
                        : 'bg-[#8A1538]/30 border-rose-500/70 hover:bg-[#8A1538]/50 shadow-sm'
                      : isSelected
                      ? 'bg-[#0B1F3A] border-[#38BDF8] ring-1 ring-[#38BDF8]'
                      : 'bg-[#0A192F] border-[#1E293B] hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-[10px] font-bold text-slate-400">
                      {d.deskCode}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        d.isFlagged
                          ? 'bg-rose-500 animate-pulse'
                          : 'bg-emerald-500/70'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-1 mt-1 text-[10px] font-mono">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="truncate text-slate-300">
                      {d.candidateId.replace('NEET_24_', '')}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[9px] font-mono">
                    <span className={d.isFlagged ? 'text-rose-300 font-bold' : 'text-slate-400'}>
                      {d.score}m
                    </span>
                    {d.isFlagged && (
                      <span className="text-[8px] bg-rose-950/80 text-rose-300 px-1 py-0.2 rounded border border-rose-800">
                        &omega;=3.4
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-[#1E293B]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>Collusion Suspects: 4 Desks (Pairwise Euclidean Distance = 1.0m)</span>
            </div>
            <span className="text-[#C9A227]">Click any desk to inspect evidence</span>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#071324] border border-[#1E293B] rounded-[2px] p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#C9A227]" />
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Desk Inspector HUD
              </span>
            </div>
            <span className="font-mono text-xs text-[#C9A227] font-bold px-2 py-0.5 bg-[#C9A227]/15 border border-[#C9A227]/40 rounded">
              {activeDesk.deskCode}
            </span>
          </div>

          <div className="p-3 bg-[#0A192F] border border-[#1E293B] rounded-[2px] space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Candidate Roll:</span>
              <strong className="text-white font-mono">{activeDesk.candidateId}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Reported Score:</span>
              <strong className={activeDesk.isFlagged ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                {activeDesk.score} / 720 marks
              </strong>
            </div>
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Status:</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  activeDesk.isFlagged
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {activeDesk.isFlagged ? 'Collusion Flagged' : 'Normal Sitting'}
              </span>
            </div>
          </div>

          {activeDesk.isFlagged ? (
            <div className="p-3 bg-[#8A1538]/20 border border-rose-500/50 rounded-[2px] space-y-2.5 font-mono text-xs">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px] uppercase">
                <Link2 className="w-3.5 h-3.5" />
                <span>Adjacent Desk Link Identified</span>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-400">Colluding Partner:</span>
                  <strong className="text-amber-400">{activeDesk.partnerId} ({activeDesk.partnerDesk})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Wollack Omega (&omega;):</span>
                  <strong className="text-rose-400 font-bold">{activeDesk.omegaScore} (Threshold &ge; 3.0)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Shared Wrong Options:</span>
                  <strong className="text-white">{activeDesk.sharedWrongCount} identical distractors</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Holland K Probability:</span>
                  <strong className="text-rose-400 font-bold">p = {activeDesk.kIndex} (&lt; 0.001)</strong>
                </div>
              </div>

              <div className="p-2 bg-[#0A192F] border border-rose-500/30 rounded text-[10px] text-slate-300 leading-snug">
                <strong className="text-rose-400">Forensic Deduction: </strong>
                Probability of two adjacent candidates independently choosing these exact 8 wrong answers by coincidence is less than 1 in 2,500. Strongly indicates direct optical or verbal copying in Hall 104.
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#0A192F] border border-[#1E293B] rounded text-xs text-slate-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>No statistical collusion flags detected for this desk. Neighboring distractor patterns align with independent responding.</span>
            </div>
          )}

          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-[10px] font-mono text-[#C9A227] hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <Info className="w-3 h-3" />
              <span>{showExplanation ? 'Hide Collusion Math' : 'How does Wollack Omega work?'}</span>
            </button>
          </div>

          {showExplanation && (
            <div className="p-2.5 bg-[#0A192F] border-l-2 border-[#C9A227] text-[10px] text-slate-300 leading-relaxed font-sans">
              <strong className="text-white font-mono">Wollack Omega (1997): </strong>
              Evaluates the number of shared incorrect responses between candidate pairs. Given Candidate A's responses, it calculates the binomial expectation of matching wrong options by chance. When actual shared errors exceed 3 standard deviations (&omega; &ge; 3.0), it serves as courtroom-admissible evidence of copying.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
