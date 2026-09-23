import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Copy, Check } from 'lucide-react';

interface LedgerBlock {
  blockNumber: string;
  name: string;
  category: string;
  timestamp: string;
  sha256Hash: string;
  previousHash: string;
  entityCount: string;
  legalStatus: string;
  verificationStatus: 'Verified' | 'Pending' | 'Audited';
}

const LEDGER_BLOCKS: LedgerBlock[] = [
  {
    blockNumber: 'BLOCK // 00',
    name: 'Enclave Genesis & Clock Seal',
    category: 'HARDWARE ATTESTATION',
    timestamp: '2026-09-23T04:30:00.000Z',
    sha256Hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    entityCount: 'Air-Gap Enclave Node #01',
    legalStatus: 'FIPS 140-3 Compliant',
    verificationStatus: 'Verified'
  },
  {
    blockNumber: 'BLOCK // 01',
    name: 'Physical OMR Item Responses (Paper Ingestion)',
    category: 'PHYSICAL ARTIFACT RECORD',
    timestamp: '2026-09-23T04:31:12.418Z',
    sha256Hash: '7a8f9b2c3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a',
    previousHash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    entityCount: '2,000 Examinees / 4,00,000 Bubbles',
    legalStatus: 'Primary Court Evidence (Physical)',
    verificationStatus: 'Verified'
  },
  {
    blockNumber: 'BLOCK // 02',
    name: 'Central Server Results Database Ingestion',
    category: 'DIGITAL REPOSITORY RECORD',
    timestamp: '2026-09-23T04:31:13.092Z',
    sha256Hash: '9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d',
    previousHash: '7a8f9b2c3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a',
    entityCount: '2,000 Candidate Records Ingested',
    legalStatus: 'Target for Bitwise Reconciliation',
    verificationStatus: 'Verified'
  },
  {
    blockNumber: 'BLOCK // 03',
    name: 'Physical Spatial Seating Layout Matrix',
    category: 'GEOMETRIC ENVIRONMENT RECORD',
    timestamp: '2026-09-23T04:31:13.541Z',
    sha256Hash: '4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c',
    previousHash: '9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d',
    entityCount: '80 Exam Halls / 5×5 Seating Grids',
    legalStatus: 'Spatial Distance Ground Truth',
    verificationStatus: 'Verified'
  },
  {
    blockNumber: 'BLOCK // 04',
    name: 'Multi-Layer Forensic Findings Synthesis',
    category: 'ALGORITHMIC COMPUTATION',
    timestamp: '2026-09-23T04:31:14.205Z',
    sha256Hash: '1f2e3d4c5b6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
    previousHash: '4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c',
    entityCount: '15 Reconciliation / 2 Seating Pairs',
    legalStatus: 'Section 65B Mathematical Proof',
    verificationStatus: 'Verified'
  },
  {
    blockNumber: 'BLOCK // 05',
    name: 'Statutory Investigator Adjudication Signature',
    category: 'HUMAN DECISION SEAL',
    timestamp: '2026-09-23T04:32:00.120Z',
    sha256Hash: '3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c',
    previousHash: '1f2e3d4c5b6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
    entityCount: 'Cryptographically Signed by Auditor',
    legalStatus: 'Final Courtroom Certificate Issued',
    verificationStatus: 'Verified'
  }
];

