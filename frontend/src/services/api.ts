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
  DetectionResultsResponse,
} from '../types';

const STORAGE_KEY = 'TERRA_TRACE_BACKEND_URL';

/**
 * Returns user-configured custom backend URL stored in localStorage, if any.
 */
export function getStoredBackendUrl(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Saves or clears custom backend URL in localStorage and announces change.
 */
export function setStoredBackendUrl(url: string): void {
  if (typeof window === 'undefined') return;
  try {
    const trimmed = url.trim();
    if (!trimmed) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, trimmed.replace(/\/+$/, ''));
    }
  } catch {
    // Ignore storage quota errors
  }
  window.dispatchEvent(new CustomEvent('terra-trace-backend-changed'));
}

/**
 * Resolves active backend root URL in order of priority:
 * 1. User manual override in localStorage
 * 2. VITE_API_URL environment variable baked at build time
 * 3. Localhost fallback if running on local dev
 * 4. Empty string (relative /api on same host)
 */
export function getActiveBackendUrl(): string {
  const stored = getStoredBackendUrl();
  if (stored) return stored.replace(/\/+$/, '');

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8000';
    }
  }

  return '';
}

/**
 * Resolves full /api base path.
 */
export function getApiBase(): string {
  const active = getActiveBackendUrl();
  if (!active) return '/api';
  return active.endsWith('/api') ? active : `${active}/api`;
}

/**
 * Health check utility to probe the backend service.
 */
export async function testBackendHealth(customUrl?: string): Promise<{
  ok: boolean;
  status: number;
  latencyMs: number;
  message: string;
}> {
  const target = (customUrl !== undefined ? customUrl.trim() : getActiveBackendUrl()).replace(/\/+$/, '');
  const url = target ? `${target}/health` : '/health';
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    const latencyMs = Date.now() - start;
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('text/html')) {
      return {
        ok: false,
        status: res.status,
        latencyMs,
        message: 'Endpoint returned HTML (Vercel SPA fallback). Backend URL is not pointing to your Render service.',
      };
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        latencyMs,
        message: `HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const data = await res.json().catch(() => ({}));
    if (data.status === 'HEALTHY' || data.status === 'OPERATIONAL' || res.status === 200) {
      return {
        ok: true,
        status: 200,
        latencyMs,
        message: 'Backend operational and ready.',
      };
    }

    return {
      ok: true,
      status: res.status,
      latencyMs,
      message: 'Backend responded successfully.',
    };
  } catch (err: any) {
    clearTimeout(timer);
    const latencyMs = Date.now() - start;
    if (err.name === 'AbortError') {
      return {
        ok: false,
        status: 0,
        latencyMs,
        message: 'Request timed out. Backend may be waking up from sleep on Render (free tier takes ~30-45s).',
      };
    }
    return {
      ok: false,
      status: 0,
      latencyMs,
      message: err.message || 'Unable to reach backend endpoint.',
    };
  }
}

/**
 * Safe fetch wrapper with timeout, HTML catch-all detection, and actionable error messages.
 */
const REQUEST_TIMEOUT_MS = 45000;

async function safeFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const base = getApiBase();
  const url = `${base}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timer);

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error(
        `Backend API connection required: The server returned HTML instead of API data. Your Vercel frontend is not connected to the live Render backend service. Click the 'API CONFIG' button in the top bar to set your Render API URL.`
      );
    }

    return res;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(
        `Request timed out after 45 seconds. Your Render backend service may be waking up from free-tier sleep. Please wait 15 seconds and try again.`
      );
    }
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error(
        `Unable to reach backend at ${base}. Please verify that your Render backend service is awake, or click 'API CONFIG' in the top bar to verify the backend URL.`
      );
    }
    throw err;
  }
}

export const api = {
  async getDatasetsStatus(): Promise<Record<RecordType, DatasetStatus>> {
    const res = await safeFetch('/ingest/status');
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

    const res = await safeFetch('/ingest', {
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
    const res = await safeFetch('/ingest/generate-sample', {
      method: 'POST',
      headers: {
        'X-Uploader-Identity': uploaderIdentity,
      },
    });
    if (!res.ok) throw new Error('Failed to generate sample data');
    return res.json();
  },

  async loadSamplePreset(preset: string, uploaderIdentity: string): Promise<Record<string, IngestionResponse>> {
    const res = await safeFetch(`/ingest/load-sample?preset=${encodeURIComponent(preset)}`, {
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
    const res = await safeFetch('/ingest/reset', {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset system data');
    return res.json();
  },

  async getAuditLogs(recordType?: string): Promise<AuditLogEntry[]> {
    const path = recordType
      ? `/audit-logs?record_type=${encodeURIComponent(recordType)}`
      : '/audit-logs';
    const res = await safeFetch(path);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getSession(): Promise<AdminUser> {
    const res = await safeFetch('/auth/session');
    if (!res.ok) throw new Error('Failed to fetch admin session');
    return res.json();
  },

  async login(username: string, password: string): Promise<AdminUser> {
    const res = await safeFetch('/auth/login', {
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

    const res = await safeFetch(`/queue?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch triage queue');
    return res.json();
  },

  async submitDecision(decision: DecisionRequest): Promise<DecisionResponse> {
    const res = await safeFetch('/decision', {
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
    const res = await safeFetch('/queue/geography');
    if (!res.ok) throw new Error('Failed to fetch hierarchy risk data');
    return res.json();
  },

  async getCandidateDrilldown(candidateId: string): Promise<CandidateDrilldownResponse> {
    const res = await safeFetch(`/drilldown/${encodeURIComponent(candidateId)}`);
    if (!res.ok) throw new Error(`Failed to load drilldown for candidate ${candidateId}`);
    return res.json();
  },

  async downloadDossierPdf(candidateId: string): Promise<void> {
    const res = await safeFetch(`/dossier/${encodeURIComponent(candidateId)}`);
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

  async getDetectionResults(): Promise<DetectionResultsResponse> {
    const res = await safeFetch('/detection/results');
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

    const res = await safeFetch(`/ingest/preview/${recordType}?${searchParams.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw err.detail || new Error(`Failed to load dataset preview for ${recordType}`);
    }
    return res.json();
  },
};
