import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useIngestionStore } from '../stores/ingestionStore';

export const SimulatedDataBanner: React.FC = () => {
  const { datasets } = useIngestionStore();

  const hasSynthetic = Object.values(datasets).some(
    (d) => d.is_ingested && d.is_synthetic
  );

  if (!hasSynthetic) return null;

  return (
    <div className="w-full bg-[#FFFFFF] border-b border-[#C9A227] px-6 py-2 shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
        <div className="flex items-center gap-3">
          <div className="bg-[#C9A227] text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-[2px] uppercase flex items-center gap-1.5 shrink-0">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>SIMULATED DATA</span>
          </div>
          <p className="text-xs text-[#1A1A1A] font-sans">
            One or more loaded datasets contain synthetic mock records flagged with <code className="font-mono text-[11px] text-[#0B1F3A] bg-[#F7F5F0] border border-[#5C6670]/40 px-1 py-0.2 rounded-[2px]">is_synthetic: true</code>. Outputs are intended for audit workflow verification.
          </p>
        </div>
        <span className="text-[10px] font-mono text-[#5C6670] uppercase shrink-0">
          DATA HONESTY COMPLIANT
        </span>
      </div>
    </div>
  );
};