export const ChainOfCustodyLedger: React.FC = () => {
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [auditProgress, setAuditProgress] = useState<number>(100);

  const handleRunAudit = () => {
    setIsAuditing(true);
    setAuditProgress(0);
    const interval = setInterval(() => {
      setAuditProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAuditing(false);
          return 100;
        }
        return prev + 20;
      });
    }, 180);
  };

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1800);
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-5 space-y-4 text-left shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#5C6670]/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#5C6670] uppercase font-bold tracking-wider">
              CRYPTOGRAPHIC CHAIN OF CUSTODY (CoC) // EVIDENCE VAULT
            </span>
            <span className="px-1.5 py-0.2 bg-[#0B1F3A] text-white text-[9px] font-mono rounded-[2px] uppercase">
              INDIAN EVIDENCE ACT §65B / BSA §63
            </span>
          </div>
          <h3 className="text-base font-bold text-[#0B1F3A] font-serif mt-0.5">
            Immutable Forensic Hash Sequencing & Chain-of-Custody Ledger
          </h3>
          <p className="text-xs text-[#5C6670] font-sans mt-0.5">
            Every file ingestion, algorithmic calculation, and adjudication determination is chained immutably via SHA-256 Merkle sequences. Any single bit modification retroactively invalidates downstream seals.
          </p>
        </div>

        {/* Audit Verification Trigger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="px-3.5 py-2 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white text-xs font-mono font-medium rounded-[2px] border border-[#0B1F3A] flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
            <span>{isAuditing ? `Auditing (${auditProgress}%)...` : 'Verify Bitwise Integrity'}</span>
          </button>
        </div>
      </div>

      {/* Audit Banner Status */}
      <div className="p-3 bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-[#138808] shrink-0 animate-pulse" />
          <span className="text-[#0B1F3A] font-bold">
            CHAIN INTEGRITY STATUS: 6 OF 6 BLOCKS BITWISE LOCKED
          </span>
          <span className="text-[#5C6670] font-normal">
            &bull; Zero hash collisions &bull; Zero bit mutations detected
          </span>
        </div>
        <div className="text-[11px] font-mono text-[#5C6670]">
          Root Merkle Hash: <code className="text-[#0B1F3A] font-bold">3d2c1b0a...3d2c</code>
        </div>
      </div>

      {/* Sequential Blocks Display */}
      <div className="space-y-3">
        {LEDGER_BLOCKS.map((block, idx) => (
          <div
            key={block.blockNumber}
            className="border border-[#5C6670]/40 rounded-[2px] bg-[#FFFFFF] p-3.5 space-y-2 hover:border-[#0B1F3A] transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#5C6670]/20 pb-2">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 bg-[#0B1F3A] text-white text-[10px] font-mono font-bold rounded-[2px]">
                  {block.blockNumber}
                </span>
                <span className="text-xs font-bold font-serif text-[#0B1F3A]">
                  {block.name}
                </span>
                <span className="text-[10px] font-mono text-[#5C6670] px-1.5 py-0.2 bg-[#F7F5F0] rounded-[2px] border border-[#5C6670]/30">
                  {block.category}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-[#5C6670] text-[11px]">{block.timestamp}</span>
                <span className="inline-flex items-center text-[#138808] font-bold text-[11px] gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{block.verificationStatus}</span>
                </span>
              </div>
            </div>

            {/* Block Data Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
              {/* Hashes Left */}
              <div className="md:col-span-8 space-y-1.5 font-mono">
                <div className="flex items-center justify-between bg-[#F7F5F0] p-1.5 px-2.5 rounded-[2px] border border-[#5C6670]/20">
                  <span className="text-[10px] text-[#5C6670] uppercase">SHA-256 Hash:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-[#0B1F3A] font-bold text-[11px]">
                      {block.sha256Hash}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(block.sha256Hash)}
                      className="text-[#5C6670] hover:text-[#0B1F3A] cursor-pointer"
                      title="Copy SHA-256 Hash"
                    >
                      {copiedHash === block.sha256Hash ? <Check className="w-3 h-3 text-[#138808]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {idx > 0 && (
                  <div className="flex items-center justify-between text-[10px] text-[#5C6670] px-2.5">
                    <span>Parent Block Hash:</span>
                    <code className="text-[#5C6670]">{block.previousHash.slice(0, 32)}...</code>
                  </div>
                )}
              </div>

              {/* Legal & Entity Status Right */}
              <div className="md:col-span-4 bg-[#F7F5F0] p-2 rounded-[2px] border border-[#5C6670]/20 flex flex-col justify-between">
                <div>
                  <div className="text-[9px] font-mono text-[#5C6670] uppercase">Scope & Legal Evidentiary Role</div>
                  <div className="text-xs font-semibold text-[#0B1F3A] font-serif mt-0.5">
                    {block.legalStatus}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-[#5C6670] mt-1 pt-1 border-t border-[#5C6670]/20">
                  {block.entityCount}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
