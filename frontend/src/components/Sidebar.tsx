import React from 'react';
import { useTriageStore } from '../stores/triageStore';

export type SidebarTab = 'ingestion' | 'methodology' | 'pipeline' | 'queue' | 'dossier' | 'audit';

interface SidebarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { summary } = useTriageStore();

  const navItems: { id: SidebarTab; label: string; number: string; badge?: number }[] = [
    { id: 'ingestion', label: 'Ingestion Register', number: '01' },
    { id: 'pipeline', label: 'Analytical Engine', number: '02' },
    { id: 'queue', label: 'Adjudication Queue', number: '03', badge: summary.pending },
    { id: 'dossier', label: 'Evidence Dossier', number: '04' },
    { id: 'audit', label: 'Immutable Audit Log', number: '05' },
  ];

  return (
    <>
      {/* Desktop Fixed Left Sidebar Navigation (Screens >= 768px) */}
      <aside className="hidden md:flex w-64 bg-[#FFFFFF] border-r border-[#5C6670] flex-col justify-between py-5 px-3 shrink-0 select-none">
        <div className="space-y-4">
          {/* Register Section Label */}
          <div className="px-2">
            <div className="text-[10px] font-mono text-[#5C6670] uppercase tracking-widest font-semibold">
              OFFICIAL FORENSIC REGISTER
            </div>
            <div className="text-xs font-serif font-bold text-[#0B1F3A] mt-0.5">
              Audit Navigation Index
            </div>
          </div>

          <div className="border-t border-[#5C6670]/30" />

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-[2px] text-xs font-sans font-medium transition-all duration-150 ease-out cursor-pointer ${
                    isActive
                      ? 'bg-[#0B1F3A] text-white shadow-sm font-semibold'
                      : 'text-[#1A1A1A] hover:bg-[#0B1F3A]/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`font-mono text-[11px] ${isActive ? 'text-[#F7F5F0]/90 font-bold' : 'text-[#5C6670]'}`}>
                      {item.number}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-[2px] text-[10px] font-mono font-bold ${
                        isActive
                          ? 'bg-[#C9A227] text-white'
                          : 'bg-[#8A1538] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Enclave Control */}
        <div className="space-y-2 pt-4 border-t border-[#5C6670]/30">
          <div className="px-2">
            <div className="text-[10px] font-mono text-[#5C6670] uppercase tracking-wider">SYSTEM PROTOCOL</div>
            <div className="text-[11px] font-mono font-bold text-[#0B1F3A] mt-0.5">
              Air-Gapped &bull; SHA-256 Checkpoints
            </div>
          </div>

          <div className="p-2.5 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] text-[10px] font-mono text-[#5C6670] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#138808] shrink-0 animate-pulse" />
            <span className="text-[#0B1F3A] font-semibold">LOCAL ENCLAVE VERIFIED</span>
          </div>
        </div>
      </aside>

      {/* Mobile Fixed Bottom Navigation Bar (Screens < 768px) */}
      <nav
        aria-label="Mobile Register Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#FFFFFF] border-t border-[#5C6670] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] flex items-stretch justify-around px-1 py-1 pb-[calc(env(safe-area-inset-bottom,0px)+4px)] select-none"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const shortLabels: Record<SidebarTab, string> = {
            ingestion: 'Ingest',
            pipeline: 'Engine',
            queue: 'Queue',
            dossier: 'Dossier',
            audit: 'Audit',
            methodology: 'Method',
          };
          const label = shortLabels[item.id] || item.label;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 min-h-[48px] py-1 px-1 flex flex-col items-center justify-center rounded-[2px] transition-colors relative cursor-pointer ${
                isActive
                  ? 'bg-[#0B1F3A] text-white font-semibold'
                  : 'text-[#5C6670] hover:text-[#0B1F3A] hover:bg-[#0B1F3A]/5'
              }`}
            >
              {/* Active Top Bar Indicator */}
              {isActive && (
                <span className="absolute top-0 inset-x-1 h-[2px] bg-[#C9A227]" />
              )}

              {/* Register Number */}
              <span className={`font-mono text-[10px] leading-tight ${isActive ? 'text-[#C9A227] font-bold' : 'text-[#5C6670]'}`}>
                {item.number}
              </span>

              {/* Short Title */}
              <span className="text-[11px] font-sans font-medium tracking-tight mt-0.5 leading-none">
                {label}
              </span>

              {/* Live Badge Counter */}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`absolute top-1 right-2 px-1 py-0.2 rounded-full text-[9px] font-mono font-bold leading-none ${
                    isActive
                      ? 'bg-[#C9A227] text-[#0B1F3A]'
                      : 'bg-[#8A1538] text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
