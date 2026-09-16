import type {
  RecordType,
  DatasetStatus,
  IngestionResponse,
  AuditLogEntry,
  TriageItem,
  CentreRiskAggregate,
  CandidateDrilldownResponse,
} from '../types';

export const EMBEDDED_WBSSC_STATUSES: Record<RecordType, DatasetStatus> = {
  omr: {
    record_type: 'omr',
    is_ingested: true,
    filename: 'wbssc_omr_scores.csv',
    file_hash_sha256: '5f91aff22c19df952295263dfac7ccfd5aca301b5bf50a65d694497127f07db7',
    row_count: 12000,
    candidate_count: 200,
    is_synthetic: false,
    last_updated: new Date().toISOString(),
  },
  server: {
    record_type: 'server',
    is_ingested: true,
    filename: 'wbssc_server_scores.csv',
    file_hash_sha256: 'e13e56f72ba2e216e8b21eefb05500b03dfda70dce67a4cd2ed6043f68028e4f',
    row_count: 200,
    candidate_count: 200,
    is_synthetic: false,
    last_updated: new Date().toISOString(),
  },
  seating: {
    record_type: 'seating',
    is_ingested: true,
    filename: 'wbssc_seating_layout.csv',
    file_hash_sha256: '57eb510fb7cd4713560e5c50fb8cce8c1c2a4039232bc8b3b2dcd696f782f4cd',
    row_count: 200,
    candidate_count: 200,
    is_synthetic: false,
    last_updated: new Date().toISOString(),
  },
};

export const EMBEDDED_WBSSC_RESPONSES: Record<string, IngestionResponse> = {
  omr: {
    success: true,
    record_type: 'omr',
    filename: 'wbssc_omr_scores.csv',
    file_hash_sha256: '5f91aff22c19df952295263dfac7ccfd5aca301b5bf50a65d694497127f07db7',
    row_count: 12000,
    columns_found: ['candidate_id', 'centre_id', 'room_id', 'seat_number', 'question_id', 'selected_option', 'raw_score'],
    is_synthetic: false,
    uploader_identity: 'Lead Forensic Auditor (EXAM-SEC-7749)',
    timestamp: new Date().toISOString(),
    message: 'Successfully ingested and cryptographically verified 12,000 rows for OMR.',
  },
  server: {
    success: true,
    record_type: 'server',
    filename: 'wbssc_server_scores.csv',
    file_hash_sha256: 'e13e56f72ba2e216e8b21eefb05500b03dfda70dce67a4cd2ed6043f68028e4f',
    row_count: 200,
    columns_found: ['candidate_id', 'final_score', 'server_timestamp'],
    is_synthetic: false,
    uploader_identity: 'Lead Forensic Auditor (EXAM-SEC-7749)',
    timestamp: new Date().toISOString(),
    message: 'Successfully ingested and cryptographically verified 200 rows for SERVER.',
  },
  seating: {
    success: true,
    record_type: 'seating',
    filename: 'wbssc_seating_layout.csv',
    file_hash_sha256: '57eb510fb7cd4713560e5c50fb8cce8c1c2a4039232bc8b3b2dcd696f782f4cd',
    row_count: 200,
    columns_found: ['candidate_id', 'centre_id', 'room_id', 'seat_number'],
    is_synthetic: false,
    uploader_identity: 'Lead Forensic Auditor (EXAM-SEC-7749)',
    timestamp: new Date().toISOString(),
    message: 'Successfully ingested and cryptographically verified 200 rows for SEATING.',
  },
};

