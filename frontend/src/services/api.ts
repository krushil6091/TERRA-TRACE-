import type {
  RecordType,
  IngestionResponse,
  DatasetStatus,
  AuditLogEntry,
  AdminUser,
  TriageQueueResponse,
  DecisionRequest,
  DecisionResponse,
  HierarchyRiskResponse,
  CandidateDrilldownResponse,
  DatasetPreviewResponse,
} from '../types';

const envApi = import.meta.env.VITE_API_URL;
const API_BASE = envApi
  ? (envApi.endsWith('/api') ? envApi : `${envApi.replace(/\/+$/, '')}/api`)
  : '/api';

export const api = {
  async getDatasetsStatus(): Promise<Record<RecordType, DatasetStatus>> {
    const res = await fetch(`${API_BASE}/ingest/status`);
    if (!res.ok) throw new Error('Failed to fetch dataset status');
    return res.json();
  },

  async ingestFile(
    file: File,
    recordType: RecordType,
    isSynthetic: boolean,
    uploaderIdentity: string
  ): Promise<IngestionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('record_type', recordType);
    formData.append('is_synthetic', String(isSynthetic));

    const res = await fetch(`${API_BASE}/ingest`, {
      method: 'POST',
      headers: {
        'X-Uploader-Identity': uploaderIdentity,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw data.detail || new Error('Ingestion failed');
    }
    return data;
  },

  async generateSampleData(uploaderIdentity: string): Promise<Record<string, IngestionResponse>> {
    const res = await fetch(`${API_BASE}/ingest/generate-sample`, {
      method: 'POST',
      headers: {
        'X-Uploader-Identity': uploaderIdentity,
      },
    });
    if (!res.ok) throw new Error('Failed to generate sample data');
    return res.json();
  },

  async loadSamplePreset(preset: string, uploaderIdentity: string): Promise<Record<string, IngestionResponse>> {
    const res = await fetch(`${API_BASE}/ingest/load-sample?preset=${encodeURIComponent(preset)}`, {
      method: 'POST',
      headers: {
        'X-Uploader-Identity': uploaderIdentity,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw err.detail || new Error('Failed to load sample dataset');
    }
    return res.json();
  },

  async resetSystem(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/ingest/reset`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset system data');
    return res.json();
  },

  async getAuditLogs(recordType?: string): Promise<AuditLogEntry[]> {
    const url = recordType
      ? `${API_BASE}/audit-logs?record_type=${encodeURIComponent(recordType)}`
      : `${API_BASE}/audit-logs`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getSession(): Promise<AdminUser> {
    const res = await fetch(`${API_BASE}/auth/session`);
    if (!res.ok) throw new Error('Failed to fetch admin session');
    return res.json();
  },

  async login(username: string, password: string): Promise<AdminUser> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Invalid local credentials');
    return res.json();
  },

  async getTriageQueue(params: {
    status?: string;
    search?: string;
    min_risk?: number;
    page?: number;
    limit?: number;
  }): Promise<TriageQueueResponse> {
    const searchParams = new URLSearchParams();
    if (params.status && params.status !== 'All') searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);
    if (params.min_risk !== undefined && params.min_risk > 0) searchParams.append('min_risk', String(params.min_risk));
    if (params.page) searchParams.append('page', String(params.page));
    if (params.limit) searchParams.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/queue?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch triage queue');
    return res.json();
  },

  async submitDecision(decision: DecisionRequest): Promise<DecisionResponse> {
    const res = await fetch(`${API_BASE}/decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(decision),
    });

    const data = await res.json();
    if (!res.ok) {
      throw data.detail || new Error('Failed to submit decision');
    }
    return data;
  },

  async getHierarchyRisk(): Promise<HierarchyRiskResponse> {
    const res = await fetch(`${API_BASE}/queue/geography`);
    if (!res.ok) throw new Error('Failed to fetch hierarchy risk data');
    return res.json();
  },

  async getCandidateDrilldown(candidateId: string): Promise<CandidateDrilldownResponse> {
    const res = await fetch(`${API_BASE}/drilldown/${encodeURIComponent(candidateId)}`);
    if (!res.ok) throw new Error(`Failed to load drilldown for candidate ${candidateId}`);
    return res.json();
  },

  async downloadDossierPdf(candidateId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/dossier/${encodeURIComponent(candidateId)}`);
    if (!res.ok) throw new Error('Failed to generate PDF evidence dossier');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TerraTrace_Evidence_Dossier_${candidateId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  async getDetectionResults(): Promise<import('../types').DetectionResultsResponse> {
    const res = await fetch(`${API_BASE}/detection/results`);
    if (!res.ok) throw new Error('Failed to fetch detection results');
    return res.json();
  },

  async getDatasetPreview(
    recordType: RecordType,
    options?: {
      limit?: number;
      offset?: number;
      onlyFlagged?: boolean;
      search?: string;
    }
  ): Promise<DatasetPreviewResponse> {
    const searchParams = new URLSearchParams();
    if (options?.limit) searchParams.append('limit', String(options.limit));
    if (options?.offset) searchParams.append('offset', String(options.offset));
    if (options?.onlyFlagged) searchParams.append('only_flagged', 'true');
    if (options?.search) searchParams.append('search', options.search);

    const res = await fetch(`${API_BASE}/ingest/preview/${recordType}?${searchParams.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw err.detail || new Error(`Failed to load dataset preview for ${recordType}`);
    }
    return res.json();
  },
};

