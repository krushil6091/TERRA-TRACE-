import { create } from 'zustand';
import type { CandidateDrilldownResponse } from '../types';
import { api } from '../services/api';
import { generateEmbeddedDrilldown } from '../data/embeddedDatasets';

interface DrilldownStoreState {
  isOpen: boolean;
  selectedCandidateId: string | null;
  drilldownData: CandidateDrilldownResponse | null;
  isLoading: boolean;
  isExportingPdf: boolean;
  error: string | null;

  openDrilldown: (candidateId: string) => Promise<void>;
  closeDrilldown: () => void;
  exportPdf: () => Promise<void>;
  refreshDrilldown: () => Promise<void>;
}

export const useDrilldownStore = create<DrilldownStoreState>((set, get) => ({
  isOpen: false,
  selectedCandidateId: null,
  drilldownData: null,
  isLoading: false,
  isExportingPdf: false,
  error: null,

  openDrilldown: async (candidateId: string) => {
    set({
      isOpen: true,
      selectedCandidateId: candidateId,
      isLoading: true,
      error: null,
    });

    try {
      const data = await Promise.race([
        api.getCandidateDrilldown(candidateId),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Backend timeout')), 3000)
        ),
      ]);
      set({ drilldownData: data, isLoading: false });
    } catch {
      console.warn('Backend drilldown offline, generating embedded forensic dossier');
      const embedded = generateEmbeddedDrilldown(candidateId);
      set({ drilldownData: embedded, isLoading: false });
    }
  },

  closeDrilldown: () => {
    set({
      isOpen: false,
      selectedCandidateId: null,
      drilldownData: null,
      error: null,
    });
  },

  exportPdf: async () => {
    const { selectedCandidateId } = get();
    if (!selectedCandidateId) return;

    set({ isExportingPdf: true });
    try {
      await api.downloadDossierPdf(selectedCandidateId);
      set({ isExportingPdf: false });
    } catch {
      console.warn('Backend PDF generation unavailable, generating client-side print view');
      // Client-side print fallback: trigger window.print
      window.print();
      set({ isExportingPdf: false });
    }
  },

  refreshDrilldown: async () => {
    const { selectedCandidateId } = get();
    if (!selectedCandidateId) return;
    try {
      const data = await api.getCandidateDrilldown(selectedCandidateId);
      set({ drilldownData: data });
    } catch {
      const embedded = generateEmbeddedDrilldown(selectedCandidateId);
      set({ drilldownData: embedded });
    }
  },
}));
