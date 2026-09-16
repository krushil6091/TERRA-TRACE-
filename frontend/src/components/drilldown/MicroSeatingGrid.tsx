import React from 'react';
import { Grid } from 'lucide-react';
import type { MicroSeatingData } from '../../types';

interface MicroSeatingGridProps {
  micro: MicroSeatingData;
}

export const MicroSeatingGrid: React.FC<MicroSeatingGridProps> = ({ micro }) => {
  return (
    <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-5 space-y-4 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#5C6670]/30">
        <div className="flex items-center gap-2">
          {/* Functional Layer 3 Pipeline Icon */}
          <Grid className="w-4 h-4 text-[#0B1F3A]" />
          <h4 className="text-sm font-bold text-[#0B1F3A] font-serif">
            Layer 3: Micro Spatial Seating Layout (Room {micro.room_id})
          </h4>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-sans text-[#5C6670]">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-[#0B1F3A] rounded-[2px] inline-block" />
            <span className="text-[#1A1A1A]">Target candidate</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-[#8A1538] rounded-[2px] inline-block" />
            <span className="text-[#1A1A1A]">Flagged collusion cluster</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] inline-block" />
            <span className="text-[#1A1A1A]">Normal cohort</span>
          </span>
        </div>
      </div>

      {/* 2D Spatial Grid (Seats 1 to N) */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2 p-3 bg-[#F7F5F0] rounded-[2px] border border-[#5C6670]/40">
        {micro.candidates.map((cand) => {
          const isTarget = cand.is_target;
          const isFlagged = cand.is_flagged_pair;

          let cardStyle = 'bg-[#FFFFFF] border border-[#5C6670] text-[#1A1A1A]';
          if (isTarget) {
            cardStyle = 'bg-[#0B1F3A] text-white border-2 border-[#0B1F3A] font-bold';
          } else if (isFlagged) {
            cardStyle = 'bg-[#8A1538] text-white border-2 border-[#8A1538] font-bold';
          }

          return (
            <div
              key={cand.seat_number}
              className={`p-2 rounded-[2px] flex flex-col items-center justify-center text-center transition-none ${cardStyle}`}
              title={`Seat #${cand.seat_number}: ${cand.candidate_id} (Score: ${cand.score})`}
            >
              <span className={`text-[10px] font-mono ${isTarget || isFlagged ? 'text-[#F7F5F0]' : 'text-[#5C6670]'}`}>
                #{cand.seat_number}
              </span>
              <span className="text-[11px] font-mono font-bold mt-0.5 truncate max-w-full">
                {cand.score} pts
              </span>
            </div>
          );
        })}
      </div>

      {/* Flagged Collusion Pairs Table */}
      {micro.collusion_pairs && micro.collusion_pairs.length > 0 ? (
        <div className="space-y-2 pt-2 border-t border-[#5C6670]/30">
          <div className="text-xs font-semibold text-[#8A1538] font-sans uppercase tracking-wider">
            Flagged Adjacent Collusion Pair Findings:
          </div>
          <div className="space-y-2">
            {micro.collusion_pairs.map((pair, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#FFFFFF] border border-[#8A1538] rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans"
              >
                <div>
                  <div className="font-mono font-bold text-[#0B1F3A]">
                    {pair.candidate_1} (Seat #{pair.seat_1}) &harr; {pair.candidate_2} (Seat #{pair.seat_2})
                  </div>
                  <div className="text-[#5C6670] mt-0.5">
                    Physical Distance: <strong className="text-[#1A1A1A]">{pair.distance} seat</strong> &bull; Shared Incorrect Answers: <strong className="text-[#8A1538]">{pair.shared_incorrect_answers}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#8A1538] text-white font-mono rounded-[2px] text-[10px] font-bold">
                    Wollack &omega; = {pair.omega_index_approx.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-[#5C6670] font-sans">
                    {pair.evidence_note}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] text-xs font-sans text-[#5C6670]">
          No adjacent pairwise answer copying cluster detected in Room {micro.room_id}. Spatial seating baseline congruent.
        </div>
      )}
    </div>
  );
};
