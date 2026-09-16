import React from 'react';
import { DetectionResultsView } from './DetectionResultsView';

export const PipelineView: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      <DetectionResultsView />

      {/* Composite Scoring Model Note */}
      <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-5 space-y-2">
        <h4 className="text-sm font-bold text-[#0B1F3A] font-serif">
          Centralized Decision-Support Weighting
        </h4>
        <p className="text-xs text-[#5C6670] font-sans leading-relaxed">
          Composite score formula: <code className="bg-[#F7F5F0] border border-[#5C6670]/40 px-1.5 py-0.5 font-mono text-[#0B1F3A] rounded-[2px]">CombinedRisk = (0.45 &times; Reconciliation) + (0.35 &times; Macro) + (0.20 &times; Micro)</code>. Every output is routed to human investigators for statutory adjudication with zero automated disqualifications.
        </p>
      </div>
    </div>
  );
};