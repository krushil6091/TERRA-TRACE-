import React from 'react';
import { useTriageStore } from '../stores/triageStore';
import { AnimatedCounter } from './common/AnimatedCounter';
import type { InvestigationStatus } from '../types';

export const TriageSummaryCards: React.FC = () => {
  const { summary, statusFilter, setStatusFilter } = useTriageStore();

  const cards: {
    id: string;
    label: string;
    count: number;
    dotColor: string;
    statusText: string;
    metaLine: string;
    topColor: string;
    isHeavy?: boolean;
  }[] = [
    {
      id: 'All',
      label: 'Total Flagged Entities',
      count: summary.total_flagged,
      dotColor: 'bg-[#0B1F3A]',
      topColor: 'border-t-[#0B1F3A]',
      statusText: 'All Entities',
      metaLine: 'Complete Audit Caseload',
    },
    {
      id: 'Pending',
      label: 'Pending Human Review',
      count: summary.pending,
      dotColor: 'bg-[#C9A227]',
      topColor: 'border-t-[#C9A227]',
      statusText: 'Awaiting Review',
      metaLine: 'Requires Adjudication',
    },
    {
      id: 'Confirmed',
      label: 'Confirmed Tampering',
      count: summary.confirmed,
      dotColor: 'bg-white',
      topColor: 'border-t-[#F43F5E]',
      statusText: 'Substantiated',
      metaLine: 'Statutory Anomaly Verified',
      isHeavy: true,
    },
    {
      id: 'False Positive',
      label: 'Cleared / Congruent',
      count: summary.false_positive,
      dotColor: 'bg-[#5C6670]',
      topColor: 'border-t-[#5C6670]',
      statusText: 'Cleared',
      metaLine: 'Within Standard Variance',
    },
    {
      id: 'Escalated',
      label: 'Escalated Inquiries',
      count: summary.escalated,
      dotColor: 'bg-[#0B1F3A]',
      topColor: 'border-t-[#0B1F3A]',
      statusText: 'Referred',
      metaLine: 'High-Level Board Commission',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => {
        const isSelected = statusFilter === card.id;

        if (card.isHeavy) {
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setStatusFilter(card.id as InvestigationStatus | 'All')}
              className={`p-4 text-left transition-all cursor-pointer flex flex-col justify-between border-t-4 border-t-[#F43F5E] shadow-xs ${
                isSelected
                  ? 'bg-[#8A1538] text-white border-2 border-[#8A1538] ring-2 ring-[#8A1538]'
                  : 'bg-[#8A1538] text-white border border-[#8A1538] hover:bg-[#9E1A42]'
              }`}
            >
              <div>
                <div className="flex items-center text-[11px] font-mono font-bold text-white uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full inline-block mr-1.5 shrink-0 bg-white" />
                  <span>{card.statusText}</span>
                </div>
                <div className="text-xs font-sans text-white/90 mt-1.5 font-medium">
                  {card.label}
                </div>
              </div>

              <div className="mt-3">
                <div className="text-3xl font-serif font-bold text-white tracking-tight">
                  <AnimatedCounter value={card.count} />
                </div>
                <div className="text-[10px] font-mono text-white/80 uppercase mt-0.5 tracking-wider font-semibold">
                  {card.metaLine}
                </div>
              </div>
            </button>
          );
        }

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => setStatusFilter(card.id as InvestigationStatus | 'All')}
            className={`p-4 bg-[#FFFFFF] border-t-4 ${card.topColor} border-r border-b border-l border-[#5C6670]/40 text-left transition-all cursor-pointer flex flex-col justify-between shadow-xs ${
              isSelected
                ? 'bg-[#F7F5F0] border-r-[#0B1F3A] border-b-[#0B1F3A] border-l-[#0B1F3A] ring-1 ring-[#0B1F3A]'
                : 'hover:border-r-[#0B1F3A] hover:border-b-[#0B1F3A] hover:border-l-[#0B1F3A] hover:bg-[#FAFAFA]'
            }`}
          >
            <div>
              <div className="flex items-center text-[11px] font-mono font-bold text-[#1A1A1A]">
                <span className={`w-2 h-2 rounded-full inline-block mr-1.5 shrink-0 ${card.dotColor}`} />
                <span>{card.statusText}</span>
              </div>
              <div className="text-xs font-sans text-[#5C6670] mt-1.5">
                {card.label}
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-serif font-bold text-[#0B1F3A] tracking-tight">
                <AnimatedCounter value={card.count} />
              </div>
              <div className="text-[10px] font-mono text-[#5C6670] uppercase mt-0.5 tracking-wider font-semibold">
                {card.metaLine}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
