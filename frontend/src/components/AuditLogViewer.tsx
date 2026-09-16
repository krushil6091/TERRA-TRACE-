import React, { useState, useEffect } from 'react';
import { useIngestionStore } from '../stores/ingestionStore';
import { WatermarkAnchor } from './common/WatermarkAnchor';
import { AnimatedCounter } from './common/AnimatedCounter';
import { Check, Copy } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const { auditLogs, isLoadingLogs, fetchAuditLogs } = useIngestionStore();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditLogs(filterType === 'all' ? undefined : filterType);
  }, [filterType, fetchAuditLogs]);

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2200);
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.file_hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.uploader_identity.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const successCount = auditLogs.filter((l) => l.status === 'SUCCESS').length;

  return (
    <div className="space-y-5 text-left">
      {/* Oversized Typographic Watermark Header */}
      <WatermarkAnchor
        number="05"
        tagline="IMMUTABLE CRYPTOGRAPHIC CHECKPOINT LEDGER"
        title="Append-Only Ingestion Audit Register"
        subtitle="Cryptographic SHA-256 checkpoints committed immutably upon dataset ingestion. Append-only ledger; zero record modifications, updates, or purging permitted under statutory forensic protocol."
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchAuditLogs(filterType === 'all' ? undefined : filterType)}
              disabled={isLoadingLogs}
              className="px-3.5 py-2 bg-[#0B1F3A] text-white text-xs font-sans font-medium rounded-[2px] border border-[#0B1F3A] hover:bg-[#0B1F3A]/90 cursor-pointer disabled:opacity-50"
            >
              {isLoadingLogs ? 'Refreshing...' : 'Refresh Register'}
            </button>
          </div>
        }
      />

      {/* Full-Bleed Solid Informational Status Strip */}
      <div className="bg-[#0B1F3A] text-white p-4 rounded-[2px] grid grid-cols-1 sm:grid-cols-3 gap-4 border border-[#0B1F3A]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#138808] animate-pulse shrink-0" />
          <div>
            <div className="text-[10px] font-mono uppercase text-[#F7F5F0]/70">Total Checkpoints</div>
            <div className="text-xl font-serif font-bold text-white mt-0.5">
              <AnimatedCounter value={auditLogs.length} /> <span className="text-xs font-mono text-[#F7F5F0]/60">entries</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-white/15 pt-2 sm:pt-0 sm:pl-4">
          <div className="w-2 h-2 rounded-full bg-[#138808] shrink-0" />
          <div>
            <div className="text-[10px] font-mono uppercase text-[#F7F5F0]/70">Verified Hash Blocks</div>
            <div className="text-xl font-serif font-bold text-white mt-0.5">
              <AnimatedCounter value={successCount} /> <span className="text-xs font-mono text-[#F7F5F0]/60">verified</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-white/15 pt-2 sm:pt-0 sm:pl-4">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#F7F5F0]/70">Cryptographic Standard</div>
            <div className="text-xs font-mono font-bold text-[#C9A227] mt-0.5">
              SHA-256 &bull; Strict Append-Only
            </div>
          </div>
        </div>
      </div>

      {/* Main Ledger Table Card */}
      <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-5 space-y-4 shadow-sm">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#5C6670]/30">
          <div>
            <span className="text-[10px] font-mono text-[#5C6670] uppercase font-bold">
              LEDGER ENTRIES // {filteredLogs.length} OF {auditLogs.length} TOTAL
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              type="text"
              placeholder="Search filename, SHA-256, or auditor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] text-[#1A1A1A] focus:outline-none focus:border-[#0B1F3A] w-56 sm:w-64 font-sans"
            />

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] text-[#1A1A1A] focus:outline-none focus:border-[#0B1F3A] font-sans cursor-pointer"
            >
              <option value="all">All Schemas</option>
              <option value="omr">OMR Records</option>
              <option value="server">Server Records</option>
              <option value="seating">Seating Records</option>
            </select>
          </div>
        </div>

        {/* Ledger Table with Alternating Row Rhythm */}
        {filteredLogs.length === 0 ? (
          <div className="h-48 flex items-center justify-center bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] p-6 text-center">
            <p className="text-xs text-[#5C6670] font-sans">
              No audit log entries recorded. Ingest exam datasets on Tab 01 to establish cryptographic checkpoints.
            </p>
          </div>
        ) : (
          <div className="max-h-[500px] overflow-auto border border-[#5C6670] rounded-[2px]">
            <table className="w-full text-xs font-sans text-left border-collapse">
              <thead className="bg-[#F7F5F0] border-b border-[#5C6670] sticky top-0 font-mono text-[11px] text-[#0B1F3A] z-10">
                <tr>
                  <th className="p-3 border-r border-[#5C6670]/30 w-12">ID</th>
                  <th className="p-3 border-r border-[#5C6670]/30 whitespace-nowrap">Timestamp (UTC)</th>
                  <th className="p-3 border-r border-[#5C6670]/30">Filename</th>
                  <th className="p-3 border-r border-[#5C6670]/30">Schema</th>
                  <th className="p-3 border-r border-[#5C6670]/30">SHA-256 Checkpoint Hash</th>
                  <th className="p-3 border-r border-[#5C6670]/30 text-right">Rows</th>
                  <th className="p-3 border-r border-[#5C6670]/30 text-center">Status</th>
                  <th className="p-3">Auditor Identity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#5C6670]/20">
                {filteredLogs.map((log) => {
                  const isCopied = copiedHash === log.file_hash;

                  return (
                    <tr
                      key={log.id}
                      className="border-b border-[#5C6670]/20 even:bg-[#F7F5F0]/60 hover:bg-[#0B1F3A]/5 transition-colors"
                    >
                      <td className="p-3 font-mono font-bold text-[#5C6670] border-r border-[#5C6670]/30">
                        #{log.id}
                      </td>
                      <td className="p-3 font-mono text-[#5C6670] border-r border-[#5C6670]/30 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="p-3 font-mono font-bold text-[#0B1F3A] border-r border-[#5C6670]/30">
                        {log.filename}
                      </td>
                      <td className="p-3 font-mono uppercase text-[#1A1A1A] border-r border-[#5C6670]/30 font-semibold">
                        <span className="px-1.5 py-0.5 bg-[#FFFFFF] border border-[#5C6670]/40 rounded-[2px] text-[10px]">
                          {log.record_type}
                        </span>
                      </td>
                      <td className="p-3 font-mono border-r border-[#5C6670]/30 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate bg-[#FFFFFF] border border-[#5C6670]/40 p-1 px-1.5 rounded-[2px] text-[10px] text-[#1A1A1A] select-all font-mono">
                            {log.file_hash}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(log.file_hash)}
                            className="px-2 py-1 border border-[#0B1F3A] text-[#0B1F3A] bg-transparent text-[10px] font-mono rounded-[2px] cursor-pointer hover:bg-[#0B1F3A]/5 shrink-0 flex items-center gap-1"
                            title="Copy complete SHA-256 hash to clipboard"
                          >
                            {isCopied ? (
                              <span className="text-[#138808] font-bold animate-stamp inline-flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> COPIED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5">
                                <Copy className="w-3 h-3" /> COPY
                              </span>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-[#0B1F3A] border-r border-[#5C6670]/30 text-right">
                        {log.row_count.toLocaleString()}
                      </td>
                      <td className="p-3 border-r border-[#5C6670]/30 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-medium bg-[#FFFFFF] border ${
                          log.status === 'SUCCESS' ? 'border-[#0B1F3A] text-[#0B1F3A]' : 'border-[#8A1538] text-[#8A1538]'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            log.status === 'SUCCESS' ? 'bg-[#0B1F3A]' : 'bg-[#8A1538]'
                          }`} />
                          {log.status === 'SUCCESS' ? 'Verified' : 'Rejected'}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[#5C6670] text-[11px]">
                        {log.uploader_identity}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
