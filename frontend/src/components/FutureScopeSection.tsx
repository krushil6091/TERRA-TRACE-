import React, { useState } from 'react';
import { MousePointer, Clock, Network, Lock, Terminal, ChevronDown } from 'lucide-react';

export const FutureScopeSection: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeModuleId, setActiveModuleId] = useState<string>('mouse-dynamics');

  const cbtModules = [
    {
      id: 'mouse-dynamics',
      number: '01',
      title: 'Biomechanical Mouse Dynamics & Cursor Jump Profiler',
      subtitle: 'Detecting Remote Desktop Takeovers (AnyDesk / TeamViewer / UltraViewer)',
      targetScam: 'JEE Main 2021 CBI Affinity Education Syndicate',
      icon: MousePointer,
      description:
        'Audits high-frequency DOM pointer coordinates (x, y, t) and angular velocity. A physical human hand naturally produces microscopic hand tremors, micro-hesitations, and deceleration curves (Fitts’s Law). Remote desktop protocols (AnyDesk/RDP) transmit coordinates in discrete compressed video frames, producing discontinuous coordinate teleportation and unnatural straight-line vectors.',
      telemetryIngested: 'Client DOM Event Stream (mousemove, pointerdown, pointerup vectors at 60Hz)',
      forensicEquation: 'Jitter Variance J = Var(dθ/dt) < 0.05  ||  ΔCoord > 180px / 16ms',
      status: 'AGENCY TELEMETRY SPECIFICATION (TCS iON / NTA)',
      auditTelemetry: {
        normalPattern: 'Continuous curvilinear trajectory with natural human deceleration (J = 0.42)',
        anomalyPattern: 'Instantaneous coordinate jump across 240px with zero intermediate hover events (J = 0.01)',
        verdict: 'CRITICAL ALERT: Remote Screen-Sharing Software Infiltration Detected',
      },
    },
    {
      id: 'response-time',
      number: '02',
      title: 'Van der Linden Cognitive Response-Time Model',
      subtitle: 'Detecting Pre-Leaked Answer Keys & Memorized Solver Sequences',
      targetScam: 'Patna Solver Gang / Pre-Exam Leaked Key Memorization',
      icon: Clock,
      description:
        'Models the millisecond latency between question rendering and final option selection against psychometric item difficulty. Complex multi-step JEE Advanced physics and organic chemistry questions require a cognitive reading and computation threshold (≥ 75–120 seconds). When examinees answer complex 4-mark items in under 4 seconds with 98% accuracy, the cognitive latency deviation becomes mathematically impossible.',
      telemetryIngested: 'Item Interaction Latency Logs (render_timestamp, first_click, final_submit_ms)',
      forensicEquation: 'ln(Tik) = βk - τi + εik,  εik ~ N(0, σk²)  -->  Deviation > 4.5σ',
      status: 'PSYCHOMETRIC LOGNORMAL MODEL (v2.0)',
      auditTelemetry: {
        normalPattern: 'Mean dwell time on complex items: 114.2s (SD: 28.4s)',
        anomalyPattern: 'Candidate solved 12 complex items in median 3.4s with 100% accuracy',
        verdict: 'STATUTORY ANOMALY: Pre-Memorized Answer Key Leaks (5.1σ Deviation)',
      },
    },
    {
      id: 'network-jitter',
      number: '03',
      title: 'LAN Socket Jitter & Rogue Proxy Bridge Detector',
      subtitle: 'Detecting Unauthorized Secondary Routers & Ghost Terminals in Private Labs',
      targetScam: 'UP Police SI & Private Engineering College CBT Lab Proxy Scams',
      icon: Network,
      description:
        'Audits TCP socket 3-way handshake latency and WebSocket heartbeat round-trip times (RTT) across all test centre terminals. In a legitimate air-gapped test centre LAN, terminal-to-local-server RTT is consistently under 1 millisecond. When corrupt lab operators route a terminal through an unauthorized secondary proxy switch to an external room, socket RTT spikes by 40ms to 120ms with network packet jitter.',
      telemetryIngested: 'Local Gateway TCP Handshake Logs & Socket Heartbeat RTT Streams',
      forensicEquation: 'RTT_terminal - RTT_baseline > 35ms  &&  Packet Jitter > 15ms',
      status: 'NETWORK FORENSIC TELEMETRY (v2.1)',
      auditTelemetry: {
        normalPattern: 'Internal air-gapped LAN ping: 0.4ms to 0.8ms (Zero hop variance)',
        anomalyPattern: 'Terminal #14 shows RTT of 68.2ms with high socket jitter (External Hop Detected)',
        verdict: 'INFRASTRUCTURE BREACH: Unauthorized LAN Bridge / Secondary Proxy Active',
      },
    },
    {
      id: 'zk-proofs',
      number: '04',
      title: 'Client-Side Zero-Knowledge Submission Seal',
      subtitle: 'Preventing Post-Exam Database Tampering in Cloud Evaluation Stores',
      targetScam: 'Maharashtra TET / Evaluation Agency Central Database Modification',
      icon: Lock,
      description:
        'Generates an immutable cryptographic seal on the local client machine at the exact millisecond the student clicks "Submit Exam". This hash locks the candidate’s responses, candidate biometric ID, timestamp, and machine MAC address into an append-only transaction ledger before data is transmitted over the network. Even if a cloud database administrator is bribed weeks later, the mathematical hash on the public ledger will reject the altered score.',
      telemetryIngested: 'Client-Side Response Matrix Hash (SHA-256 / zk-SNARK Commitment)',
      forensicEquation: 'Seal = SHA-256(Responses || CandidateID || Timestamp || TerminalMAC)',
      status: 'CRYPTOGRAPHIC IMMUTABILITY PROTOCOL (v2.2)',
      auditTelemetry: {
        normalPattern: 'Client commit hash perfectly congruent with central database hash',
        anomalyPattern: 'Central database score modified post-exam; client seal verification fails mismatch',
        verdict: 'IMMUTABILITY PROOF: Central Cloud Database Alteration Blocked',
      },
    },
  ];

  const selectedModule = cbtModules.find((m) => m.id === activeModuleId) || cbtModules[0];

  return (
    <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] overflow-hidden text-left shadow-xs">
      {/* Clickable Dropdown / Accordion Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-5 bg-[#F7F5F0] hover:bg-[#ECE8DF] transition-colors flex items-center justify-between gap-4 cursor-pointer text-left"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-[#0B1F3A] text-[#C9A227] rounded-[2px] shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[2px] bg-[#0B1F3A] text-white tracking-wider uppercase">
                FUTURE ROADMAP (v2.0+)
              </span>
              <span className="text-[10px] font-mono text-[#5C6670] uppercase tracking-widest font-semibold hidden sm:inline">
                // CBT TELEMETRY & AGENCY COLLABORATION
              </span>
            </div>
            <h3 className="text-base font-serif font-bold text-[#0B1F3A] mt-0.5">
              Computer-Based Test (CBT) Forensics & Agency Collaboration Roadmap
            </h3>
            <p className="text-xs text-[#5C6670] font-sans mt-0.5 text-slate-600">
              Future-scope architecture for JEE Main / Advanced & online exams (Mouse Dynamics, Response Latency, Rogue Proxies, zk-Seals).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-sans font-medium text-[#0B1F3A] bg-white border border-[#5C6670]/30 px-3 py-1.5 rounded-[2px] hidden md:inline-flex items-center gap-1.5 shadow-2xs">
            <span>{isExpanded ? 'Hide CBT Roadmap' : 'Explore CBT Roadmap'}</span>
          </span>
          <div
            className={`p-2 rounded-[2px] border border-[#5C6670]/40 bg-white text-[#0B1F3A] transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* Expanded Content Body */}
      {isExpanded && (
        <div className="p-6 space-y-6 border-t border-[#5C6670]/30 animate-in fade-in duration-150">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-[#5C6670]/20">
            <p className="text-xs text-[#5C6670] font-sans max-w-4xl leading-relaxed">
              In collaboration with national testing agencies (TCS iON, NTA, EdCIL), Terra Trace expands beyond static OMR bubble audits into high-throughput digital client telemetry—detecting remote screen takeovers, solver speededness, and rogue proxy routers.
            </p>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-[2px] bg-[#C9A227]/15 border border-[#C9A227] text-[#0B1F3A] font-bold shrink-0">
              ENTERPRISE CBT SPECIFICATION (v2.0+)
            </span>
          </div>

      {/* Module Selector Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cbtModules.map((mod) => {
          const isSelected = activeModuleId === mod.id;
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => setActiveModuleId(mod.id)}
              className={`p-4 rounded-[2px] text-left transition-none cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-[#0B1F3A] text-white border-2 border-[#0B1F3A]'
                  : 'bg-[#F7F5F0] border border-[#5C6670]/40 text-[#1A1A1A] hover:border-[#0B1F3A]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#C9A227]' : 'text-[#0B1F3A]'}`} />
                  <span className={`font-mono text-[11px] font-bold ${isSelected ? 'text-white' : 'text-[#0B1F3A]'}`}>
                    MODULE {mod.number}
                  </span>
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-[#C9A227] shrink-0 animate-pulse" />
                )}
              </div>

              <div>
                <div className={`text-xs font-serif font-bold leading-tight ${isSelected ? 'text-white' : 'text-[#0B1F3A]'}`}>
                  {mod.title}
                </div>
                <div className={`text-[10px] font-mono mt-1 ${isSelected ? 'text-[#F7F5F0]/70' : 'text-[#5C6670]'}`}>
                  {mod.targetScam}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Deep-Dive Interactive Specification Panel for Selected Module */}
      <div className="bg-[#F7F5F0] border-2 border-[#0B1F3A] rounded-[2px] p-5 space-y-4">
        {/* Module Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#5C6670]/30">
          <div>
            <div className="text-[10px] font-mono text-[#8A1538] uppercase font-bold tracking-wider">
              TARGET MALPRACTICE VECTOR: {selectedModule.targetScam}
            </div>
            <h4 className="text-base font-bold text-[#0B1F3A] font-serif mt-0.5">
              {selectedModule.title}
            </h4>
            <p className="text-xs text-[#5C6670] font-sans">
              {selectedModule.subtitle}
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-[#0B1F3A] text-white font-bold shrink-0">
            {selectedModule.status}
          </span>
        </div>

        {/* Technical Explanation */}
        <div className="text-xs text-[#1A1A1A] font-sans leading-relaxed">
          {selectedModule.description}
        </div>

        {/* Technical Data Pipeline & Formula Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-[#FFFFFF] border border-[#5C6670]/30 rounded-[2px] space-y-1">
            <div className="text-[10px] font-mono text-[#5C6670] uppercase font-bold">
              AGENCY TELEMETRY DATASTREAM REQUIRED:
            </div>
            <div className="text-xs font-mono text-[#0B1F3A] font-semibold">
              {selectedModule.telemetryIngested}
            </div>
          </div>

          <div className="p-3 bg-[#FFFFFF] border border-[#5C6670]/30 rounded-[2px] space-y-1">
            <div className="text-[10px] font-mono text-[#5C6670] uppercase font-bold">
              MATHEMATICAL ANOMALY THRESHOLD:
            </div>
            <div className="text-xs font-mono text-[#8A1538] font-bold">
              {selectedModule.forensicEquation}
            </div>
          </div>
        </div>

        {/* Simulated Telemetry Comparison Box */}
        <div className="p-4 bg-[#FFFFFF] border border-[#5C6670]/40 rounded-[2px] space-y-2.5">
          <div className="text-[10px] font-mono uppercase text-[#0B1F3A] font-bold tracking-wider flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#0B1F3A]" />
            <span>LIVE TELEMETRY VERIFICATION BENCHMARK</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-2.5 bg-[#F7F5F0] border border-[#5C6670]/20 rounded-[2px]">
              <div className="text-[10px] text-[#5C6670] uppercase">Expected Clean Examinee Baseline:</div>
              <div className="text-xs text-[#138808] font-bold mt-1">
                ✓ {selectedModule.auditTelemetry.normalPattern}
              </div>
            </div>

            <div className="p-2.5 bg-[#F7F5F0] border border-[#8A1538]/30 rounded-[2px]">
              <div className="text-[10px] text-[#8A1538] uppercase">Compromised Terminal Telemetry Signal:</div>
              <div className="text-xs text-[#8A1538] font-bold mt-1">
                ✗ {selectedModule.auditTelemetry.anomalyPattern}
              </div>
            </div>
          </div>

          <div className="p-2 bg-[#0B1F3A] text-white rounded-[2px] text-xs font-mono flex items-center justify-between">
            <span className="text-[#C9A227] font-bold">STATUTORY AUDIT VERDICT:</span>
            <span className="text-white">{selectedModule.auditTelemetry.verdict}</span>
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};
