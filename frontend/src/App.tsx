import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar, type SidebarTab } from './components/Sidebar';
import { SimulatedDataBanner } from './components/SimulatedDataBanner';
import { FileUploadZone } from './components/FileUploadZone';
import { AuditLogViewer } from './components/AuditLogViewer';
import { RiskHeatmap } from './components/RiskHeatmap';
import { TriageSummaryCards } from './components/TriageSummaryCards';
import { VirtualizedTriageQueue } from './components/VirtualizedTriageQueue';
import { DecisionModal } from './components/DecisionModal';
import { CandidateDrilldownView } from './components/drilldown/CandidateDrilldownView';
import { PipelineView } from './components/PipelineView';
import { DossierView } from './components/DossierView';
import { FutureScopeSection } from './components/FutureScopeSection';
import { WatermarkAnchor } from './components/common/WatermarkAnchor';
import { HeroSection } from './components/HeroSection';
import { ForensicMethodologyView } from './components/ForensicMethodologyView';
import { DatasetForensicInspector } from './components/DatasetForensicInspector';
import { useIngestionStore } from './stores/ingestionStore';
import { useTriageStore } from './stores/triageStore';
import { useDrilldownStore } from './stores/drilldownStore';

const MainDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('queue');

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetConfirmationText, setResetConfirmationText] = useState('');

  const {
    fetchDatasetStatuses,
    fetchAuditLogs,
    datasets,
    isGeneratingSamples,
    loadSamplePreset,
    resetSystem,
  } = useIngestionStore();
  const { fetchQueue, fetchHierarchy } = useTriageStore();
  const { openDrilldown } = useDrilldownStore();
  const { user } = useAuth();

  useEffect(() => {
    fetchDatasetStatuses();
    fetchAuditLogs();
    fetchQueue();
    fetchHierarchy();
  }, [fetchDatasetStatuses, fetchAuditLogs, fetchQueue, fetchHierarchy]);

  const handleLoadPreset = async (preset: string) => {
    const uploader = user ? `${user.full_name} (${user.badge_id})` : 'Lead Forensic Auditor (EXAM-SEC-7749)';
    await loadSamplePreset(preset, uploader);
    await fetchQueue();
    await fetchHierarchy();
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      await resetSystem();
      await fetchDatasetStatuses();
      await fetchAuditLogs();
      await fetchQueue();
      await fetchHierarchy();
      setIsResetModalOpen(false);
      setResetConfirmationText('');
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const allReady =
    datasets.omr.is_ingested &&
    datasets.server.is_ingested &&
    datasets.seating.is_ingested;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#1A1A1A] font-sans">
      {/* Top Header Strip with 3px Tricolor Accent and Navy Bar */}
      <Header />

      {/* Simulated Data Warning Banner */}
      <SimulatedDataBanner />

      {/* Main Register Body: Fixed Left Sidebar + Left-Aligned Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Fixed Left Sidebar Navigation */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Left-Aligned Content Workspace */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
          {/* TAB 1: INGESTION (01) */}
          {activeTab === 'ingestion' && (
            <div className="space-y-6">
              {/* Ronan Pike-Style High-Impact Hero Section */}
              <HeroSection
                onNavigateToQueue={() => setActiveTab('queue')}
                onNavigateToMethodology={() => setActiveTab('methodology')}
                onLoadPreset={handleLoadPreset}
              />

              {/* Oversized Watermark Typographic Anchor & Action Bar */}
              <WatermarkAnchor
                number="01"
                tagline="CRYPTOGRAPHIC CHECKPOINT REGISTER"
                title="Dataset Ingestion & Schema Gatekeeper"
                subtitle="Upload the three required exam datasets. Each file is validated against strict column requirements and committed immutably with a SHA-256 cryptographic hash before forensic analysis begins."
                action={
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Preset 1: WBSSC 2016 (Real Court Case) - Solid Navy Primary */}
                    <button
                      type="button"
                      onClick={() => handleLoadPreset('wbssc')}
                      disabled={isGeneratingSamples || isResetting}
                      className="px-3.5 py-2 bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90 text-xs font-sans font-medium rounded-[2px] cursor-pointer disabled:opacity-50 border border-[#0B1F3A]"
                      title="Ingests real WBSSC Calcutta High Court OMR & Server datasets with strict SHA-256 checkpoints and audit logging"
                    >
                      Load WBSSC Case (Real)
                    </button>

                    {/* Preset 2: NEET-UG 2024 (Real Centre Results) - Solid Navy Primary */}
                    <button
                      type="button"
                      onClick={() => handleLoadPreset('neet2024')}
                      disabled={isGeneratingSamples || isResetting}
                      className="px-3.5 py-2 bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90 text-xs font-sans font-medium rounded-[2px] cursor-pointer disabled:opacity-50 border border-[#0B1F3A]"
                      title="Ingests real NEET-UG 2024 2,000-candidate centre datasets through full hashing & audit log pipeline"
                    >
                      Load NEET 2024 (Real)
                    </button>

                    {/* Preset 3: Calibrated Benchmark (Synthetic) */}
                    <button
                      type="button"
                      onClick={() => handleLoadPreset('synthetic')}
                      disabled={isGeneratingSamples || isResetting}
                      className="px-3.5 py-2 border border-[#C9A227] text-[#0B1F3A] bg-[#FFFFFF] hover:bg-[#C9A227]/10 text-xs font-sans font-medium rounded-[2px] cursor-pointer disabled:opacity-50"
                      title="Ingests calibrated CopyDetect response matrix and seating layout tagged is_synthetic=true"
                    >
                      Load Benchmark (Synthetic)
                    </button>

                    {/* Reset System Action Button (Admin-Only with Confirmation) - Outlined Crimson */}
                    <button
                      type="button"
                      onClick={() => setIsResetModalOpen(true)}
                      disabled={isGeneratingSamples || isResetting}
                      className="px-3 py-2 border border-[#8A1538] text-[#8A1538] bg-transparent hover:bg-[#8A1538]/5 text-xs font-sans font-medium rounded-[2px] cursor-pointer disabled:opacity-50"
                      title="Administrative reset: Clears all ingested datasets, computed anomaly scores, and audit logs"
                    >
                      Reset System
                    </button>

                    {/* Ingestion Status Badge */}
                    <div className="p-2 px-3 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] text-xs font-mono">
                      <span className="text-[#5C6670]">Status: </span>
                      <strong className={allReady ? 'text-[#0B1F3A]' : 'text-[#8A1538]'}>
                        {allReady ? '3 of 3 files loaded' : 'Awaiting upload'}
                      </strong>
                    </div>
                  </div>
                }
              />

              {/* Full-Bleed Navy Security Guarantee Banner */}
              <div className="bg-[#0B1F3A] text-white rounded-[2px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#0B1F3A]">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#138808] animate-pulse shrink-0" />
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#F7F5F0]/70 font-bold">
                      SECURITY DIRECTIVE &bull; APPEND-ONLY PROTOCOL
                    </div>
                    <div className="text-xs font-sans text-[#F7F5F0] mt-0.5">
                      Every ingested dataset is verified against schema constraints, hashed via SHA-256, and immutably recorded before any forensic engine execution.
                    </div>
                  </div>
                </div>
                <div className="font-mono text-[10px] text-[#F7F5F0]/60 shrink-0 border border-white/20 px-2 py-1 rounded-[2px]">
                  STRICT IMMUTABILITY
                </div>
              </div>

              {/* Reset System Confirmation Modal */}
              {isResetModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                  <div className="bg-[#FFFFFF] border-2 border-[#8A1538] max-w-md w-full p-6 rounded-[2px] shadow-xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[2px] bg-[#8A1538] text-white flex items-center justify-center font-bold text-sm">
                        !
                      </div>
                      <div>
                        <h3 className="text-base font-serif font-bold text-[#8A1538]">
                          Confirm System Reset
                        </h3>
                        <p className="text-xs text-[#5C6670] font-sans">
                          Administrative Data Deletion Action
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] text-xs text-[#1A1A1A] space-y-2">
                      <p>
                        This administrative action will permanently perform the following:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-[#5C6670]">
                        <li>Clear all ingested OMR, Server, and Seating records.</li>
                        <li>Clear all computed anomaly risk scores and triage items.</li>
                        <li>Clear all human investigator adjudication decisions.</li>
                        <li>Clear all cryptographic audit log entries.</li>
                      </ul>
                      <p className="font-semibold text-[#8A1538] pt-1">
                        Application code, schema constraints, and configurations will NOT be altered.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#1A1A1A]">
                        Type <strong className="font-mono text-[#8A1538]">RESET</strong> below to confirm:
                      </label>
                      <input
                        type="text"
                        value={resetConfirmationText}
                        onChange={(e) => setResetConfirmationText(e.target.value)}
                        placeholder="RESET"
                        className="w-full px-3 py-2 border border-[#5C6670] text-xs font-mono rounded-[2px] focus:outline-none focus:border-[#8A1538]"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsResetModalOpen(false);
                          setResetConfirmationText('');
                        }}
                        disabled={isResetting}
                        className="px-4 py-2 border border-[#5C6670] text-xs font-sans text-[#1A1A1A] hover:bg-[#F7F5F0] rounded-[2px]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmReset}
                        disabled={resetConfirmationText.trim().toUpperCase() !== 'RESET' || isResetting}
                        className="px-4 py-2 bg-[#8A1538] hover:bg-[#8A1538]/90 text-white text-xs font-sans font-medium rounded-[2px] disabled:opacity-40 cursor-pointer"
                      >
                        {isResetting ? 'Resetting system...' : 'Confirm System Reset'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Zones for 3 Required Schemas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#0B1F3A] font-serif">
                    Required Datasets
                  </h3>
                  <span className="text-xs text-[#5C6670] font-sans">
                    All three datasets are required for full audit coverage
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* 1. OMR Records Upload */}
                  <FileUploadZone
                    recordType="omr"
                    title="OMR item responses"
                    description="Question selections and raw marks scored by candidates."
                    requiredColumns={[
                      'candidate_id',
                      'centre_id',
                      'room_id',
                      'seat_number',
                      'question_id',
                      'selected_option',
                      'raw_score',
                    ]}
                    sampleFormat="C001, CENTRE_01, R01, 1, Q001, B, 4.0"
                  />

                  {/* 2. Server Records Upload */}
                  <FileUploadZone
                    recordType="server"
                    title="Server published results"
                    description="Final candidate marks and publication timestamps."
                    requiredColumns={[
                      'candidate_id',
                      'final_score',
                      'server_timestamp',
                    ]}
                    sampleFormat="C001, 185.0, 2026-09-15T10:00:00Z"
                  />

                  {/* 3. Seating Layout Upload */}
                  <FileUploadZone
                    recordType="seating"
                    title="Seating spatial layout"
                    description="Physical room and seat mapping for proximity analysis."
                    requiredColumns={[
                      'candidate_id',
                      'centre_id',
                      'room_id',
                      'seat_number',
                    ]}
                    sampleFormat="C001, CENTRE_01, R01, 1"
                  />
                </div>
              </div>

              {/* Raw Evidence Dataset Forensic Inspector */}
              <DatasetForensicInspector
                onInspectCandidate={(candId) => openDrilldown(candId)}
              />

              {/* Cryptographic Audit Trail Section */}
              <AuditLogViewer />

              {/* Candidate Drilldown Modal */}
              <CandidateDrilldownView />
            </div>
          )}

          {/* TAB 02: FORENSIC METHODOLOGY & MATHEMATICAL PROOFS */}
          {activeTab === 'methodology' && (
            <div className="space-y-6">
              <ForensicMethodologyView onBack={() => setActiveTab('ingestion')} />
            </div>
          )}

          {/* TAB 02: ANALYTICAL ENGINE (02) */}
          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              <PipelineView />
              <FutureScopeSection />
            </div>
          )}

          {/* TAB 3: QUEUE (03) */}
          {activeTab === 'queue' && (
            <div className="space-y-6">
              {/* Oversized Watermark Typographic Anchor */}
              <WatermarkAnchor
                number="03"
                tagline="HUMAN-IN-THE-LOOP DECISION REGISTER"
                title="Investigator Forensic Review Queue"
                subtitle="Review candidate cases flagged by the multi-layer forensic engine. Every entry displays its explainable composite risk score and psychometric evidence. Status updates require authorized human adjudication with mandatory justification."
              />

              {/* KPI Summary Cards */}
              <TriageSummaryCards />

              {/* National / Regional Heatmap Treemap */}
              <RiskHeatmap />

              {/* Main Action Queue (Virtualized Table) */}
              <VirtualizedTriageQueue />

              {/* Decision Modal */}
              <DecisionModal />

              {/* Candidate Drilldown Modal */}
              <CandidateDrilldownView />
            </div>
          )}

          {/* TAB 4: DOSSIER (04) */}
          {activeTab === 'dossier' && (
            <div className="space-y-6">
              <DossierView />
              <DecisionModal />
            </div>
          )}

          {/* TAB 5: AUDIT LOG (05) */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <AuditLogViewer />
            </div>
          )}

          {/* Statutory & Non-Punitive Legal Notice */}
          <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-4 text-xs text-[#5C6670] font-sans leading-relaxed">
            <strong className="text-[#1A1A1A]">Decision-Support Principle: </strong>
            Terra Trace functions strictly as an explainable decision-support register. It does not automatically disqualify or cancel candidate results. All analytical indicators are routed to human investigators who make final determinations recorded in the immutable audit log.
          </div>
        </main>
      </div>

      {/* Official Register Footer */}
      <footer className="border-t border-[#5C6670]/40 bg-[#FFFFFF] py-3 px-6 shrink-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-sans text-[#5C6670]">
          <span>Terra Trace Forensic Exam Integrity Register &bull; Version 1.0.0</span>
          <span className="font-mono text-[11px] text-[#5C6670]">
            Air-Gapped Enclave &bull; Polars Analytical Core &bull; SHA-256 Checkpoints
          </span>
        </div>
      </footer>
    </div>
  );
};

export const AppContent: React.FC = () => {
  return <MainDashboard />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