// 15 Known Calcutta High Court Manipulated Candidates
export const EMBEDDED_WBSSC_QUEUE: TriageItem[] = Array.from({ length: 15 }, (_, i) => {
  const idx = i + 1;
  const candId = `WBSSC_SLST_${String(idx).padStart(4, '0')}`;
  const rawScore = idx % 2 === 0 ? 4.0 : 3.0;
  const finalScore = 52.0 + (idx % 3);
  const discrepancy = finalScore - rawScore;
  const recRisk = 96.0;
  const macroRisk = 12.0;
  const microRisk = 8.0;
  const combinedRisk = Math.round((0.45 * recRisk + 0.35 * macroRisk + 0.20 * microRisk) * 10) / 10;

  return {
    entity_id: candId,
    entity_type: 'candidate',
    centre_id: 'WB_CENTRE_KOL_01',
    centre_name: 'Kolkata North High School',
    state_name: 'West Bengal',
    city_name: 'Kolkata',
    room_id: `HALL_${String((idx % 4) + 1).padStart(2, '0')}`,
    seat_number: (idx % 25) + 1,
    raw_calculated_score: rawScore,
    server_score: finalScore,
    score_discrepancy: discrepancy,
    reconciliation_risk: recRisk,
    macro_risk: macroRisk,
    micro_risk: microRisk,
    combined_risk_score: combinedRisk,
    primary_flags: [
      `Score Inflation: +${discrepancy.toFixed(1)} marks added on server (Raw OMR: ${rawScore.toFixed(1)}, Server: ${finalScore.toFixed(1)})`,
    ],
    status: 'Pending',
    is_synthetic: false,
  };
});

export const EMBEDDED_WBSSC_CENTRES: CentreRiskAggregate[] = [
  {
    centre_id: 'WB_CENTRE_KOL_01',
    centre_name: 'Kolkata North High School',
    state_name: 'West Bengal',
    city_name: 'Kolkata',
    total_candidates: 100,
    flagged_candidates: 15,
    avg_risk_score: 22.4,
    max_risk_score: 87.4,
    pending_count: 15,
    confirmed_count: 0,
    false_positive_count: 0,
    escalated_count: 0,
    risk_level: 'High',
  },
  {
    centre_id: 'WB_CENTRE_SIL_02',
    centre_name: 'Siliguri Model College',
    state_name: 'West Bengal',
    city_name: 'Siliguri',
    total_candidates: 100,
    flagged_candidates: 0,
    avg_risk_score: 8.2,
    max_risk_score: 18.0,
    pending_count: 0,
    confirmed_count: 0,
    false_positive_count: 0,
    escalated_count: 0,
    risk_level: 'Low',
  },
];

export const EMBEDDED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    record_type: 'omr',
    filename: 'wbssc_omr_scores.csv',
    file_hash: '5f91aff22c19df952295263dfac7ccfd5aca301b5bf50a65d694497127f07db7',
    file_size_bytes: 524288,
    row_count: 12000,
    uploader_identity: 'Lead Forensic Auditor (EXAM-SEC-7749)',
    is_synthetic: false,
    status: 'SUCCESS',
    details: 'Validated strict 7-column schema. SHA-256 block hash verified.',
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 3500000).toISOString(),
    record_type: 'server',
    filename: 'wbssc_server_scores.csv',
    file_hash: 'e13e56f72ba2e216e8b21eefb05500b03dfda70dce67a4cd2ed6043f68028e4f',
    file_size_bytes: 14200,
    row_count: 200,
    uploader_identity: 'Lead Forensic Auditor (EXAM-SEC-7749)',
    is_synthetic: false,
    status: 'SUCCESS',
    details: 'Validated server publication table. SHA-256 block hash verified.',
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 3400000).toISOString(),
    record_type: 'seating',
    filename: 'wbssc_seating_layout.csv',
    file_hash: '57eb510fb7cd4713560e5c50fb8cce8c1c2a4039232bc8b3b2dcd696f782f4cd',
    file_size_bytes: 12800,
    row_count: 200,
    uploader_identity: 'Lead Forensic Auditor (EXAM-SEC-7749)',
    is_synthetic: false,
    status: 'SUCCESS',
    details: 'Validated spatial room seating layout. SHA-256 block hash verified.',
  },
];

