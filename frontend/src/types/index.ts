export type RecordType = 'omr' | 'server' | 'seating';

export interface DatasetStatus {
  record_type: RecordType;
  is_ingested: boolean;
  filename?: string | null;
  file_hash_sha256?: string | null;
  row_count: number;
  candidate_count: number;
  is_synthetic: boolean;
  last_updated?: string | null;
}

export interface IngestionResponse {
  success: boolean;
  record_type: RecordType;
  filename: string;
  file_hash_sha256: string;
  row_count: number;
  columns_found: string[];
  is_synthetic: boolean;
  uploader_identity: string;
  timestamp: string;
  message: string;
}

export interface ValidationErrorDetail {
  error: string;
  record_type: RecordType;
  missing_columns: string[];
  present_columns: string[];
  required_columns: string[];
  message: string;
}

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  record_type: string;
  filename: string;
  file_hash: string;
  file_size_bytes: number;
  row_count: number;
  uploader_identity: string;
  is_synthetic: boolean;
  status: 'SUCCESS' | 'VALIDATION_ERROR' | 'SYSTEM_ERROR';
  details?: string | null;
}

export interface AdminUser {
  id: string;
  username: string;
  full_name: string;
  badge_id: string;
  role: string;
  organization: string;
  is_authenticated: boolean;
}

export type InvestigationStatus = 'Pending' | 'Confirmed' | 'False Positive' | 'Escalated';
export type EntityType = 'candidate' | 'centre';

export interface TriageItem {
  entity_id: string;
  entity_type: EntityType;
  centre_id: string;
  centre_name: string;
  state_name: string;
  city_name: string;
  room_id?: string | null;
  seat_number?: number | null;
  raw_calculated_score?: number | null;
  server_score?: number | null;
  score_discrepancy?: number | null;
  reconciliation_risk: number;
  macro_risk: number;
  micro_risk: number;
  combined_risk_score: number;
  primary_flags: string[];
  status: InvestigationStatus;
  last_decision_by?: string | null;
  last_decision_at?: string | null;
  last_decision_justification?: string | null;
  is_synthetic: boolean;
}

export interface TriageSummaryCounts {
  total_flagged: number;
  pending: number;
  confirmed: number;
  false_positive: number;
  escalated: number;
  high_risk_count: number;
}

export interface TriageQueueResponse {
  items: TriageItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  summary: TriageSummaryCounts;
  is_synthetic_active: boolean;
}

export interface DecisionRequest {
  entity_id: string;
  entity_type: EntityType;
  status: InvestigationStatus;
  justification: string;
  investigator_identity?: string;
}

export interface DecisionResponse {
  success: boolean;
  decision_id: number;
  entity_id: string;
  entity_type: EntityType;
  previous_status: InvestigationStatus;
  new_status: InvestigationStatus;
  justification: string;
  investigator_identity: string;
  timestamp: string;
  message: string;
}

export interface CentreRiskAggregate {
  centre_id: string;
  centre_name: string;
  state_name: string;
  city_name: string;
  total_candidates: number;
  flagged_candidates: number;
  avg_risk_score: number;
  max_risk_score: number;
  pending_count: number;
  confirmed_count: number;
  false_positive_count: number;
  escalated_count: number;
  risk_level: string;
}

export interface HierarchyRiskResponse {
  centres: CentreRiskAggregate[];
  total_centres: number;
  total_flagged_centres: number;
  is_synthetic: boolean;
}

// Drilldown types
export interface QuestionResponseItem {
  question_id: string;
  selected_option?: string | null;
  raw_score: number;
}

export interface DistributionPoint {
  score: number;
  centre_density: number;
  national_density: number;
}

export interface MacroDistributionData {
  centre_id: string;
  centre_name: string;
  points: DistributionPoint[];
  centre_mean: number;
  centre_std: number;
  national_mean: number;
  national_std: number;
  ks_statistic_d: number;
  ks_p_value_approx: number;
  divergence_summary: string;
}

