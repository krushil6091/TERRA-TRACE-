import { create } from 'zustand';
import type { CandidateDrilldownResponse } from '../types';
import { api } from '../services/api';

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
      const data = await api.getCandidateDrilldown(candidateId);
      set({ drilldownData: data, isLoading: false });
    } catch (err: any) {
      console.error('Failed to load drilldown:', err);
      set({ error: err.message || 'Failed to load candidate analytics', isLoading: false });
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
    } catch (err) {
      console.error('Failed to export PDF dossier:', err);
      set({ isExportingPdf: false });
    }
  },

  refreshDrilldown: async () => {
    const { selectedCandidateId } = get();
    if (!selectedCandidateId) return;
    try {
      const data = await api.getCandidateDrilldown(selectedCandidateId);
      set({ drilldownData: data });
    } catch (err) {
      console.error('Failed to refresh drilldown:', err);
    }
  },
}));
