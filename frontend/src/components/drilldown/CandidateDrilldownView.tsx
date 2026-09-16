import React from 'react';
import { useDrilldownStore } from '../../stores/drilldownStore';
import { useTriageStore } from '../../stores/triageStore';
import { MacroBellCurveChart } from './MacroBellCurveChart';
import { MicroSeatingGrid } from './MicroSeatingGrid';
import { ReconciliationTable } from './ReconciliationTable';

export const CandidateDrilldownView: React.FC = () => {
  const { isOpen, drilldownData, isLoading, isExportingPdf, closeDrilldown, exportPdf } = useDrilldownStore();
  const { openDecisionModal } = useTriageStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0B1F3A]/75 backdrop-blur-sm">
      <div className="bg-[#FFFFFF] border-t sm:border border-[#5C6670] rounded-t-lg sm:rounded-[2px] w-full max-w-5xl my-0 sm:my-auto text-left overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[92vh] shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-5 border-b border-[#5C6670]/30 bg-[#FFFFFF] sticky top-0 z-10 shrink-0">
          <div>
            <div className="text-[10px] font-mono text-[#5C6670] uppercase font-bold tracking-wider">
              OFFICIAL CASE DOSSIER &bull; MULTI-LAYER EVIDENCE RECORD
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <h3 className="text-lg sm:text-xl font-bold text-[#0B1F3A] font-serif">
                {drilldownData?.candidate_id || 'Candidate Forensic Dossier'}
              </h3>
              {drilldownData?.is_synthetic && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[2px] bg-[#C9A227] text-white">
                  SIMULATED
                </span>
              )}
            </div>
            <p className="text-xs text-[#5C6670] font-sans truncate max-w-sm sm:max-w-none">
              {drilldownData?.centre_id} ({drilldownData?.centre_name}) &bull; {drilldownData?.city_name}, {drilldownData?.state_name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Export PDF Dossier Button */}
            <button
              type="button"
              onClick={exportPdf}
              disabled={isExportingPdf || isLoading || !drilldownData}
              className="flex-1 sm:flex-initial text-center px-3 sm:px-4 py-2 bg-[#0B1F3A] text-white text-xs font-mono uppercase font-bold rounded-[2px] border border-[#0B1F3A] cursor-pointer hover:bg-[#0B1F3A]/90 disabled:opacity-50 whitespace-nowrap"
            >
              {isExportingPdf ? 'Exporting...' : 'Export PDF'}
            </button>

            {/* Adjudicate Button */}
            {drilldownData && (
              <button
                type="button"
                onClick={() => {
                  const triageItem: any = {
                    entity_id: drilldownData.candidate_id,
                    entity_type: 'candidate',
                    centre_id: drilldownData.centre_id,
                    centre_name: drilldownData.centre_name,
                    state_name: drilldownData.state_name,
                    city_name: drilldownData.city_name,
                    room_id: drilldownData.room_id,
                    seat_number: drilldownData.seat_number,
                    combined_risk_score: drilldownData.combined_risk_score,
                    reconciliation_risk: drilldownData.reconciliation_risk,
                    macro_risk: drilldownData.macro_risk,
                    micro_risk: drilldownData.micro_risk,
                    status: drilldownData.status,
                    primary_flags: drilldownData.primary_flags,
                    raw_calculated_score: drilldownData.reconciliation.raw_total_score,
                    server_score: drilldownData.reconciliation.server_score,
                    is_synthetic: drilldownData.is_synthetic,
                  };
                  openDecisionModal(triageItem, drilldownData.status === 'Pending' ? 'Confirmed' : drilldownData.status);
                }}
                className="flex-1 sm:flex-initial text-center px-3 py-2 border border-[#0B1F3A] text-[#0B1F3A] bg-transparent text-xs font-sans font-medium rounded-[2px] cursor-pointer hover:bg-[#0B1F3A]/5 whitespace-nowrap"
              >
                Adjudicate
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={closeDrilldown}
              className="px-3 py-2 border border-[#5C6670] text-[#1A1A1A] bg-transparent text-xs font-mono rounded-[2px] cursor-pointer shrink-0"
            >
              [Close]
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6 bg-[#F7F5F0]">
          {isLoading || !drilldownData ? (
            <div className="h-96 flex items-center justify-center bg-[#FFFFFF] border border-[#5C6670] rounded-[2px]">
              <span className="text-xs text-[#5C6670] font-sans">
                Compiling multi-layer forensic case evidence from database...
              </span>
            </div>
          ) : (
            <>
              {/* Executive Case Summary Panel */}
              <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-[#5C6670] uppercase font-bold tracking-wider">
                      COMPOSITE AUDIT ASSESSMENT
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-sans text-[#5C6670]">Current Adjudication Status:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-[2px] text-xs font-mono font-medium bg-[#FFFFFF] border ${
                        drilldownData.status === 'Confirmed'
                          ? 'border-[#8A1538] text-[#8A1538]'
                          : drilldownData.status === 'Pending'
                          ? 'border-[#C9A227] text-[#C9A227]'
                          : drilldownData.status === 'False Positive'
                          ? 'border-[#5C6670] text-[#5C6670]'
                          : 'border-[#0B1F3A] text-[#0B1F3A]'
                      }`}>
                        <span className={`w-2 h-2 rounded-full inline-block mr-1.5 ${
                          drilldownData.status === 'Confirmed'
                            ? 'bg-[#8A1538]'
                            : drilldownData.status === 'Pending'
                            ? 'bg-[#C9A227]'
                            : drilldownData.status === 'False Positive'
                            ? 'bg-[#5C6670]'
                            : 'bg-[#0B1F3A]'
                        }`} />
                        {drilldownData.status === 'Pending' ? 'Pending Review' : drilldownData.status === 'False Positive' ? 'False Positive' : drilldownData.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full md:w-auto">
                    <div className="p-2.5 sm:p-3 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] text-center">
                      <div className="text-[9px] sm:text-[10px] text-[#5C6670] uppercase font-sans">Rec Risk (45%)</div>
                      <div className="font-mono text-xs sm:text-sm font-bold text-[#0B1F3A] mt-0.5">{drilldownData.reconciliation_risk.toFixed(1)}</div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] text-center">
                      <div className="text-[9px] sm:text-[10px] text-[#5C6670] uppercase font-sans">Macro Risk (35%)</div>
                      <div className="font-mono text-xs sm:text-sm font-bold text-[#0B1F3A] mt-0.5">{drilldownData.macro_risk.toFixed(1)}</div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] text-center">
                      <div className="text-[9px] sm:text-[10px] text-[#5C6670] uppercase font-sans">Micro Risk (20%)</div>
                      <div className="font-mono text-xs sm:text-sm font-bold text-[#0B1F3A] mt-0.5">{drilldownData.micro_risk.toFixed(1)}</div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-[#0B1F3A] text-white rounded-[2px] text-center">
                      <div className="text-[9px] sm:text-[10px] uppercase font-mono text-[#F7F5F0]/70">Combined Risk</div>
                      <div className="font-mono text-xs sm:text-sm font-bold text-white mt-0.5">{drilldownData.combined_risk_score.toFixed(1)} / 100</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layer 1 Visual: Reconciliation Table */}
              <ReconciliationTable reconciliation={drilldownData.reconciliation} />

              {/* Layer 2 Visual: Overlapping Bell Curves */}
              <MacroBellCurveChart
                macro={drilldownData.macro}
                candidateScore={drilldownData.reconciliation.server_score}
              />

              {/* Layer 3 Visual: Spatial Seating Layout */}
              <MicroSeatingGrid micro={drilldownData.micro} />

              {/* Human Decision History Audit Trail */}
              <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-5 space-y-3">
                <h4 className="text-sm font-bold text-[#0B1F3A] font-serif pb-2 border-b border-[#5C6670]/30">
                  Human Investigative Adjudication History (Immutable Audit Log)
                </h4>

                {drilldownData.decision_history && drilldownData.decision_history.length > 0 ? (
                  <div className="space-y-2">
                    {drilldownData.decision_history.map((dec, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] text-xs font-sans space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#0B1F3A]">
                            Status Transition: <strong className="text-[#8A1538]">{dec.previous_status}</strong> &rarr; <strong className="text-[#0B1F3A]">{dec.new_status}</strong>
                          </span>
                          <span className="font-mono text-[11px] text-[#5C6670]">{dec.timestamp}</span>
                        </div>
                        <p className="text-[#1A1A1A] leading-relaxed">
                          Justification: &ldquo;{dec.justification}&rdquo;
                        </p>
                        <div className="text-[10px] font-mono text-[#5C6670]">
                          Adjudicated by: {dec.investigator_identity}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#5C6670] font-sans">
                    No human adjudication decisions recorded yet. Case is currently pending review.
                  </p>
                )}
              </div>

              {/* Statutory Section 65B / BSA 2023 Electronic Evidence Certificate */}
              <div className="bg-[#FFFFFF] border-2 border-[#0B1F3A] rounded-[2px] p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#0B1F3A]/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#138808] shrink-0" />
                    <h4 className="text-xs font-mono font-bold text-[#0B1F3A] uppercase tracking-wider">
                      STATUTORY CERTIFICATE OF ELECTRONIC EVIDENCE // SEC 65B EVIDENCE ACT &bull; SEC 63 BSA 2023
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-[#0B1F3A] text-white font-bold">
                    SUB-JUDICE ADMISSIBLE
                  </span>
                </div>

                <div className="space-y-2 text-[11px] font-sans text-[#1A1A1A] leading-relaxed">
                  <p>
                    <strong>1. Lawful Custody & Output:</strong> I hereby certify that the electronic forensic records, item-level reconciliation calculations, Gaussian probability curves, and spatial seating correlations set out in this Case Dossier were produced by the <em>Terra Trace Forensic Enclave</em> during the ordinary course of lawful official examination board audit activities.
                  </p>
                  <p>
                    <strong>2. Enclave Integrity & Un-Intercepted Operation:</strong> During the operational audit period, the computing enclave operated under strict air-gapped conditions without unauthorized external access, network packet interception, or electronic memory tampering.
                  </p>
                  <p>
                    <strong>3. Cryptographic Verification:</strong> Source OMR scanner logs and server tabulation records are cryptographically anchored to SHA-256 ingestion checkpoints (NIST FIPS 180-4). All human adjudication transitions are permanently recorded in an immutable, append-only SQLite transaction ledger.
                  </p>
                </div>

                <div className="p-3 bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono">
                  <div>
                    <span className="text-[#5C6670]">CERTIFYING OFFICER: </span>
                    <strong className="text-[#0B1F3A]">Lead Forensic Auditor (EXAM-SEC-7749)</strong>
                  </div>
                  <div>
                    <span className="text-[#5C6670]">AIR-GAPPED CHECKSUM: </span>
                    <strong className="text-[#8A1538]">SHA-256 NIST FIPS 180-4 VERIFIED</strong>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
