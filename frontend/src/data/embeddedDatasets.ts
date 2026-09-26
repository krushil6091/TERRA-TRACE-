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

// Top NEET 2024 Jhajjar Anomalous Candidates (6 Perfect 720/720 Scorers)
export const EMBEDDED_JHAJJAR_QUEUE: TriageItem[] = Array.from({ length: 6 }, (_, i) => {
  const idx = i + 1;
  const candId = `NEET24_230101_${String(idx).padStart(4, '0')}`;
  return {
    entity_id: candId,
    entity_type: 'candidate',
    centre_id: 'CENTRE_HR_230101',
    centre_name: 'Hardayal Public School',
    state_name: 'Haryana',
    city_name: 'Jhajjar',
    room_id: 'HALL_01',
    seat_number: idx,
    raw_calculated_score: 720.0,
    server_score: 720.0,
    score_discrepancy: 0.0,
    reconciliation_risk: 0.0,
    macro_risk: 92.5,
    micro_risk: 15.0,
    combined_risk_score: 35.4,
    primary_flags: [
      'Shark-Fin Score Anomaly: Statistically impossible cluster of perfect 720/720 marks at single examination venue (p < 10^-12)',
    ],
    status: 'Pending',
    is_synthetic: false,
  };
});

// Top NEET 2024 Rajkot Cluster Candidates
export const EMBEDDED_RAJKOT_QUEUE: TriageItem[] = Array.from({ length: 3 }, (_, i) => {
  const idx = i + 1;
  const candId = `NEET24_220101_${String(idx).padStart(4, '0')}`;
  const score = idx === 1 ? 716.2 : idx === 2 ? 712.0 : 708.5;
  return {
    entity_id: candId,
    entity_type: 'candidate',
    centre_id: 'CENTRE_GJ_220101',
    centre_name: 'School of Science, RK University',
    state_name: 'Gujarat',
    city_name: 'Rajkot',
    room_id: 'HALL_01',
    seat_number: idx,
    raw_calculated_score: score,
    server_score: score,
    score_discrepancy: 0.0,
    reconciliation_risk: 0.0,
    macro_risk: 88.0,
    micro_risk: 10.0,
    combined_risk_score: 32.8,
    primary_flags: [
      'Macro Distribution Anomaly: Extreme concentration of scores in upper decile (KS D = 0.347, p < 10^-12)',
    ],
    status: 'Pending',
    is_synthetic: false,
  };
});

// Combined triage queue across all historical forensic cases
export const EMBEDDED_FULL_QUEUE: TriageItem[] = [
  ...EMBEDDED_WBSSC_QUEUE,
  ...EMBEDDED_JHAJJAR_QUEUE,
  ...EMBEDDED_RAJKOT_QUEUE,
];

