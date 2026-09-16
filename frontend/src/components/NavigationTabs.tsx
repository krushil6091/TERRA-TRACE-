import React from 'react';
import { Scale, Database } from 'lucide-react';
import { useTriageStore } from '../stores/triageStore';

export type ActiveTab = 'ingestion' | 'triage';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onSelectTab }) => {
  const { summary } = useTriageStore();

  return (
    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
      <button
        onClick={() => onSelectTab('triage')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
          activeTab === 'triage'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
        }`}
      >
        <Scale className="w-4 h-4 text-emerald-400" />
        <span className="font-semibold">Investigator Triage Dashboard</span>
        {summary.pending > 0 && (
          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
            {summary.pending} pending
          </span>
        )}
      </button>

      <button
        onClick={() => onSelectTab('ingestion')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
          activeTab === 'ingestion'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
        }`}
      >
        <Database className="w-4 h-4 text-slate-400" />
        <span className="font-semibold">Data Ingestion & Cryptography</span>
      </button>
    </div>
  );
};
