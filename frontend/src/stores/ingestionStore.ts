import { create } from 'zustand';
import type { RecordType, DatasetStatus, IngestionResponse, ValidationErrorDetail, AuditLogEntry } from '../types';
import { api } from '../services/api';

export type ShieldState = 'idle' | 'uploading' | 'validating' | 'verified' | 'error';

interface IngestionStoreState {
  datasets: Record<RecordType, DatasetStatus>;
  uploadStatus: Record<RecordType, ShieldState>;
  uploadErrors: Record<RecordType, ValidationErrorDetail | string | null>;
  lastResponses: Record<RecordType, IngestionResponse | null>;
  auditLogs: AuditLogEntry[];
  isLoadingLogs: boolean;
  isGeneratingSamples: boolean;
  isInitialLoading: boolean;

  fetchDatasetStatuses: () => Promise<void>;
  fetchAuditLogs: (recordType?: string) => Promise<void>;
  uploadFile: (file: File, recordType: RecordType, isSynthetic: boolean, uploaderIdentity: string) => Promise<boolean>;
  generateSampleDatasets: (uploaderIdentity: string) => Promise<void>;
  loadSamplePreset: (preset: string, uploaderIdentity: string) => Promise<void>;
  resetSystem: () => Promise<void>;
  resetError: (recordType: RecordType) => void;
}

const initialDatasetStatuses: Record<RecordType, DatasetStatus> = {
  omr: { record_type: 'omr', is_ingested: false, row_count: 0, candidate_count: 0, is_synthetic: false },
  server: { record_type: 'server', is_ingested: false, row_count: 0, candidate_count: 0, is_synthetic: false },
  seating: { record_type: 'seating', is_ingested: false, row_count: 0, candidate_count: 0, is_synthetic: false },
};

