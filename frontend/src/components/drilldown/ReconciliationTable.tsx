import React, { useState } from 'react';
import { Layers, AlertTriangle } from 'lucide-react';
import type { ReconciliationDetail } from '../../types';

interface ReconciliationTableProps {
  reconciliation: ReconciliationDetail;
}

export const ReconciliationTable: React.FC<ReconciliationTableProps> = ({ reconciliation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-5 space-y-4 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#5C6670]/30">
        <div className="flex items-center gap-2">
          {/* Functional Layer 1 Pipeline Icon */}
          <Layers className="w-4 h-4 text-[#0B1F3A]" />
          <h4 className="text-sm font-bold text-[#0B1F3A] font-serif">
            Layer 1: Reconciliation Audit (Raw OMR vs Server Published Record)
          </h4>
        </div>

        {/* Status Badge: Solid Red with word on it ONLY when tamper_flag is true */}
        {reconciliation.tamper_flag ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] bg-[#8A1538] text-white text-xs font-bold font-sans">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Tamper detected</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] bg-[#5C6670] text-white text-xs font-bold font-sans">
            <span>Verified congruent</span>
          </div>
        )}
      </div>

      {/* Side-by-Side Summary Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Raw Score */}
        <div className="bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] p-3 text-left">
          <div className="text-[10px] text-[#5C6670] uppercase font-sans">
            Calculated Raw OMR Sum
          </div>
          <div className="text-xl font-bold font-mono text-[#0B1F3A] mt-1">
            {reconciliation.raw_total_score} marks
          </div>
          <div className="text-[10px] text-[#5C6670] mt-0.5 font-sans">
            Recalculated directly from item-level response logs
          </div>
        </div>

        {/* Server Published Score */}
        <div className="bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] p-3 text-left">
          <div className="text-[10px] text-[#5C6670] uppercase font-sans">
            Official Server Published Score
          </div>
          <div className="text-xl font-bold font-mono text-[#0B1F3A] mt-1">
            {reconciliation.server_score} marks
          </div>
          <div className="text-[10px] text-[#5C6670] mt-0.5 font-sans">
            Extracted from published tabulation database
          </div>
        </div>

        {/* Score Discrepancy (Delta) */}
        <div className={`p-3 rounded-[2px] border text-left ${
          reconciliation.tamper_flag
            ? 'bg-[#FFFFFF] border-[#8A1538]'
            : 'bg-[#F7F5F0] border-[#5C6670]/40'
        }`}>
          <div className="text-[10px] uppercase font-sans text-[#5C6670]">
            Discrepancy (Delta &Delta;)
          </div>
          <div className={`text-xl font-bold font-mono mt-1 ${
            reconciliation.tamper_flag ? 'text-[#8A1538]' : 'text-[#0B1F3A]'
          }`}>
            {reconciliation.score_discrepancy > 0 ? `+${reconciliation.score_discrepancy}` : reconciliation.score_discrepancy} marks
          </div>
          <div className="text-[10px] font-mono text-[#5C6670] mt-0.5">
            Type: {reconciliation.tamper_type}
          </div>
        </div>
      </div>

      {/* Tamper Explanation Statement */}
      <div className={`p-3 rounded-[2px] border text-xs font-sans leading-relaxed ${
        reconciliation.tamper_flag
          ? 'bg-[#FFFFFF] border-[#8A1538] text-[#8A1538]'
          : 'bg-[#F7F5F0] border-[#5C6670]/40 text-[#1A1A1A]'
      }`}>
        <strong className="font-semibold">Forensic Finding: </strong>
        {reconciliation.tamper_explanation}
      </div>

      {/* Item-Level Responses Collapsible Table */}
      {reconciliation.question_items && reconciliation.question_items.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#5C6670]/30">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-mono font-medium text-[#0B1F3A] hover:underline cursor-pointer flex items-center gap-1.5"
          >
            <span>{isExpanded ? '[-] Hide' : '[+] View'} Item-Level Response Log Breakdown ({reconciliation.question_items.length} questions)</span>
          </button>

          {isExpanded && (
            <div className="max-h-60 overflow-y-auto border border-[#5C6670] rounded-[2px]">
              <table className="w-full text-xs font-sans text-left border-collapse">
                <thead className="bg-[#F7F5F0] border-b border-[#5C6670] sticky top-0 font-mono text-[11px] text-[#0B1F3A]">
                  <tr>
                    <th className="p-2 border-r border-[#5C6670]/30">Question ID</th>
                    <th className="p-2 border-r border-[#5C6670]/30">Candidate Selection</th>
                    <th className="p-2 border-r border-[#5C6670]/30">Raw Marks</th>
                    <th className="p-2">Item Valuation</th>
                  </tr>
                </thead>
                <tbody>
                  {reconciliation.question_items.map((q) => (
                    <tr key={q.question_id} className="border-b border-[#5C6670]/20 hover:bg-[#F7F5F0]">
                      <td className="p-2 font-mono border-r border-[#5C6670]/30">{q.question_id}</td>
                      <td className="p-2 font-mono font-bold text-[#0B1F3A] border-r border-[#5C6670]/30">
                        {q.selected_option || 'Unattempted'}
                      </td>
                      <td className={`p-2 font-mono font-bold border-r border-[#5C6670]/30 ${
                        q.raw_score > 0 ? 'text-[#0B1F3A]' : q.raw_score < 0 ? 'text-[#8A1538]' : 'text-[#5C6670]'
                      }`}>
                        {q.raw_score > 0 ? `+${q.raw_score}` : q.raw_score}
                      </td>
                      <td className="p-2 font-sans text-[#5C6670]">
                        {q.raw_score > 0 ? 'Correct answer' : q.raw_score < 0 ? 'Incorrect (-1.0 negative)' : 'Zero marks'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
