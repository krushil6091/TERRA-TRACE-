import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';
import type { RecordType, DatasetPreviewResponse, DatasetRowPreview } from '../types';
import { InfoTooltip } from './common/InfoTooltip';

interface DatasetForensicInspectorProps {
  onInspectCandidate?: (candidateId: string) => void;
}

export const DatasetForensicInspector: React.FC<DatasetForensicInspectorProps> = ({
  onInspectCandidate,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<RecordType>('server');
  const [onlyFlagged, setOnlyFlagged] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const [previewData, setPreviewData] = useState<DatasetPreviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dataset preview
  const fetchPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const offset = (page - 1) * pageSize;
      const res = await api.getDatasetPreview(selectedType, {
        limit: pageSize,
        offset,
        onlyFlagged,
        search: searchQuery.trim() || undefined,
      });
      setPreviewData(res);
    } catch (err: any) {
      console.error('Dataset preview fetch error:', err);
      setError(
        typeof err === 'string'
          ? err
          : err?.message || 'Failed to load dataset. Please ensure the dataset is ingested.'
      );
      setPreviewData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedType, page, pageSize, onlyFlagged, searchQuery]);

  // Refetch when parameters change
  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  // Reset page when switching dataset or toggles
  const handleTypeChange = (type: RecordType) => {
    setSelectedType(type);
    setPage(1);
  };

  const handleToggleFlagged = (flaggedOnly: boolean) => {
    setOnlyFlagged(flaggedOnly);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  // Export audited CSV
  const handleExportCsv = () => {
    if (!previewData || !previewData.rows.length) return;

    const headers = [...previewData.columns, 'is_proven_wrong', 'discrepancy_verdict', 'flagged_columns'];
    const csvRows = [headers.join(',')];

    for (const r of previewData.rows) {
      const rowVals = previewData.columns.map((c) => {
        const val = r.data[c] !== undefined && r.data[c] !== null ? String(r.data[c]) : '';
        // Escape quotes
        return `"${val.replace(/"/g, '""')}"`;
      });

      rowVals.push(`"${r.is_proven_wrong ? 'FLAGGED_TAMPERED' : 'VERIFIED_VALID'}"`);
      rowVals.push(`"${(r.verdict || '').replace(/"/g, '""')}"`);
      rowVals.push(`"${r.highlighted_columns.join('; ')}"`);

      csvRows.push(rowVals.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audited_${selectedType}_forensic_records.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalPages = useMemo(() => {
    if (!previewData) return 1;
    return Math.max(1, Math.ceil(previewData.total_rows / pageSize));
  }, [previewData, pageSize]);

  return (
    <div className="bg-[#FFFFFF] border-2 border-[#0B1F3A]/20 rounded-[2px] shadow-sm overflow-hidden">
      {/* Institutional Header Banner with Dropdown Toggle */}
      <div className="bg-[#0B1F3A] text-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 select-none border-b border-[#0B1F3A]/40">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 cursor-pointer text-left flex-1 group"
        >
          <div className="p-2 bg-white/10 group-hover:bg-white/15 rounded-[2px] text-[#C9A227] shrink-0 transition-colors">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base tracking-wide text-[#F7F5F0]">
                Raw Dataset Forensic Inspector
              </h3>
              <span className="font-mono text-[10px] bg-[#C9A227]/20 text-[#C9A227] px-2 py-0.5 rounded-[2px] uppercase font-bold border border-[#C9A227]/30">
                Live Audit Stream
              </span>
            </div>
            <p className="text-xs text-[#F7F5F0]/70 font-sans mt-0.5">
              Inspect raw exam files directly. Columns and cells proven wrong by forensic checks are highlighted in crimson with full mathematical proof.
            </p>
          </div>
        </button>

        {/* Global Controls / Export & Chevron Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {isExpanded && (
            <>
              <button
                type="button"
                onClick={() => fetchPreview()}
                disabled={loading}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-sans text-[#F7F5F0] rounded-[2px] border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh dataset view"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Reload</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                disabled={!previewData || !previewData.rows.length}
                className="px-3 py-1.5 bg-[#C9A227] hover:bg-[#C9A227]/90 text-[#0B1F3A] font-bold text-xs font-sans rounded-[2px] flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                title="Export annotated CSV with forensic verdicts"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Annotated CSV</span>
              </button>
            </>
          )}

          {/* Same Dropdown Arrow Toggle Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-sans font-medium text-[#F7F5F0] rounded-[2px] border border-white/20 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Hide Raw Datasets' : 'Watch Raw Datasets'}</span>
            <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-4 h-4 text-[#C9A227]" />
            </div>
          </button>
        </div>
      </div>

      {/* Collapsible Inspector Content */}
      {isExpanded && (
        <div className="animate-in fade-in duration-150">

      {/* Dataset Selection Tabs & Audit Legend */}
      <div className="bg-[#F7F5F0] border-b border-[#5C6670]/30 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Dataset Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange('server')}
            className={`px-3 py-2 text-xs font-mono font-medium rounded-[2px] border transition-all cursor-pointer flex items-center gap-2 ${
              selectedType === 'server'
                ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-sm'
                : 'bg-white text-[#1A1A1A] border-[#5C6670]/40 hover:bg-[#F7F5F0]'
            }`}
          >
            <span>server.csv</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-[2px] font-sans ${
                selectedType === 'server'
                  ? 'bg-[#8A1538] text-white font-bold'
                  : 'bg-rose-100 text-[#8A1538] font-bold'
              }`}
            >
              Score Tabulations
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('omr')}
            className={`px-3 py-2 text-xs font-mono font-medium rounded-[2px] border transition-all cursor-pointer flex items-center gap-2 ${
              selectedType === 'omr'
                ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-sm'
                : 'bg-white text-[#1A1A1A] border-[#5C6670]/40 hover:bg-[#F7F5F0]'
            }`}
          >
            <span>omr.csv</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-[2px] font-sans ${
                selectedType === 'omr'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-amber-100 text-amber-800 font-bold'
              }`}
            >
              Paper Bubble Scans
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('seating')}
            className={`px-3 py-2 text-xs font-mono font-medium rounded-[2px] border transition-all cursor-pointer flex items-center gap-2 ${
              selectedType === 'seating'
                ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-sm'
                : 'bg-white text-[#1A1A1A] border-[#5C6670]/40 hover:bg-[#F7F5F0]'
            }`}
          >
            <span>seating.csv</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-[2px] font-sans ${
                selectedType === 'seating'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-blue-100 text-blue-800 font-bold'
              }`}
            >
              Room Layouts
            </span>
          </button>
        </div>

        {/* Legend Banner */}
        <div className="flex items-center gap-4 text-xs font-sans">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 bg-rose-100 border border-[#8A1538] rounded-[2px]" />
            <span className="text-[#8A1538] font-bold">Crimson Cell</span>
            <span className="text-[#5C6670]">= Discrepancy / Injected Data</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 bg-emerald-50 border border-emerald-400 rounded-[2px]" />
            <span className="text-emerald-800 font-medium">Standard Cell</span>
            <span className="text-[#5C6670]">= Clean Data</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-3 bg-[#FFFFFF] border-b border-[#5C6670]/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C6670]" />
          <input
            type="text"
            placeholder="Search candidate ID, centre, room, score..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] text-xs font-mono text-[#1A1A1A] focus:outline-none focus:border-[#0B1F3A] focus:bg-white"
          />
        </div>

        {/* Filter Mode Buttons */}
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-[2px] border border-[#5C6670]/40 p-0.5 bg-[#F7F5F0]">
            <button
              type="button"
              onClick={() => handleToggleFlagged(false)}
              className={`px-3 py-1 text-xs font-sans rounded-[2px] transition-colors cursor-pointer ${
                !onlyFlagged
                  ? 'bg-[#0B1F3A] text-white font-bold'
                  : 'text-[#5C6670] hover:text-[#1A1A1A]'
              }`}
            >
              All Records {previewData ? `(${previewData.total_rows})` : ''}
            </button>
            <button
              type="button"
              onClick={() => handleToggleFlagged(true)}
              className={`px-3 py-1 text-xs font-sans rounded-[2px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                onlyFlagged
                  ? 'bg-[#8A1538] text-white font-bold'
                  : 'text-[#8A1538] hover:bg-rose-50 font-semibold'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                Proven Wrong Only{' '}
                {previewData ? `(${previewData.flagged_rows_count})` : ''}
              </span>
            </button>
          </div>

          {/* Page size dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-[#5C6670] font-sans">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-[#F7F5F0] border border-[#5C6670]/40 px-2 py-1 rounded-[2px] text-xs font-mono text-[#1A1A1A] focus:outline-none focus:border-[#0B1F3A]"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content Area */}
      {loading ? (
        <div className="p-12 text-center text-[#5C6670] flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#0B1F3A]" />
          <p className="text-xs font-mono">Cross-checking raw records with forensic engine...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50/50 border-b border-rose-200 text-[#8A1538]">
          <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-[#8A1538]" />
          <p className="text-sm font-serif font-bold">Dataset Inspection Unavailable</p>
          <p className="text-xs font-sans text-[#5C6670] mt-1 max-w-md mx-auto">{error}</p>
        </div>
      ) : !previewData || previewData.rows.length === 0 ? (
        <div className="p-12 text-center text-[#5C6670] flex flex-col items-center justify-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-[#5C6670]/40" />
          <p className="text-sm font-serif text-[#1A1A1A]">No matching records found</p>
          <p className="text-xs font-sans text-[#5C6670]">
            Try adjusting your search filter or switch to &apos;All Records&apos;.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B1F3A] text-white text-[11px] font-mono uppercase tracking-wider border-b border-[#0B1F3A]">
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                {previewData.columns.map((col) => (
                  <th key={col} className="py-2.5 px-3">
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
                <th className="py-2.5 px-4 min-w-[320px]">Forensic Finding / Proof of Tampering</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5C6670]/20 text-xs font-mono">
              {previewData.rows.map((rowPreview: DatasetRowPreview, idx: number) => {
                const rowNum = (page - 1) * pageSize + idx + 1;
                const candId = String(rowPreview.data['candidate_id'] || '');
                const isFlagged = rowPreview.is_proven_wrong;

                return (
                  <tr
                    key={`${candId}-${idx}`}
                    className={`transition-colors ${
                      isFlagged
                        ? 'bg-rose-50/40 hover:bg-rose-50/70 border-l-4 border-l-[#8A1538]'
                        : 'hover:bg-[#F7F5F0]/80'
                    }`}
                  >
                    {/* Index */}
                    <td className="py-2 px-3 text-center text-[#5C6670] font-mono text-[11px]">
                      {rowNum}
                    </td>

                    {/* Data Columns */}
                    {previewData.columns.map((col) => {
                      const val = rowPreview.data[col];
                      const isColHighlighted = rowPreview.highlighted_columns.includes(col);
                      const displayVal =
                        val === null || val === undefined
                          ? '—'
                          : typeof val === 'number'
                          ? Number.isInteger(val)
                            ? val
                            : val.toFixed(1)
                          : String(val);

                      return (
                        <td key={col} className="py-2 px-3 align-middle">
                          {isColHighlighted ? (
                            <span
                              className="inline-flex items-center gap-1 bg-rose-100 text-[#8A1538] font-bold px-2 py-0.5 rounded-[2px] border border-[#8A1538]/40 shadow-xs"
                              title={`Proven wrong by investigation: ${rowPreview.verdict || 'Anomalous value'}`}
                            >
                              <AlertTriangle className="w-3 h-3 text-[#8A1538] shrink-0" />
                              <span>{displayVal}</span>
                            </span>
                          ) : (
                            <span className="text-[#1A1A1A]">{displayVal}</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Forensic Finding / Verdict */}
                    <td className="py-2 px-4 align-middle font-sans">
                      {isFlagged ? (
                        <div className="flex items-center justify-between gap-2 p-1.5 bg-[#8A1538]/10 border border-[#8A1538]/30 rounded-[2px]">
                          <div className="flex items-center gap-1.5 text-xs text-[#8A1538] font-medium leading-snug">
                            <AlertTriangle className="w-3.5 h-3.5 text-[#8A1538] shrink-0" />
                            <span>{rowPreview.verdict || 'Proven inconsistent with physical evidence'}</span>
                          </div>
                          <InfoTooltip
                            technicalTerm="Reconciliation Discrepancy"
                            formula={
                              rowPreview.evidence_diff
                                ? Object.entries(rowPreview.evidence_diff)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(' | ')
                                : undefined
                            }
                            courtPrecedent="Section 65B IEA / Kolkata HC WBSSC Order"
                            explanation={
                              rowPreview.verdict ||
                              'A discrepancy between digital publication and original paper logs constitutes prima facie evidence of database tampering.'
                            }
                            position="left"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-300/40 px-2 py-0.5 rounded-[2px] w-fit font-mono">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Consistent with Evidence</span>
                        </div>
                      )}
                    </td>

                    {/* Quick Drilldown Action */}
                    <td className="py-2 px-3 text-right align-middle">
                      {candId && onInspectCandidate ? (
                        <button
                          type="button"
                          onClick={() => onInspectCandidate(candId)}
                          className="px-2 py-1 bg-[#F7F5F0] hover:bg-[#0B1F3A] hover:text-white border border-[#5C6670]/40 text-[#0B1F3A] text-xs font-sans rounded-[2px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title={`Inspect full forensic dossier for ${candId}`}
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination & Summary Footer */}
      {previewData && previewData.total_rows > 0 && (
        <div className="bg-[#F7F5F0] border-t border-[#5C6670]/30 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
          <div className="text-[#5C6670]">
            Showing <strong className="text-[#1A1A1A] font-mono">{(page - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-[#1A1A1A] font-mono">
              {Math.min(page * pageSize, previewData.total_rows)}
            </strong>{' '}
            of <strong className="text-[#1A1A1A] font-mono">{previewData.total_rows}</strong> rows in{' '}
            <strong className="font-mono text-[#0B1F3A]">{previewData.filename}</strong>{' '}
            {previewData.flagged_rows_count > 0 && (
              <span className="text-[#8A1538] font-bold">
                ({previewData.flagged_rows_count} proven tampered)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2.5 py-1 bg-white border border-[#5C6670]/40 rounded-[2px] text-xs font-sans text-[#1A1A1A] hover:bg-[#F7F5F0] disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-2 py-1 font-mono text-xs text-[#0B1F3A] bg-white border border-[#5C6670]/30 rounded-[2px]">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2.5 py-1 bg-white border border-[#5C6670]/40 rounded-[2px] text-xs font-sans text-[#1A1A1A] hover:bg-[#F7F5F0] disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
};