export const useIngestionStore = create<IngestionStoreState>((set, get) => ({
  datasets: initialDatasetStatuses,
  uploadStatus: {
    omr: 'idle',
    server: 'idle',
    seating: 'idle',
  },
  uploadErrors: {
    omr: null,
    server: null,
    seating: null,
  },
  lastResponses: {
    omr: null,
    server: null,
    seating: null,
  },
  auditLogs: [],
  isLoadingLogs: false,
  isGeneratingSamples: false,
  isInitialLoading: true,

  fetchDatasetStatuses: async () => {
    try {
      const statuses = await api.getDatasetsStatus();
      set((state) => {
        // Compute shield states from backend verification status
        const newUploadStatus = { ...state.uploadStatus };
        for (const key of ['omr', 'server', 'seating'] as RecordType[]) {
          if (statuses[key]?.is_ingested && newUploadStatus[key] !== 'uploading' && newUploadStatus[key] !== 'validating') {
            newUploadStatus[key] = 'verified';
          }
        }
        return {
          datasets: statuses,
          uploadStatus: newUploadStatus,
          isInitialLoading: false,
        };
      });
    } catch (err) {
      console.error('Failed to fetch dataset statuses:', err);
      set({ isInitialLoading: false });
    }
  },

  fetchAuditLogs: async (recordType?: string) => {
    set({ isLoadingLogs: true });
    try {
      const logs = await api.getAuditLogs(recordType);
      set({ auditLogs: logs, isLoadingLogs: false });
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      set({ isLoadingLogs: false });
    }
  },

  uploadFile: async (file: File, recordType: RecordType, isSynthetic: boolean, uploaderIdentity: string) => {
    // Set status to validating ONLY during backend processing; NEVER turn green optimistically
    set((state) => ({
      uploadStatus: { ...state.uploadStatus, [recordType]: 'validating' },
      uploadErrors: { ...state.uploadErrors, [recordType]: null },
    }));

    try {
      const response = await api.ingestFile(file, recordType, isSynthetic, uploaderIdentity);
      
      // ONLY turn green AFTER backend confirms SHA-256 hash & schema validation succeeded
      set((state) => ({
        uploadStatus: { ...state.uploadStatus, [recordType]: 'verified' },
        lastResponses: { ...state.lastResponses, [recordType]: response },
        uploadErrors: { ...state.uploadErrors, [recordType]: null },
      }));

      // Refresh dataset status and audit logs
      await get().fetchDatasetStatuses();
      await get().fetchAuditLogs();
      return true;
    } catch (err: any) {
      // Set to error state
      set((state) => ({
        uploadStatus: { ...state.uploadStatus, [recordType]: 'error' },
        uploadErrors: { ...state.uploadErrors, [recordType]: err },
      }));
      await get().fetchAuditLogs();
      return false;
    }
  },

  generateSampleDatasets: async (uploaderIdentity: string) => {
    set({
      isGeneratingSamples: true,
      uploadStatus: { omr: 'validating', server: 'validating', seating: 'validating' },
      uploadErrors: { omr: null, server: null, seating: null },
    });

    try {
      const results = await api.generateSampleData(uploaderIdentity);
      set({
        uploadStatus: { omr: 'verified', server: 'verified', seating: 'verified' },
        lastResponses: results as any,
        isGeneratingSamples: false,
      });
      await get().fetchDatasetStatuses();
      await get().fetchAuditLogs();
    } catch (err: any) {
      const errorMsg = typeof err === 'string' ? err : err?.message || 'Failed to generate sample datasets. Please verify backend connection.';
      set({
        isGeneratingSamples: false,
        uploadStatus: { omr: 'error', server: 'error', seating: 'error' },
        uploadErrors: {
          omr: errorMsg,
          server: errorMsg,
          seating: errorMsg,
        },
      });
      console.error('Failed to generate sample datasets:', err);
    }
  },

  loadSamplePreset: async (preset: string, uploaderIdentity: string) => {
    set({
      isGeneratingSamples: true,
      uploadStatus: { omr: 'validating', server: 'validating', seating: 'validating' },
      uploadErrors: { omr: null, server: null, seating: null },
    });

    try {
      const results = await api.loadSamplePreset(preset, uploaderIdentity);
      const newStatus: any = {};
      for (const [k] of Object.entries(results)) {
        newStatus[k] = 'verified';
      }
      set({
        uploadStatus: { ...get().uploadStatus, ...newStatus },
        lastResponses: { ...get().lastResponses, ...results } as any,
        isGeneratingSamples: false,
      });
      await get().fetchDatasetStatuses();
      await get().fetchAuditLogs();
    } catch (err: any) {
      const errorStatus: any = {};
      const errorObj: any = {};
      for (const k of ['omr', 'server', 'seating']) {
        errorStatus[k] = 'error';
        errorObj[k] = typeof err === 'string' ? err : err?.message || 'Failed to load dataset preset. Please check backend connection.';
      }
      set({
        isGeneratingSamples: false,
        uploadStatus: { ...get().uploadStatus, ...errorStatus },
        uploadErrors: { ...get().uploadErrors, ...errorObj },
      });
      console.error('Failed to load sample dataset preset:', err);
    }
  },

  resetSystem: async () => {
    try {
      await api.resetSystem();
      set({
        datasets: initialDatasetStatuses,
        uploadStatus: {
          omr: 'idle',
          server: 'idle',
          seating: 'idle',
        },
        uploadErrors: {
          omr: null,
          server: null,
          seating: null,
        },
        lastResponses: {
          omr: null,
          server: null,
          seating: null,
        },
        auditLogs: [],
      });
    } catch (err) {
      console.error('Failed to reset system:', err);
      throw err;
    }
  },

  resetError: (recordType: RecordType) => {
    set((state) => ({
      uploadStatus: { ...state.uploadStatus, [recordType]: 'idle' },
      uploadErrors: { ...state.uploadErrors, [recordType]: null },
    }));
  },
}));
