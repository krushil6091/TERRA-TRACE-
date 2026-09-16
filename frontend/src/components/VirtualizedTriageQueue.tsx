import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { AlertTriangle } from 'lucide-react';
import { useTriageStore } from '../stores/triageStore';
import { useDrilldownStore } from '../stores/drilldownStore';
import type { InvestigationStatus } from '../types';

export const VirtualizedTriageQueue: React.FC = () => {
  const {
    items,
    total,
    page,
    totalPages,
    statusFilter,
    searchQuery,
    minRiskFilter,
    selectedCentreId,
    isLoading,
    setStatusFilter,
    setSearchQuery,
    setMinRiskFilter,
    setPage,
    openDecisionModal,
  } = useTriageStore();

  const { openDrilldown } = useDrilldownStore();
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140,
    overscan: 5,
  });

  const getStatusBadge = (status: InvestigationStatus) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-mono font-medium bg-[#FFFFFF] border border-[#8A1538] text-[#8A1538]">
            <span className="w-2 h-2 rounded-full inline-block mr-1.5 bg-[#8A1538] shrink-0" />
            Confirmed
          </span>
        );
      case 'False Positive':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-mono font-medium bg-[#FFFFFF] border border-[#5C6670] text-[#5C6670]">
            <span className="w-2 h-2 rounded-full inline-block mr-1.5 bg-[#5C6670] shrink-0" />
            False Positive
          </span>
        );
      case 'Escalated':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-mono font-medium bg-[#FFFFFF] border border-[#0B1F3A] text-[#0B1F3A]">
            <span className="w-2 h-2 rounded-full inline-block mr-1.5 bg-[#0B1F3A] shrink-0" />
            Escalated
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-mono font-medium bg-[#FFFFFF] border border-[#C9A227] text-[#C9A227]">
            <span className="w-2 h-2 rounded-full inline-block mr-1.5 bg-[#C9A227] shrink-0" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-3.5 sm:p-5 space-y-4 text-left">
      {/* Table Header & Search Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#5C6670]/30">
        <div>
          <div className="text-[10px] font-mono text-[#5C6670] uppercase font-bold tracking-wider">
            STATUTORY ADJUDICATION REGISTER & EVIDENTIARY ROSTER
          </div>
          <h3 className="text-base font-bold text-[#0B1F3A] font-serif mt-0.5">
            Individual Candidate Forensic Triage Queue
          </h3>
          <p className="text-xs text-[#5C6670] font-sans mt-0.5">
            Displaying <strong className="font-mono text-[#1A1A1A]">{items.length}</strong> loaded of{' '}
            <strong className="font-mono text-[#1A1A1A]">{total.toLocaleString()}</strong> prioritized candidate files across all 3 analytical layers.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search Candidate ID, Centre, City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-1.5 text-xs bg-[#F7F5F0] border border-[#5C6670] rounded-[2px] text-[#1A1A1A] focus:outline-none focus:border-[#0B1F3A] w-full sm:w-60 font-mono"
          />

          <div className="flex items-center gap-2">
            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvestigationStatus | 'All')}
              className="flex-1 sm:flex-initial px-2.5 py-1.5 text-xs bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] text-[#1A1A1A] focus:outline-none focus:border-[#0B1F3A] font-sans cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Confirmed">Confirmed</option>
              <option value="False Positive">Cleared</option>
              <option value="Escalated">Escalated</option>
            </select>

            {/* Minimum Risk Filter */}
            <select
              value={minRiskFilter}
              onChange={(e) => setMinRiskFilter(Number(e.target.value))}
              className="flex-1 sm:flex-initial px-2.5 py-1.5 text-xs bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] text-[#1A1A1A] focus:outline-none focus:border-[#0B1F3A] font-sans cursor-pointer"
            >
              <option value={0}>All Risk</option>
              <option value={20}>Risk &ge; 20</option>
              <option value={40}>Risk &ge; 40</option>
              <option value={70}>Risk &ge; 70</option>
            </select>
          </div>
        </div>
      </div>

      {/* Virtualized Table Container */}
      {isLoading ? (
        <div className="h-96 flex items-center justify-center bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px]">
          <span className="text-xs text-[#5C6670] font-sans">
            Loading case records from database...
          </span>
        </div>
      ) : items.length === 0 ? (
        <div className="h-64 flex items-center justify-center bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] p-6 text-center">
          <p className="text-xs text-[#5C6670] font-sans">
            No flagged results yet — ingest exam data to begin an audit.
          </p>
        </div>
      ) : (
        <div
          ref={parentRef}
          className="h-[520px] overflow-auto border border-[#5C6670] rounded-[2px] bg-[#FFFFFF]"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = items[virtualRow.index];
              if (!item) return null;

              const isHighlighted = selectedCentreId && item.centre_id === selectedCentreId;

              return (
                <div
                  key={item.entity_id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className={`p-3 sm:p-4 border-b border-[#5C6670]/30 flex flex-col justify-between text-left transition-colors duration-150 ${
                    isHighlighted
                      ? 'bg-[#C9A227]/10 animate-row-flash'
                      : 'hover:bg-[#F7F5F0]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    {/* Left: Candidate ID, Location & Status */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => openDrilldown(item.entity_id)}
                        className="font-mono text-sm font-bold text-[#0B1F3A] hover:underline cursor-pointer"
                        title="Click to view full forensic case dossier"
                      >
                        {item.entity_id}
                      </button>

                      <span className="text-xs text-[#5C6670] font-sans">
                        {item.centre_id} &bull; {item.city_name}, {item.state_name} (R{item.room_id}, #{item.seat_number})
                      </span>

                      {getStatusBadge(item.status)}
                    </div>

                    {/* Right: Risk Score & Action Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-[#5C6670]/15">
                      {/* Weighted Risk Score & Fill Bar */}
                      <div className="text-left sm:text-right">
                        <div className="text-[9px] sm:text-[10px] font-sans text-[#5C6670] uppercase">
                          Risk Score
                        </div>
                        <div className={`font-mono text-xs sm:text-sm font-bold ${
                          item.combined_risk_score >= 40
                            ? 'text-[#8A1538]'
                            : item.combined_risk_score >= 20
                            ? 'text-[#C9A227]'
                            : 'text-[#0B1F3A]'
                        }`}>
                          {item.combined_risk_score.toFixed(1)} / 100
                        </div>
                        {/* Mini Visual Fill Bar */}
                        <div className="w-16 sm:w-20 h-1 bg-[#5C6670]/20 rounded-[2px] mt-0.5 sm:mt-1 sm:ml-auto overflow-hidden">
                          <div
                            className={`h-full rounded-[2px] ${
                              item.combined_risk_score >= 40
                                ? 'bg-[#8A1538]'
                                : item.combined_risk_score >= 20
                                ? 'bg-[#C9A227]'
                                : 'bg-[#0B1F3A]'
                            }`}
                            style={{ width: `${Math.min(item.combined_risk_score, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Action 1: Inspect Dossier (Secondary Button) */}
                      <button
                        type="button"
                        onClick={() => openDrilldown(item.entity_id)}
                        className="flex-1 sm:flex-initial text-center px-2.5 sm:px-3 py-1.5 border border-[#0B1F3A] text-[#0B1F3A] bg-transparent hover:bg-[#0B1F3A]/5 text-xs font-mono font-medium rounded-[2px] cursor-pointer"
                      >
                        Inspect
                      </button>

                      {/* Action 2: Human Adjudication (Primary Button) */}
                      <button
                        type="button"
                        onClick={() => openDecisionModal(item, item.status === 'Pending' ? 'Confirmed' : item.status)}
                        className="flex-1 sm:flex-initial text-center px-3 sm:px-3.5 py-1.5 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white text-xs font-mono uppercase font-bold rounded-[2px] border border-[#0B1F3A] cursor-pointer whitespace-nowrap"
                      >
                        Adjudicate
                      </button>
                    </div>
                  </div>

                  {/* Forensic Flags / Evidence */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {item.primary_flags.map((flag, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-mono ${
                          flag.toLowerCase().includes('tamper')
                            ? 'bg-[#8A1538] text-white font-bold'
                            : 'bg-[#F7F5F0] border border-[#5C6670]/40 text-[#1A1A1A]'
                        }`}
                      >
                        {flag.toLowerCase().includes('tamper') && (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {flag}
                      </span>
                    ))}

                    <span className="text-[10px] font-mono text-[#5C6670] ml-auto">
                      Raw: {item.raw_calculated_score ?? '—'} &bull; Pub: {item.server_score ?? '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#5C6670]/30 text-xs font-sans text-[#5C6670]">
        <div>
          Page <strong className="font-mono text-[#1A1A1A]">{page}</strong> of{' '}
          <strong className="font-mono text-[#1A1A1A]">{totalPages}</strong> ({total.toLocaleString()} total items)
        </div>

        <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border border-[#0B1F3A] text-[#0B1F3A] bg-transparent rounded-[2px] disabled:opacity-30 cursor-pointer"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border border-[#0B1F3A] text-[#0B1F3A] bg-transparent rounded-[2px] disabled:opacity-30 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
