import React, { useState, useEffect } from 'react';
import { useTriageStore } from '../stores/triageStore';
import { useAuth } from '../context/AuthContext';
import { Check } from 'lucide-react';
import type { InvestigationStatus } from '../types';

export const DecisionModal: React.FC = () => {
  const { decisionModal, closeDecisionModal, submitDecision, isSubmittingDecision } = useTriageStore();
  const { user } = useAuth();

  const [selectedStatus, setSelectedStatus] = useState<InvestigationStatus>('Confirmed');
  const [justification, setJustification] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isStamping, setIsStamping] = useState<boolean>(false);

  useEffect(() => {
    if (decisionModal.isOpen) {
      setSelectedStatus(decisionModal.targetStatus || 'Confirmed');
      setJustification('');
      setErrorMsg(null);
      setIsStamping(false);
    }
  }, [decisionModal.isOpen, decisionModal.targetStatus]);

  if (!decisionModal.isOpen || !decisionModal.item) {
    return null;
  }

  const item = decisionModal.item;
  const investigatorIdentity = user
    ? `${user.full_name} (${user.badge_id})`
    : 'Lead Forensic Auditor (EXAM-SEC-7749)';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim() || justification.trim().length < 4) {
      setErrorMsg('Mandatory free-text justification must be at least 4 characters explaining your rationale.');
      return;
    }

    try {
      setIsStamping(true);
      await submitDecision(
        item.entity_id,
        item.entity_type,
        selectedStatus,
        justification.trim(),
        investigatorIdentity
      );
      // Keep stamp visible briefly before closing
      setTimeout(() => {
        setIsStamping(false);
        closeDecisionModal();
      }, 700);
    } catch (err: any) {
      setIsStamping(false);
      setErrorMsg(err.message || 'Failed to submit decision.');
    }
  };

  const statusOptions: { status: InvestigationStatus; label: string; desc: string; dotColor: string }[] = [
    {
      status: 'Confirmed',
      label: 'Confirmed Tampering',
      desc: 'Affirm forensic anomaly. Mark alteration, OMR score inflation, or spatial collusion substantiated by human evidentiary review.',
      dotColor: 'bg-[#8A1538]',
    },
    {
      status: 'False Positive',
      label: 'Cleared / Congruent',
      desc: 'Clear candidate case. Statistical deviation explained by verified candidate performance baseline or academic record.',
      dotColor: 'bg-[#5C6670]',
    },
    {
      status: 'Escalated',
      label: 'Escalate to Board Inquiry Commission',
      desc: 'Refer candidate file to Senior Examination Board Disciplinary Committee for physical OMR retrieval and invigilator testimony.',
      dotColor: 'bg-[#0B1F3A]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-[#FFFFFF] border-2 border-[#0B1F3A] rounded-[2px] w-full max-w-xl my-auto text-left overflow-hidden shadow-2xl">
        {/* Ink Stamp Confirmation Overlay */}
        {isStamping && (
          <div className="absolute inset-0 z-30 bg-white/80 backdrop-blur-xs flex items-center justify-center p-6">
            <div className="animate-stamp border-4 border-[#8A1538] p-4 px-6 rounded-[2px] text-center bg-white shadow-xl rotate-[-3deg]">
              <div className="flex items-center justify-center gap-2 text-[#8A1538]">
                <Check className="w-6 h-6 stroke-[3]" />
                <span className="font-mono font-black text-xl tracking-widest uppercase">
                  ADJUDICATED &bull; COMMITTED
                </span>
              </div>
              <div className="text-[11px] font-mono text-[#5C6670] mt-1">
                IMMUTABLE AUDIT ENTRY RECORDED
              </div>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-5 border-b border-[#5C6670]/30 bg-[#FFFFFF] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-[#5C6670] uppercase font-bold tracking-wider">
              STATUTORY HUMAN ADJUDICATION ENCLAVE
            </div>
            <h3 className="text-lg font-bold text-[#0B1F3A] font-serif mt-0.5">
              Record Forensic Finding: {item.entity_id}
            </h3>
          </div>

          <button
            type="button"
            onClick={closeDecisionModal}
            className="text-xs font-mono text-[#5C6670] hover:text-[#0B1F3A] border border-[#5C6670]/40 px-2 py-1 rounded-[2px] cursor-pointer"
          >
            [Close]
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Target Metadata Summary */}
          <div className="p-3 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] space-y-1 text-xs font-sans">
            <div className="flex justify-between">
              <span className="text-[#5C6670]">Centre & Location:</span>
              <strong className="font-mono text-[#1A1A1A]">{item.centre_id} &bull; {item.city_name}, {item.state_name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C6670]">Seating Coordinate:</span>
              <span className="font-mono text-[#1A1A1A]">Room {item.room_id}, Seat #{item.seat_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C6670]">Composite Risk Score:</span>
              <span className="font-mono font-bold text-[#8A1538]">{item.combined_risk_score.toFixed(1)} / 100</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-[#8A1538] text-white text-xs rounded-[2px] font-sans">
              {errorMsg}
            </div>
          )}

          {/* Status Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider font-sans">
              Select Adjudication Status:
            </label>
            <div className="space-y-2">
              {statusOptions.map((opt) => {
                const isSelected = selectedStatus === opt.status;
                return (
                  <div
                    key={opt.status}
                    onClick={() => setSelectedStatus(opt.status)}
                    className={`p-3 border rounded-[2px] cursor-pointer transition-none ${
                      isSelected
                        ? 'border-[#0B1F3A] bg-[#0B1F3A]/5 ring-1 ring-[#0B1F3A]'
                        : 'border-[#5C6670]/40 bg-[#FFFFFF] hover:bg-[#F7F5F0]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs font-mono font-bold text-[#1A1A1A]">
                        <span className={`w-2 h-2 rounded-full inline-block mr-1.5 shrink-0 ${opt.dotColor}`} />
                        <span>{opt.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#5C6670]">
                        {isSelected ? 'SELECTED' : 'CLICK TO SELECT'}
                      </span>
                    </div>
                    <p className="text-xs text-[#5C6670] font-sans mt-1 leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mandatory Free-Text Rationale */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider font-sans">
                Statutory Justification (Mandatory):
              </label>
              <span className="text-[10px] font-mono text-[#5C6670]">
                Logged immutably to audit register
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Detail specific forensic findings, score delta comparison, seating correlation, or exam room physical reports justifying this finding..."
              className="w-full p-2.5 text-xs font-sans bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] text-[#1A1A1A] focus:outline-none focus:border-[#0B1F3A]"
            />
          </div>

          {/* Officer Identity & Action Bar */}
          <div className="pt-2 border-t border-[#5C6670]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-[10px] font-mono text-[#5C6670]">
              Auditor: <strong className="text-[#0B1F3A]">{investigatorIdentity}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeDecisionModal}
                disabled={isSubmittingDecision}
                className="px-3 py-1.5 border border-[#5C6670] text-[#1A1A1A] text-xs font-sans rounded-[2px] hover:bg-[#F7F5F0] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingDecision || !justification.trim()}
                className="px-4 py-2 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white text-xs font-mono uppercase font-bold rounded-[2px] border border-[#0B1F3A] cursor-pointer disabled:opacity-50"
              >
                {isSubmittingDecision ? 'Committing to Ledger...' : 'Commit Finding to Audit Ledger'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
