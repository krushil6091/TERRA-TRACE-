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
    <aside className="w-64 bg-[#FFFFFF] border-r border-[#5C6670] flex flex-col justify-between py-5 px-3 shrink-0 select-none">
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
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full text-left flex items-center justify-between px-3 py-2.5 text-xs font-sans transition-all duration-150 ease-out cursor-pointer ${
                  isActive
                    ? 'bg-[#0B1F3A] text-white shadow-xs font-semibold border-l-[3px] border-[#C9A227]'
                    : 'text-[#1E293B] hover:bg-[#F7F5F0] hover:text-[#0B1F3A] border-l-[3px] border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 font-bold ${
                      isActive
                        ? 'bg-[#071324] text-[#FDE047] border border-white/10'
                        : 'bg-[#F7F5F0] text-[#5C6670] border border-[#5C6670]/30'
                    }`}
                  >
                    {item.number}
                  </span>
                  <span className="tracking-tight">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono font-bold ${
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
      </div>

      {/* Bottom Enclave Control */}
      <div className="space-y-2 pt-4 border-t border-[#5C6670]/30">
        <div className="px-2">
          <div className="text-[10px] font-mono text-[#5C6670] uppercase tracking-wider font-semibold">SYSTEM PROTOCOL</div>
          <div className="text-[11px] font-mono font-bold text-[#0B1F3A] mt-0.5">
            Air-Gapped &bull; SHA-256 Checkpoints
          </div>
        </div>

        <div className="p-2.5 bg-[#F7F5F0] border border-[#5C6670]/40 text-[10px] font-mono text-[#5C6670] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#138808] shrink-0 animate-pulse" />
          <span className="text-[#0B1F3A] font-bold">LOCAL ENCLAVE VERIFIED</span>
        </div>

        <a
          href="/manual.html"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-stretch overflow-hidden border border-[#0B1F3A] bg-[#0B1F3A] hover:bg-[#122A4E] text-white text-xs font-mono font-bold uppercase transition-colors text-center shadow-xs group"
        >
          <span className="flex items-center justify-center px-2.5 bg-[#071324] text-white border-r border-[#1E293B]">
            📖
          </span>
          <span className="py-2 px-3 flex-1 tracking-wider text-center">
            Team Pitch Manual
          </span>
        </a>
      </div>
    </aside>
  );
};