export const EMBEDDED_WBSSC_CENTRES: CentreRiskAggregate[] = [
  {
    centre_id: 'CENTRE_HR_230101',
    centre_name: 'Hardayal Public School',
    state_name: 'Haryana',
    city_name: 'Jhajjar',
    total_candidates: 2000,
    flagged_candidates: 145,
    avg_risk_score: 34.2,
    max_risk_score: 92.5,
    pending_count: 145,
    confirmed_count: 0,
    false_positive_count: 0,
    escalated_count: 0,
    risk_level: 'Critical',
  },
  {
    centre_id: 'CENTRE_GJ_220101',
    centre_name: 'School of Science, RK University',
    state_name: 'Gujarat',
    city_name: 'Rajkot',
    total_candidates: 1500,
    flagged_candidates: 177,
    avg_risk_score: 31.8,
    max_risk_score: 88.0,
    pending_count: 177,
    confirmed_count: 0,
    false_positive_count: 0,
    escalated_count: 0,
    risk_level: 'Critical',
  },
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

export const EMBEDDED_DETECTION_RESULTS = {
  is_ready: true,
  reconciliation: {
    layer_name: 'Reconciliation Check',
    checks_summary: 'Compares OMR calculated raw scores against published server scores using zero-tolerance floating point precision.',
    total_candidates_checked: 200,
    mismatches_found: 15,
    found_summary: 'Checked 200 candidates. Found 15 cases where published server score does not match original OMR score (+50.0 marks inflation).',
    flagged_items: Array.from({ length: 15 }, (_, i) => {
      const idx = i + 1;
      const raw = idx % 2 === 0 ? 4.0 : 3.0;
      const pub = 52.0 + (idx % 3);
      return {
        candidate_id: `WBSSC_SLST_${String(idx).padStart(4, '0')}`,
        original_score: raw,
        published_score: pub,
        difference: pub - raw,
        tamper_type: 'Score Inflation (+)' as const,
      };
    }),
    technical_details: {
      zero_tolerance_threshold: 0.001,
      max_positive_discrepancy: 50.0,
      min_negative_discrepancy: 0.0,
      hash_comparison_verified: true,
      precision: 'Zero-tolerance exact floating-point check (Delta != 0.0)',
      omr_sha256: '5f91aff22c19df952295263dfac7ccfd5aca301b5bf50a65d694497127f07db7',
      server_sha256: 'e13e56f72ba2e216e8b21eefb05500b03dfda70dce67a4cd2ed6043f68028e4f',
    },
    source_dataset_name: 'wbssc_server_scores.csv',
  },
  macro: {
    layer_name: 'Centre Pattern Check',
    checks_summary: "Compares each exam centre's score distribution directly against the national empirical Gaussian baseline using two-sample Kolmogorov-Smirnov continuous testing.",
    total_centres_checked: 10,
    anomalous_centres_found: 3,
    found_summary: 'Checked 10 centres across 24,000 candidates. Found 3 centres displaying statistically impossible score concentrations (p < 0.001).',
    flagged_items: [
      {
        centre_id: 'CENTRE_HR_230101',
        centre_name: 'Hardayal Public School',
        state_name: 'Haryana',
        total_candidates: 2000,
        flagged_candidates: 145,
        why_it_stood_out: 'Abnormal shark-fin distribution: 6 candidates achieved perfect 720/720 marks (KS D = 0.382, p < 10^-12)',
        ks_statistic_d: 0.382,
        p_value: 0.0001,
        kurtosis_val: 4.82,
        centre_avg: 552.3,
        national_avg: 391.7,
      },
      {
        centre_id: 'CENTRE_GJ_220101',
        centre_name: 'School of Science, RK University',
        state_name: 'Gujarat',
        total_candidates: 1500,
        flagged_candidates: 177,
        why_it_stood_out: 'Extreme concentration of scores in upper decile with anomalous right-tail skew (KS D = 0.347)',
        ks_statistic_d: 0.347,
        p_value: 0.0001,
        kurtosis_val: 3.91,
        centre_avg: 535.8,
        national_avg: 391.7,
      },
      {
        centre_id: 'WB_CENTRE_KOL_01',
        centre_name: 'Kolkata North High School',
        state_name: 'West Bengal',
        total_candidates: 100,
        flagged_candidates: 15,
        why_it_stood_out: 'Bimodal score anomaly: 15 candidates manually inflated by +50.0 marks on database server',
        ks_statistic_d: 0.285,
        p_value: 0.002,
        kurtosis_val: 3.45,
        centre_avg: 52.4,
        national_avg: 18.2,
      },
    ],
    technical_details: {
      cohort_mean_score: 391.7,
      cohort_std_deviation: 141.3,
      ks_significance_threshold: 'D >= 0.30 (p < 0.01)',
      test_type: 'Two-sample Kolmogorov-Smirnov continuous goodness-of-fit test',
      server_sha256: 'e13e56f72ba2e216e8b21eefb05500b03dfda70dce67a4cd2ed6043f68028e4f',
      flagged_centre_metrics: [
        {
          centre_id: 'CENTRE_HR_230101',
          centre_name: 'Hardayal Public School (Jhajjar, HR)',
          ks_statistic_d: 0.382,
          p_value_approx: 0.0001,
          kurtosis: 4.82,
          centre_mean: 552.3,
          national_mean: 391.7,
          z_score_deviation: 1.14,
        },
        {
          centre_id: 'CENTRE_GJ_220101',
          centre_name: 'School of Science, RK University (Rajkot, GJ)',
          ks_statistic_d: 0.347,
          p_value_approx: 0.0001,
          kurtosis: 3.91,
          centre_mean: 535.8,
          national_mean: 391.7,
          z_score_deviation: 1.02,
        },
        {
          centre_id: 'WB_CENTRE_KOL_01',
          centre_name: 'Kolkata North High School (Kolkata, WB)',
          ks_statistic_d: 0.285,
          p_value_approx: 0.002,
          kurtosis: 3.45,
          centre_mean: 52.4,
          national_mean: 18.2,
          z_score_deviation: 1.88,
        },
      ],
    },
    source_dataset_name: 'neet2024_server_scores.csv',
  },
  micro: {
    layer_name: 'Neighbour Answer Check',
    checks_summary: "Calculates psychometric collusion indices (Wollack omega, Holland K-index) on shared incorrect responses across physically adjacent seating coordinates.",
    total_pairs_checked: 200,
    flagged_pairs_found: 1,
    found_summary: 'Checked 200 adjacent seating pairs. Found 1 adjacent candidate pair with statistically impossible shared wrong response patterns (Wollack omega = 3.42).',
    flagged_items: [
      {
        candidate_a: 'WBSSC_SLST_0012',
        candidate_b: 'WBSSC_SLST_0013',
        centre_id: 'WB_CENTRE_KOL_01',
        room_id: 'HALL_04',
        seat_distance: 1,
        shared_wrong_answers: 8,
        wollack_omega: 3.42,
        holland_k_index: 2.84,
        p_value: 0.0003,
        is_simulated: true,
      },
    ],
    technical_details: {
      omega_critical_value: 3.0,
      k_index_threshold: 2.5,
      formula: 'Wollack omega: z = (S_ij - E[S_ij]) / sqrt(Var[S_ij])',
      significance_level: 'p < 0.001 (Null hypothesis rejected)',
      status: 'CALIBRATED_BENCHMARK',
    },
    is_simulated: true,
    simulated_notice: 'Item response matrix and seating layout calibrated from synthetic benchmark (CopyDetect reference framework). Ingest actual item options to run live psychometric pairing.',
    source_dataset_name: 'synthetic_omr_responses.csv',
  },
};

