import React, { useState, useEffect } from 'react';
import { useDrilldownStore } from '../stores/drilldownStore';
import { useTriageStore } from '../stores/triageStore';
import { WatermarkAnchor } from './common/WatermarkAnchor';
import { MacroBellCurveChart } from './drilldown/MacroBellCurveChart';
import { MicroSeatingGrid } from './drilldown/MicroSeatingGrid';
import { ReconciliationTable } from './drilldown/ReconciliationTable';

export const DossierView: React.FC = () => {
  const { drilldownData, isLoading, isExportingPdf, openDrilldown, exportPdf } = useDrilldownStore();
  const { items, openDecisionModal } = useTriageStore();
  const [candidateIdInput, setCandidateIdInput] = useState('');

  // Default to first item if none loaded
  useEffect(() => {
    if (!drilldownData && items.length > 0) {
      openDrilldown(items[0].entity_id);
    }
  }, [drilldownData, items, openDrilldown]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (candidateIdInput.trim()) {
      openDrilldown(candidateIdInput.trim());
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner with WatermarkAnchor */}
      <WatermarkAnchor
        number="04"
        tagline="FORENSIC DOSSIER // INDIVIDUAL CASE FILE"
        title="Candidate Forensic Case Dossier"
        subtitle="Multi-layer evidentiary case file compiling item-level response reconciliation, Gaussian distribution divergence, and spatial seating collusion graphs."
      />

      {/* Candidate Selector & Search */}
      <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Enter Candidate ID (e.g. CAND_001_01_005)..."
              value={candidateIdInput}
              onChange={(e) => setCandidateIdInput(e.target.value)}
              className="px-3.5 py-2 text-xs font-mono bg-[#F7F5F0] border border-[#5C6670] rounded-[2px] text-[#1A1A1A] focus:outline-none focus:border-[#0B1F3A] w-72"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#0B1F3A] text-white text-xs font-mono uppercase font-bold rounded-[2px] border border-[#0B1F3A] cursor-pointer hover:bg-[#0B1F3A]/90"
            >
              Load Dossier
            </button>
          </form>

          {/* Quick select suggestions from queue */}
          {items.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-sans">
              <span className="text-[#5C6670] font-mono text-[11px] uppercase">Flagged:</span>
              {items.slice(0, 5).map((cand) => (
                <button
                  key={cand.entity_id}
                  type="button"
                  onClick={() => openDrilldown(cand.entity_id)}
                  className={`px-2.5 py-1 rounded-[2px] text-[10px] font-mono cursor-pointer transition-none ${
                    drilldownData?.candidate_id === cand.entity_id
                      ? 'bg-[#0B1F3A] text-white font-bold border border-[#0B1F3A]'
                      : 'bg-[#F7F5F0] border border-[#5C6670]/40 text-[#1A1A1A] hover:border-[#0B1F3A]'
                  }`}
                >
                  {cand.entity_id} ({cand.combined_risk_score.toFixed(0)})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="h-96 flex items-center justify-center bg-[#FFFFFF] border border-[#5C6670] rounded-[2px]">
          <span className="text-xs text-[#5C6670] font-sans">
            Loading candidate forensic dossier...
          </span>
        </div>
      ) : !drilldownData ? (
        <div className="h-64 flex items-center justify-center bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-6 text-center">
          <p className="text-xs text-[#5C6670] font-sans">
            No candidate dossier selected. Select a candidate case from the Queue or enter an ID above.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Executive Summary Bar & PDF Export Header */}
          <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-[#0B1F3A] font-mono">
                  {drilldownData.candidate_id}
                </h3>
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
                {drilldownData.is_synthetic && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[2px] bg-[#C9A227] text-white">
                    SIMULATED DATA
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5C6670] font-sans mt-0.5">
                {drilldownData.centre_id} &bull; {drilldownData.city_name}, {drilldownData.state_name} (Room {drilldownData.room_id}, Seat #{drilldownData.seat_number})
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Adjudicate Button */}
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
                className="px-3.5 py-2 border border-[#0B1F3A] text-[#0B1F3A] bg-transparent text-xs font-sans font-medium rounded-[2px] cursor-pointer hover:bg-[#0B1F3A]/5"
              >
                Adjudicate Status
              </button>

              {/* Download Official PDF Dossier Button */}
              <button
                type="button"
                onClick={exportPdf}
                disabled={isExportingPdf}
                className="px-4 py-2 bg-[#0B1F3A] text-white text-xs font-sans font-medium rounded-[2px] border border-[#0B1F3A] cursor-pointer disabled:opacity-50"
              >
                {isExportingPdf ? 'Generating Air-Gapped PDF...' : 'Download Official PDF Dossier'}
              </button>
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
                No formal investigative decisions recorded for this case file yet.
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
        </div>
      )}
    </div>
  );
};