export interface RoomSeatCandidate {
  seat_number: number;
  candidate_id: string;
  score: number;
  risk_score: number;
  is_target: boolean;
  is_flagged_pair: boolean;
  status: InvestigationStatus;
}

export interface CollusionPair {
  candidate_1: string;
  candidate_2: string;
  seat_1: number;
  seat_2: number;
  distance: number;
  shared_incorrect_answers: number;
  omega_index_approx: number;
  evidence_note: string;
}

export interface MicroSeatingData {
  room_id: string;
  total_seats: number;
  candidates: RoomSeatCandidate[];
  collusion_pairs: CollusionPair[];
  cluster_detected: boolean;
}

export interface ReconciliationDetail {
  raw_total_score: number;
  server_score: number;
  score_discrepancy: number;
  tamper_flag: boolean;
  tamper_type: string;
  tamper_explanation: string;
  question_items: QuestionResponseItem[];
}

export interface CandidateDrilldownResponse {
  candidate_id: string;
  centre_id: string;
  centre_name: string;
  state_name: string;
  city_name: string;
  room_id: string;
  seat_number: number;
  combined_risk_score: number;
  reconciliation_risk: number;
  macro_risk: number;
  micro_risk: number;
  primary_flags: string[];
  status: InvestigationStatus;
  reconciliation: ReconciliationDetail;
  macro: MacroDistributionData;
  micro: MicroSeatingData;
  decision_history: Array<{
    id: number;
    timestamp: string;
    entity_id: string;
    entity_type: string;
    previous_status: string;
    new_status: string;
    justification: string;
    investigator_identity: string;
  }>;
  audit_hashes: {
    omr_sha256: string;
    server_sha256: string;
    seating_sha256: string;
  };
  is_synthetic: boolean;
  generated_at: string;
}

export interface ReconciliationResultItem {
  candidate_id: string;
  original_score: number;
  published_score: number;
  difference: number;
  tamper_type: string;
}

export interface ReconciliationDetectionResult {
  layer_name: string;
  checks_summary: string;
  total_candidates_checked: number;
  mismatches_found: number;
  found_summary: string;
  flagged_items: ReconciliationResultItem[];
  technical_details: Record<string, any>;
  source_dataset_name: string;
}

export interface MacroResultItem {
  centre_id: string;
  centre_name: string;
  state_name: string;
  total_candidates: number;
  flagged_candidates?: number;
  why_it_stood_out: string;
  ks_statistic_d: number;
  p_value: number;
  kurtosis_val: number;
  centre_avg: number;
  national_avg: number;
}

export interface MacroDetectionResult {
  layer_name: string;
  checks_summary: string;
  total_centres_checked: number;
  anomalous_centres_found: number;
  found_summary: string;
  flagged_items: MacroResultItem[];
  technical_details: Record<string, any>;
  source_dataset_name: string;
}

export interface MicroResultItem {
  candidate_a: string;
  candidate_b: string;
  centre_id: string;
  room_id: string;
  seat_distance: number;
  shared_wrong_answers: number;
  total_source_errors: number;
  omega_index: number;
  k_index_p_val: number;
}

export interface MicroDetectionResult {
  layer_name: string;
  is_simulated: boolean;
  simulated_notice: string;
  checks_summary: string;
  total_pairs_checked: number;
  flagged_pairs_found: number;
  found_summary: string;
  flagged_items: MicroResultItem[];
  technical_details: Record<string, any>;
  source_dataset_name: string;
}

export interface DetectionResultsResponse {
  is_ready: boolean;
  reconciliation: ReconciliationDetectionResult;
  macro: MacroDetectionResult;
  micro: MicroDetectionResult;
}

export interface DatasetRowPreview {
  data: Record<string, any>;
  is_proven_wrong: boolean;
  verdict?: string | null;
  highlighted_columns: string[];
  evidence_diff?: Record<string, any> | null;
}

export interface DatasetPreviewResponse {
  record_type: RecordType;
  filename: string;
  total_rows: number;
  flagged_rows_count: number;
  columns: string[];
  rows: DatasetRowPreview[];
  is_synthetic: boolean;
}