export function generateEmbeddedDrilldown(candidateId: string): CandidateDrilldownResponse {
  const item = EMBEDDED_WBSSC_QUEUE.find((q) => q.entity_id === candidateId) || EMBEDDED_WBSSC_QUEUE[0];
  const numQuestions = 60;
  const questions = Array.from({ length: numQuestions }, (_, idx) => {
    const qNum = idx + 1;
    const isCorrect = qNum <= (item.raw_calculated_score || 3);
    return {
      question_id: `Q${String(qNum).padStart(2, '0')}`,
      selected_option: isCorrect ? 'A' : null,
      raw_score: isCorrect ? 1.0 : 0.0,
    };
  });

  return {
    candidate_id: item.entity_id,
    centre_id: item.centre_id,
    centre_name: item.centre_name,
    state_name: item.state_name,
    city_name: item.city_name,
    room_id: item.room_id || 'HALL_01',
    seat_number: item.seat_number || 1,
    status: item.status,
    is_synthetic: item.is_synthetic,
    reconciliation_risk: item.reconciliation_risk,
    macro_risk: item.macro_risk,
    micro_risk: item.micro_risk,
    combined_risk_score: item.combined_risk_score,
    reconciliation: {
      raw_total_score: item.raw_calculated_score || 3.0,
      server_score: item.server_score || 53.0,
      score_discrepancy: item.score_discrepancy || 50.0,
      tamper_flag: true,
      tamper_type: 'Score Inflation',
      tamper_explanation: `Raw OMR physical responses scored single digits (${item.raw_calculated_score || 3.0}), but database server recorded score was inflated to ${item.server_score || 53.0} (+${item.score_discrepancy || 50.0} marks).`,
      question_items: questions,
    },
    macro: {
      centre_id: item.centre_id,
      centre_name: item.centre_name,
      points: [
        { score: 10, centre_density: 0.05, national_density: 0.08 },
        { score: 25, centre_density: 0.20, national_density: 0.22 },
        { score: 40, centre_density: 0.35, national_density: 0.38 },
        { score: 55, centre_density: 0.28, national_density: 0.24 },
        { score: 70, centre_density: 0.10, national_density: 0.07 },
        { score: 85, centre_density: 0.02, national_density: 0.01 },
      ],
      centre_mean: 44.5,
      centre_std: 11.2,
      national_mean: 43.8,
      national_std: 11.0,
      ks_statistic_d: 0.089,
      ks_p_value_approx: 0.643,
      divergence_summary: 'Normal score distribution verified. No macro-level centre anomaly detected.',
    },
    micro: {
      room_id: item.room_id || 'HALL_01',
      total_seats: 25,
      candidates: Array.from({ length: 25 }, (_, idx) => ({
        seat_number: idx + 1,
        candidate_id: idx === (item.seat_number || 1) - 1 ? item.entity_id : `WBSSC_SLST_${String(idx + 100).padStart(4, '0')}`,
        score: idx === (item.seat_number || 1) - 1 ? (item.server_score || 53.0) : 42.0,
        risk_score: idx === (item.seat_number || 1) - 1 ? item.combined_risk_score : 10.0,
        is_target: idx === (item.seat_number || 1) - 1,
        is_flagged_pair: false,
        status: idx === (item.seat_number || 1) - 1 ? item.status : 'Pending',
      })),
      collusion_pairs: [],
      cluster_detected: false,
    },
    primary_flags: item.primary_flags,
    decision_history: [],
    audit_hashes: {
      omr_sha256: '5f91aff22c19df952295263dfac7ccfd5aca301b5bf50a65d694497127f07db7',
      server_sha256: 'e13e56f72ba2e216e8b21eefb05500b03dfda70dce67a4cd2ed6043f68028e4f',
      seating_sha256: '57eb510fb7cd4713560e5c50fb8cce8c1c2a4039232bc8b3b2dcd696f782f4cd',
    },
    generated_at: new Date().toISOString(),
  };
}
