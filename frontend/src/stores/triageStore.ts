import { create } from 'zustand';
import type {
  TriageItem,
  TriageSummaryCounts,
  InvestigationStatus,
  EntityType,
  CentreRiskAggregate,
} from '../types';
import { api } from '../services/api';

interface DecisionModalState {
  isOpen: boolean;
  item: TriageItem | null;
  targetStatus: InvestigationStatus;
}

interface TriageStoreState {
  items: TriageItem[];
  summary: TriageSummaryCounts;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusFilter: InvestigationStatus | 'All';
  searchQuery: string;
  minRiskFilter: number;
  selectedCentreId: string | null;
  isLoading: boolean;
  isSubmittingDecision: boolean;
  decisionModal: DecisionModalState;
  hierarchyCentres: CentreRiskAggregate[];
  isLoadingHierarchy: boolean;
  isSyntheticActive: boolean;

  fetchQueue: () => Promise<void>;
  fetchHierarchy: () => Promise<void>;
  setStatusFilter: (status: InvestigationStatus | 'All') => void;
  setSearchQuery: (query: string) => void;
  setMinRiskFilter: (minRisk: number) => void;
  setSelectedCentreId: (centreId: string | null) => void;
  setPage: (page: number) => void;
  openDecisionModal: (item: TriageItem, targetStatus: InvestigationStatus) => void;
  closeDecisionModal: () => void;
  submitDecision: (
    entityId: string,
    entityType: EntityType,
    status: InvestigationStatus,
    justification: string,
    investigatorIdentity: string
  ) => Promise<boolean>;
}

const initialSummary: TriageSummaryCounts = {
  total_flagged: 0,
  pending: 0,
  confirmed: 0,
  false_positive: 0,
  escalated: 0,
  high_risk_count: 0,
};

export const useTriageStore = create<TriageStoreState>((set, get) => ({
  items: [],
  summary: initialSummary,
  total: 0,
  page: 1,
  limit: 25,
  totalPages: 1,
  statusFilter: 'All',
  searchQuery: '',
  minRiskFilter: 0,
  selectedCentreId: null,
  isLoading: false,
  isSubmittingDecision: false,
  decisionModal: {
    isOpen: false,
    item: null,
    targetStatus: 'Confirmed',
  },
  hierarchyCentres: [],
  isLoadingHierarchy: false,
  isSyntheticActive: false,

  fetchQueue: async () => {
    set({ isLoading: true });
    const { statusFilter, searchQuery, minRiskFilter, selectedCentreId, page, limit } = get();

    // If centre is selected from heatmap, append or search by centre
    const effectiveSearch = selectedCentreId
      ? searchQuery
        ? `${searchQuery} ${selectedCentreId}`
        : selectedCentreId
      : searchQuery;

    try {
      const response = await api.getTriageQueue({
        status: statusFilter === 'All' ? undefined : statusFilter,
        search: effectiveSearch || undefined,
        min_risk: minRiskFilter > 0 ? minRiskFilter : undefined,
        page,
        limit,
      });

      set({
        items: response.items,
        summary: response.summary,
        total: response.total,
        totalPages: response.total_pages,
        isSyntheticActive: response.is_synthetic_active,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to fetch triage queue:', err);
      set({ isLoading: false });
    }
  },

  fetchHierarchy: async () => {
    set({ isLoadingHierarchy: true });
    try {
      const res = await api.getHierarchyRisk();
      set({
        hierarchyCentres: res.centres,
        isLoadingHierarchy: false,
      });
    } catch (err) {
      console.error('Failed to fetch hierarchy risk:', err);
      set({ isLoadingHierarchy: false });
    }
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status, page: 1 });
    get().fetchQueue();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, page: 1 });
    get().fetchQueue();
  },

  setMinRiskFilter: (minRisk) => {
    set({ minRiskFilter: minRisk, page: 1 });
    get().fetchQueue();
  },

  setSelectedCentreId: (centreId) => {
    set({ selectedCentreId: centreId, page: 1 });
    get().fetchQueue();
  },

  setPage: (page) => {
    set({ page });
    get().fetchQueue();
  },

  openDecisionModal: (item, targetStatus) => {
    set({
      decisionModal: {
        isOpen: true,
        item,
        targetStatus,
      },
    });
  },

  closeDecisionModal: () => {
    set({
      decisionModal: {
        isOpen: false,
        item: null,
        targetStatus: 'Confirmed',
      },
    });
  },

  submitDecision: async (entityId, entityType, status, justification, investigatorIdentity) => {
    set({ isSubmittingDecision: true });
    try {
      await api.submitDecision({
        entity_id: entityId,
        entity_type: entityType,
        status,
        justification,
        investigator_identity: investigatorIdentity,
      });

      // Live update in Zustand items state
      set((state) => {
        const now = new Date().toISOString();
        const updatedItems = state.items.map((it) => {
          if (it.entity_id === entityId) {
            return {
              ...it,
              status,
              last_decision_by: investigatorIdentity,
              last_decision_at: now,
              last_decision_justification: justification,
            };
          }
          return it;
        });
        return {
          items: updatedItems,
          isSubmittingDecision: false,
          decisionModal: { isOpen: false, item: null, targetStatus: 'Confirmed' },
        };
      });

      // Refetch summary and hierarchy in background
      await get().fetchQueue();
      await get().fetchHierarchy();
      return true;
    } catch (err) {
      console.error('Decision submission failed:', err);
      set({ isSubmittingDecision: false });
      throw err;
    }
  },
}));
